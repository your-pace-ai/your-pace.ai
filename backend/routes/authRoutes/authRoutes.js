const express = require('express')
const { Router } = express
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt")
const passport = require('passport')
const { validateLocalSignUp } = require("../../middleware/middleware.js")
require("../../strategies/localStrategy.js")
require("../../strategies/googleStrategy.js")

const router = Router()
const prisma = new PrismaClient()
const saltRounds = 12


router.post("/api/local-auth/signup", validateLocalSignUp, async (req, res) => {
    const { body : { email, password } } = req
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const user = await prisma.user.create({
        data : {
            email : email,
            password : hashedPassword
        }
    })

    res.json(user)
})

router.post("/api/local-auth/login", passport.authenticate("local"), async (req, res) => {
    res.json(req.user.id)
})

router.post("/api/local-auth/logout", (req, res) => {
    if (!req.user) return res.sendStatus(401)
    req.logout((err) => {
        if (err) return res.sendStatus(400)
        res.sendStatus(200)
    })
})

router.get("/auth/google",passport.authenticate("google", {failureRedirect: `${process.env.FRONTEND_URL}/login`, session: true, scope: ["profile", "email"]}), async (req, res) => {})

router.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    successRedirect: `${process.env.FRONTEND_URL}/dashboard`,
    session: true
}))

module.exports = router
