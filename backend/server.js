const express = require('express')
const { json } = express
const cors = require('cors')
const dotenv = require('dotenv')
const session = require('express-session')
const { PrismaClient } = require("@prisma/client")
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const passport = require('passport')
const authRoutes = require("./routes/authRoutes/authRoutes.js")

dotenv.config()

const app = express()
const PORT = process.env.PORT
const prisma = new PrismaClient()
const sessionStore = new PrismaSessionStore(prisma, {
    checkPeriod : 2 * 60 * 1000,
    dbRecordIdIsSessionId : true,
    dbRecordIdFunction : undefined
})

app.use(json())
app.use(cors())
app.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized: false,
    cookie : {
    maxAge : 60 * 60 * 1000,
  },
  store : sessionStore,
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
