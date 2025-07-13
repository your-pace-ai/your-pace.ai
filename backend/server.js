const express = require('express')
const { json } = express
const cors = require('cors')
const dotenv = require('dotenv')
const session = require('express-session')
const { PrismaClient } = require("@prisma/client")
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const passport = require('passport')
const authRoutes = require("./routes/authRoutes/authRoutes.js")
const userRoutes = require("./routes/userRoutes/userRoutes.js")
const learningHubRoutes = require("./routes/hubRoutes/learningHubRoutes.js")
const subHubRoutes = require("./routes/hubRoutes/subHubRoutes.js")
const chapterRoutes = require("./routes/hubRoutes/chapterRoutes.js")
const postRoutes = require("./routes/postRoutes/postRoutes.js")
const communityRoutes = require("./routes/communityRoutes/communityRoutes.js")
const flashcardRoutes = require("./routes/hubRoutes/flashcardRoutes.js")
const quizRoutes = require("./routes/hubRoutes/quizRoutes.js")

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
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true,
}))
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

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })
        if (!user) throw new Error("User not found")
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

app.use(authRoutes)
app.use(userRoutes)
app.use(learningHubRoutes)
app.use(subHubRoutes)
app.use(chapterRoutes)
app.use(postRoutes)
app.use(communityRoutes)
app.use(flashcardRoutes)
app.use(quizRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
