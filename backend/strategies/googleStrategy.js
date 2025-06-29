const { Strategy } = require("passport-google-oidc")
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const passport = require("passport")
const randomPasswordGenerator = require("../utils/randomPasswordGenerator.js")

const prisma = new PrismaClient()

const GoogleStrategy = new Strategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : process.env.GOOGLE_CALLBACK_URL,
    scope : ["email", "profile"],
    }, async (issuer, profile, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: profile.emails[0].value
                }
            })

            if (user) return done(null, user)

            const saltRounds = 12;
            const randomPassword = randomPasswordGenerator();
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

            const newUser = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword
                }
            })
            return done(null, newUser)
            
        } catch (error) {
            throw new Error(error)
        }
})

module.exports = passport.use(GoogleStrategy)
