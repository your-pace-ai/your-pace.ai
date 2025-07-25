const passport = require('passport')
const { Strategy } = require('passport-local')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

const strategy = new Strategy({ usernameField:"email" }, async (username, password, done) => {
    try {
        const user = await prisma.user.findUnique({
            where : {
                email : username
            }
        })

        if (!user) throw new Error("User not found")
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) throw new Error("Invalid Credentials")
        done(null, user)

    } catch (error) {
        done(error, null)
    }
})

module.exports = passport.use(strategy)
