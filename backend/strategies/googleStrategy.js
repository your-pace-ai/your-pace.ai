const { Strategy } = require("passport-google-oidc")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const GoogleStrategy = new Strategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : process.env.GOOGLE_CALLBACK_URL,
    scope : ["email", "profile"],
})
