const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const cors = require("cors")
const prisma = new PrismaClient()
const router = express.Router()
express().use(cors())

router.post("/api/learning-hub/create",isAuthenticated, async (req, res) => {
    const userId = req.user.id
    const { body : { title }} = req
    const learningHub = await prisma.learningHub.create({
        data: {
            name: title ? title : "Untitled Learning Hub",
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })
    res.json(learningHub)
})

module.exports = router
