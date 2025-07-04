const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const prisma = new PrismaClient()
const router = express.Router()

router.post("/api/learning-hub/create",isAuthenticated, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({error: "Failed to create learning hub"})
  }
})

router.get("/api/learning-hub", isAuthenticated, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({error: "Failed to get learning hub"})
  }
})

router.delete("/api/learning-hub/delete", isAuthenticated, async (req, res) => {
    try {
      const { body: { learningHubId } } = req
      const userId = req.user.id
      const deletedLearningHub = await prisma.learningHub.delete({
        where: {
            id: learningHubId,
            userId: userId
        }
      })
      if (!deletedLearningHub) return res.status(404).json({error: "Learning hub not found"})
      res.json(deletedLearningHub)
    } catch (error) {
      res.status(500).json({error: "Failed to delete learning hub"})
    }
})

router.get("/api/learning-hub/:id/subhubs", isAuthenticated, async (req, res) => {
  try {
    const learningHubId = parsedInt(req.params.id)
    const userId = req.user.id

    const learningHub = await prisma.learningHub.findFirst({
      where: {
        id: learningHubId,
        userId: userId
      },
      include: {
        subHub: true
      }
    })
    if (!learningHub) return res.status(404).json({error: "Learning hub not found"})
    res.json(learningHub.subHub)

  } catch (error) {
    res.status(500).json({error: "Failed to get subhubs"})
  }
})

module.exports = router
