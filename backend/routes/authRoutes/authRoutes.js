const express = require('express')
const { Router } = express
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt")
const passport = require('passport')
const { validateLocalSignUp } = require("../../validation/validation.js")
require("../../strategies/localStrategy.js")

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

router.get("/api/local-auth/status", (req, res) => {
    if (req.user.id) res.json(req.user.id)
    return res.sendStatus(200)
})

module.exports = router
