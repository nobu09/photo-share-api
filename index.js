// apollo-server モジュールを読み込む
const { ApolloServer, PubSub } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { readFileSync } = require(`fs`)
const { MongoClient } = require(`mongodb`)
const { createServer } = require(`http`)
require (`dotenv`).config()

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

async function start() {
  const app = express()
  const MONGO_DB = process.env.DB_HOST
  let db

  try {
    const client = await MongoClient.connect(
      MONGO_DB,
      { useNewUrlParser: true }
    )
    db = client.db()
  } catch (error) {
    console.log(`

      Mongo DB Host not found!
      please add DB_HOST environment variable to .env file

      exiting...

    `)
    process.exit(1)
  }

  const pubsub = new PubSub()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
      const githubToken = req ? req.headers.authorization : connection.context.Authorization
      const currentUser = await db.collection(`users`).findOne({ githubToken })
      return { db, currentUser, pubsub }
    }
  })

  // applyMiddleware()を呼び出してExpreeにミドルウェアを追加
  server.applyMiddleware({ app })

  app.get(`/playground`, expressPlayground({ endpoint: `graphql` }))

  app.get('/', (req, res) => {
    let url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`
    res.end(`<a href="${url}">Sign In with Github</a>`)
  })

  const httpServer = createServer(app)
  // subscriptionを有効にする(WebSocketを使う)
  server.installSubscriptionHandlers(httpServer)

  // 特定のポートでlistenする
  httpServer.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
  )
}

start()