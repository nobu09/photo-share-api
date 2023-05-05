// apollo-server モジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// typeDefs 変数に文字列としてスキーマを定義
const typeDefs = `
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
    taggedUser: [User!]!
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
    "githubUser": "gPlake"
  },
  {
    "id": "2",
    "name": "Enjoing the sunshine",
    "description": "The heart chute is one of my favorite chutes",
    "category": "SELFIE",
    "githubUser": "gPlake"
  },
  {
    "id": "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunvarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt"
  },
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
        ...args.input
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
    }
  },

  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
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

