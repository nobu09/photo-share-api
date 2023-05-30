const { GraphQLScalarType } = require(`graphql`)

// totalPhotos というクエリを作成したので、スキーマと同じ名前のリゾルバ関数を定義する必要がある
// 写真を格納した配列の長さを返す
const resolvers = {
    Query: {
      totalPhotos: () => photos.length,
      allPhotos: () => photos
    },
  
    // postPhoto ミューテーションと対応するリゾルバ
    // parent: 親オブジェクト（Mutation）への参照、root or obj、常にリゾルバの第一引数になる
    // args: この操作のために送られたGraphQL引数、{name,description} というオブジェクト
    Mutation: {
      postPhoto(parent, args) {
        // 新しい写真を作成し、idを生成する
        var newPhoto = {
          id: _id++,
          ...args.input,
          created: new Date()
        }
        photos.push(newPhoto)
  
        // 新しい写真を返す
        return newPhoto
      }
    },
  
    Photo: {
      url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
      postedBy: parent => {
        return users.find(u => u.githubLogin === parent.githubUser)
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
    })
  }

  module.exports = resolvers