// apollo-server モジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// typeDefs 変数に文字列としてスキーマを定義
const typeDefs = `
  # Photo 型を定義
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
  }

  # allPhotos は Photo を返す
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  # ミューテーションによって新たに投稿された Photo を返す
  type Mutation {
    postPhoto(name: String! description: String): Photo!
  }
`

// 写真を格納するための配列を定義
var photos = []

// totalPhotos というクエリを作成したので、スキーマと同じ名前のリゾルバ関数を定義する必要がある
// 写真を格納した配列の長さを返す
const resolvers = {
  Query: {
    totalPhotos: () => photos.length
  },

  // postPhoto ミューテーションと対応するリゾルバ
  // parent: 親オブジェクト（Mutation）への参照、root or obj、常にリゾルバの第一引数になる
  // args: この操作のために送られたGraphQL引数、{name,description} というオブジェクト
  Mutation: {
    postPhoto(parent, args) {
      photos.push(args)
      return true
    }
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

