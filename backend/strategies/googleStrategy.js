const { Strategy } = require("passport-google-oidc")
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const passport = require("passport")
const {} = require("../utils/randomPasswordGenerator.js")

const prisma = new PrismaClient()

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findFirst({
            where : {
                id : id
            }
        })
        if (!user) throw new Error("User not Found")
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

const GoogleStrategy = new Strategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : process.env.GOOGLE_CALLBACK_URL,
    scope : ["email", "profile"],
}, async (accessToken, refreshToken, profile, email, done) => {
    const findUser = await prisma.user.findFirst({
        where : {
            id : profile.id
        }
    })

    if (findUser) {
        done(null, findUser)
        return
    }

    const saltRounds = 12
    const randomPassword = randomPasswordGenerator()
    const password = await bcrypt.hash(randomPassword, saltRounds)
    const newUser = await prisma.user.create({
        data : {
            id: profile.id,
            email: email,
            password: password
        }
    })
    done(null, newUser)
})

module.exports = passport.use(GoogleStrategy)
