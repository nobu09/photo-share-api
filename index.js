// typeDefs 変数に文字列としてスキーマを定義
const typeDefs = `
  type Query {
    totalPhotos: Int!
  }
`

// totalPhotos というクエリを作成したので、スキーマと同じ名前のリゾルバ関数を定義する必要がある
// 静的に42を返す
const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
}

