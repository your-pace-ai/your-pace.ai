const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const prisma = new PrismaClient()
const router = express.Router()

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

router.get("/api/learning-hub", isAuthenticated, async (req, res) => {
  const userId = req.user.id

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      learningHub: true
    },
  })

  res.json(user.learningHub)
})

router.delete("/api/learning-hub/delete", isAuthenticated, async (req, res) => {
    const { body: { learningHubId } } = req
    const deletedLearningHub = await prisma.learningHub.delete({
        where: {
            id: learningHubId
        }
    })
    res.json(deletedLearningHub)
})

module.exports = router
