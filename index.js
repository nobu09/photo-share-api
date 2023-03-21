// apollo-server モジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// typeDefs 変数に文字列としてスキーマを定義
const typeDefs = `
  type Query {
    totalPhotos: Int!
  }

  type Mutation {
    postPhoto(name: String!
      description: String): Boolean
  }
`

// 写真を格納するための配列を定義
var photos = []

// totalPhotos というクエリを作成したので、スキーマと同じ名前のリゾルバ関数を定義する必要がある
// 静的に42を返す
const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
}

// サーバーのインスタンスを作成
// その際、typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
  typeDefs,
  resolvers
})

// Webサーバーを起動
server
  .listen()
  .then(({url}) => console.log(`GraphQL Server running on ${url}`))

