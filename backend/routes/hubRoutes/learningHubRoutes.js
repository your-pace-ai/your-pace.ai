const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const cacheManager = require("../../cache/cacheManager")
const SimpleInvalidator = require("../../cache/simpleInvalidator")

const prisma = new PrismaClient()
const router = express.Router()
const invalidator = new SimpleInvalidator(cacheManager)

router.post("/api/learning-hub/create", isAuthenticated, async (req, res) => {
   try {
       const userId = req.user.id
       const { body : { title } } = req
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
       // immediate cache invalidation
       await invalidator.invalidateUserData(userId)
       res.json(learningHub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to create learning hub",
           details: error.message
       })
   }
})


router.get("/api/learning-hub", isAuthenticated, async (req, res) => {
   const userId = req.user.id
   try {
       const cachedHubs = await cacheManager.getCachedUserHubs(userId)
       if (cachedHubs) {
           return res.json(cachedHubs)
       }
       const user = await prisma.user.findUnique({
           where: {
               id: userId
           },
           include: {
               learningHub: true
           },
       })

       if (!user) return res.status(404).json({ error: "User not found" })
       const hubs = user.learningHub
       // cache the result
       await cacheManager.cacheUserHubs(userId, hubs)
       res.json(hubs)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch learning hubs",
           details: error.message
       })
   }
})


router.delete("/api/learning-hub/delete", isAuthenticated, async (req, res) => {
   try {
       const { learningHubId } = req.body
       const userId = req.user.id
       const learningHub = await prisma.learningHub.findFirst({
           where: {
               id: learningHubId,
               userId: userId
           }
       })

       if (!learningHub) return res.status(404).json({ error: "Learning hub not found" })
       const deletedLearningHub = await prisma.learningHub.delete({
           where: {
               id: learningHubId
           }
       })
       // immediate cache invalidation for learning hub deletion
       await invalidator.invalidateLearningHubData(learningHubId, userId)
       res.json(deletedLearningHub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to delete learning hub",
           details: error.message
       })
   }
})

router.get("/api/learning-hub/:id/subhubs", isAuthenticated, async (req, res) => {
   try {
       const learningHubId = parseInt(req.params.id)
       const userId = req.user.id
       // check cache first
       const cachedSubhubs = await cacheManager.getCachedHubSubhubs(learningHubId)
       if (cachedSubhubs) return res.json(cachedSubhubs)
       const learningHub = await prisma.learningHub.findFirst({
           where: {
               id: learningHubId,
               userId: userId
           },
           include: {
               subHub: true
           }
       })

       if (!learningHub) return res.status(404).json({ error: "Learning hub not found" })
       const subhubs = learningHub.subHub
       // cache the result
       await cacheManager.cacheHubSubhubs(learningHubId, subhubs)
       res.json(subhubs)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch subhubs",
           details: error.message
       })
   }
})

module.exports = router
