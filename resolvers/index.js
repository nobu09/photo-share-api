const { GraphQLScalarType } = require(`graphql`)
const Mutation = require(`./Mutation`)

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
    Mutation,
  
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