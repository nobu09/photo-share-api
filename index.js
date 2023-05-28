// apollo-server モジュールを読み込む
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)

const { GraphQLScalarType } = require(`graphql`)

// typeDefs 変数に文字列としてスキーマを定義
const typeDefs = `
  scalar DateTime

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  # Photo 型を定義
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  # allPhotos は Photo を返す
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  # ミューテーションによって新たに投稿された Photo を返す
  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`

// ユニークIDをインクリメントするための変数
var _id = 0

// ユーザーのサンプル
var users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
  { "githubLogin": "gPlake", "name": "Glen Plake" },
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]
var photos = [
  {
    "id": "1",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake",
    "created": "3-28-1977"
  },
  {
    "id": "2",
    "name": "Enjoing the sunshine",
    "description": "The heart chute is one of my favorite chutes",
    "category": "SELFIE",
    "githubUser": "gPlake",
    "created": "1-2-1985"
  },
  {
    "id": "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunvarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
    "created": "2018-04-15T19:09:57.308Z"
  },
]
var tags = [
  { "photoID": "1", "userID": "gPlake" },
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" },
]

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

// express()を呼び出しExpressアプリケーションを作成する
var app = express()

// サーバーのインスタンスを作成
// その際、typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
  typeDefs,
  resolvers
})

// applyMiddleware()を呼び出してExpreeにミドルウェアを追加
server.applyMiddleware({ app })

app.get(`/`, (_req, res) =>
  res.end(`Welcome to the PhotoShare API`)
)

// 特定のポートでlistenする
app.listen({ port: 4000 }, () => 
  console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
)
