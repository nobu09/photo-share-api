// apollo-server モジュールを読み込む
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { readFileSync } = require(`fs`)

const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`)
const resolvers = require(`./resolvers`)

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

// express()を呼び出しExpressアプリケーションを作成する
var app = express()

// サーバーのインスタンスを作成
// その際、typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

async function startServer(server) {
  await server.start()

  // applyMiddleware()を呼び出してExpreeにミドルウェアを追加
  server.applyMiddleware({ app })
}

startServer(server);

app.get(`/`, (_req, res) =>
  res.end(`Welcome to the PhotoShare API`)
)
app.get(`/playground`, expressPlayground({ endpoint: `graphql` }))

// 特定のポートでlistenする
app.listen({ port: 4000 }, () => 
  console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
)
