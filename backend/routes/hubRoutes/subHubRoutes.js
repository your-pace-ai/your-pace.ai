const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const prisma = new PrismaClient()
const router = express.Router()

router.get("/api/learning-hub/subhub", isAuthenticated, async (req, res) => {
    const { body: { learningHubId } } = req
    const learningHub = await prisma.learningHub.findFirst({
      where: {
        id: learningHubId
      },
      include: {
        subHub: true
      }
    })
    res.json(learningHub.subHub)
})

router.post("/api/subhub/create", isAuthenticated, async (req, res) => {
    const { body: { learningHubId, name} } = req
    const subhub = await prisma.subHub.create({
        data: {
            name: name,
            learningHub: {
                connect: {
                    id: learningHubId
                }
            }
        },
    })
    res.json(subhub)
})

router.get("/api/subhub", isAuthenticated, async (req, res) => {
    const { body: { subHubId } } = req
    const subHub = await prisma.subHub.findFirst({
        where: {
            id: subHubId
        },
        include: {
            chapters: true,
            subHubComment: true,
            flashCard: true,
            quiz: true
        }
    })
    res.json(subHub)
})

router.delete("/api/subhub/delete", isAuthenticated, async (req, res) => {
    const { body : { subHubId } } = req
    const deletedSubHub = await prisma.subHub.delete({
        where: {
            id: subHubId
        }
    })
    res.json(deletedSubHub)
})

module.exports = router
