const { authorizeWithGithub } = require('../lib')
const fetch = require('node-fetch')

module.exports = {
  async postPhoto(root, args, { db, currentUser, pubsub })
  {
    // 1. コンテキストにユーザーがいなければエラーを投げる
    if (!currentUser) {
      throw new Error('only an authorized user can post a photo')
    }

    // 2. 現在のユーザーのIDとPhotoを保存する
    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    }

    // 3. 新しいphotoを追加して、データベースが生成したIDを取得する 
    const { insertedId } = await db.collection(`photos`).insertOne(newPhoto)
    newPhoto.id = insertedId

    // 新しいphotoを追加したことを通知する（photo-addedイベントをパブリッシュする）
    pubsub.publish('photo-added', { newPhoto })

    // 新しい写真を返す
    return newPhoto
  },

  async githubAuth(parent, { code }, { db }) {
    let {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    })
 
    if (message) {
      throw new Error(message)
    }
 
    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    }

    const updateResult = await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })
    const user  = await db.collection('users').findOne({ githubLogin: login })

    // 新しいuserを追加したことを通知する（user-addedイベントをパブリッシュする）
    pubsub.publish('user-added', { user })
  
    return { user, token: access_token }
  },

  addFakeUsers: async (root, { count }, { db }) => {
    const randomUserApi = `https://randomuser.me/api/?results=${count}`

    const { results } = await fetch(randomUserApi)
      .then(res => res.json())

      const users = results.map(r => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1
      }))

    await db.collection(`users`).insertMany(users)

    // 新しいuserを追加したことを通知する（user-addedイベントをパブリッシュする）
    users.forEach(newUser => {
      pubsub.publish(`user-added`, { newUser })
    })

    return users
  },

  async fakeUserAuth(parent, { githubLogin }, { db }) {
    const user = await db.collection(`users`).findOne({ githubLogin })

    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${githubLogin}"`)
    }

    return {
      token: user.githubToken,
      user
    }
  },
}