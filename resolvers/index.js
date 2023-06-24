const { GraphQLScalarType } = require(`graphql`)
const { authorizeWithGithub } = require('../lib')

// totalPhotos というクエリを作成したので、スキーマと同じ名前のリゾルバ関数を定義する必要がある
// 写真を格納した配列の長さを返す
const resolvers = {
    Query: {
      totalPhotos: (parent, args, { db }) => 
        db.collection(`photos`)
          .estimatedDocumentCount(),

      allPhotos: (parent, args, { db }) => 
        db.collection(`photos`)
          .find()
          .toArray(),

      totalUsers: (parent, args, { db }) =>
        db.collection(`users`)
          .estimatedDocumentCount(),

      allUsers: (parent, args, { db }) => 
        db.collection(`users`)
          .find()
          .toArray(),

      me: (parent, args,{ currentUser }) => {
        currentUser
      }
    },
  
    // postPhoto ミューテーションと対応するリゾルバ
    // parent: 親オブジェクト（Mutation）への参照、root or obj、常にリゾルバの第一引数になる
    // args: この操作のために送られたGraphQL引数、{name,description} というオブジェクト
    Mutation: {
      async postPhoto(parent, args, { db, currentUser })
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
        const { insertedIds } = await db.collection(`photos`).insert(newPhoto)
        newPhoto.id = insertedIds[0]
  
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
    
        const { ops:[user] } = await db
          .collection('users')
          .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })
    
        return { user, token: access_token }
      },
    },
  
    Photo: {
      id: parent => parent.id || parent._id,
      url: parent => `/img/${parent._id}.jpg`,
      postedBy: (parent, args, {db}) => {
        db.collection(`users`).findOne({ githubLogin: parent.userID })
      },
      taggedUsers: parent => tags
        // 対象の写真が関係しているタグの配列を返す
        .filter(tag => tag.photoID === parent.id)
        // タグの配列をユーザーIDの配列に変換
        .map(tag => tag.userID)
        // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
        .map(userID => users.find(user => user.githubLogin === userID))
    },
  
    User: {
      postedPhotos: parent => {
        return photos.filter(p => p.githubUser === parent.githubLogin)
      },
      inPhotos: parent => tags
        // 対象のユーザーが関連しているタグの配列を返す
        .filter(tag => tag.userId === parent.githubLogin)
        // タグの配列を写真IDの配列に変換する
        .map(tag => tag.photoID)
        // 写真IDの配列を写真オブジェクトの配列に変換する
        .map(photoID => photos.find(photo => photo.id === photoID) )
    },
  
    DateTime: new GraphQLScalarType({
      name: `DateTime`,
      description: `A valid date time value`,
      parseValue: value => new Date(value),
      serialize: value => new Date(value).toISOString(),
      parseLiteral: ast => ast.value
    }),
  } 

  module.exports = resolvers