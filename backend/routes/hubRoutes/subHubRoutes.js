const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const cacheManager = require("../../cache/cacheManager")
const SimpleInvalidator = require("../../cache/simpleInvalidator")
const fetch = require("../../utils/fetch.js")

const prisma = new PrismaClient()
const router = Router()
const invalidator = new SimpleInvalidator(cacheManager)

// Public endpoint to get any subhub by ID (for viewing other users' content)
router.get("/api/subhub/:subHubId/public", isAuthenticated, async (req, res) => {
   try {
       const { subHubId } = req.params

       const subHub = await prisma.subHub.findFirst({
           where: {
               id: parseInt(subHubId)
           },
           include: {
               learningHub: {
                   select: {
                       id: true,
                       name: true,
                       userId: true
                   }
               }
           }
       })

       if (!subHub) {
           return res.status(404).json({ error: "SubHub not found" })
       }

       res.json(subHub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch subhub",
           details: error.message
       })
   }
})


// Public endpoint to get chapters for any subhub
router.get("/api/subhub/:subHubId/chapters/public", isAuthenticated, async (req, res) => {
   try {
       const { subHubId } = req.params

       const subHub = await prisma.subHub.findFirst({
           where: {
               id: parseInt(subHubId)
           },
           include: {
               chapters: {
                   orderBy: {
                       id: 'asc'
                   }
               }
           }
       })

       if (!subHub) return res.status(404).json({ error: "SubHub not found" })

       res.json({
           subHub: {
               id: subHub.id,
               name: subHub.name,
               youtubeUrl: subHub.youtubeUrl
           },
           chapters: subHub.chapters
       })
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch chapters",
           details: error.message
       })
   }
})

// get all subhubs for a learning hub
router.get("/api/learning-hub/subhub", isAuthenticated, async (req, res) => {
   try {
       const { body : { learningHubId } } = req
       const userId = req.user.id
       // check cache first
       const cachedSubhubs = cacheManager.getCachedHubSubhubs(learningHubId)
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
       cacheManager.cacheHubSubhubs(learningHubId, subhubs)
       res.json(subhubs)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch subhubs",
           details: error.message
       })
   }
})

router.get("/api/subhub/all", isAuthenticated, async (req, res) => {
   try {
       const userId = req.user.id
       // check cache first
       const cachedSubhubs = cacheManager.getCachedUserSubhubs(userId)
       if (cachedSubhubs) return res.json(cachedSubhubs)
       const learningHubs = await prisma.learningHub.findMany({
           where: {
               userId: userId
           },
           include: {
               subHub: true
           }
       })
       // flatten all subhubs from all learning hubs
       const allSubHubs = learningHubs.flatMap(hub => hub.subHub)
       // cache the result
       cacheManager.cacheUserSubhubs(userId, allSubHubs)
       res.json(allSubHubs)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch subhubs",
           details: error.message
       })
   }
})

router.post("/api/subhub/create", isAuthenticated, async (req, res) => {
   try {
       const { title, youtubeUrl, learningHubId, category } = req.body
       const userId = req.user.id
       let hubId = learningHubId
       // if no learning hub ID provided, create a new learning hub
       if (!hubId) {
           const learningHub = await prisma.learningHub.create({
               data: {
                   name: title,
                   user: {
                       connect: {
                           id: userId
                       }
                   }
               }
           })
           hubId = learningHub.id
       } else {
           // verify the learning hub belongs to the user
           const learningHub = await prisma.learningHub.findFirst({
               where: {
                   id: hubId,
                   userId: userId
               }
           })

           if (!learningHub) return res.status(404).json({ error: "Learning hub not found" })
       }
       const subhub = await prisma.subHub.create({
           data: {
               name: title,
               youtubeUrl: youtubeUrl,
               category: category || 'OTHER',
               learningHub: {
                   connect: {
                       id: hubId
                   }
               }
           },
       })
       // immediate cache invalidation for subhub creation
       invalidator.invalidateSubHubData(subhub.id, hubId, userId)
       res.json(subhub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to create subhub",
           details: error.message
       })
   }
})
router.get("/api/subhub", isAuthenticated, async (req, res) => {
   try {
       const { subHubId } = req.body
       const userId = req.user.id
       // check cache first
       const cachedSubhub = cacheManager.subHubCache.getSubhubDetails(subHubId)
       if (cachedSubhub) return res.json(cachedSubhub)
       const subHub = await prisma.subHub.findFirst({
           where: {
               id: subHubId,
               learningHub: {
                   userId: userId
               }
           },
           include: {
               chapters: true,
               subHubComment: true,
               flashCard: true,
               quiz: true,
               learningHub: true
           }
       })
       if (!subHub) return res.status(404).json({ error: "SubHub not found" })
       // cache the result
       cacheManager.subHubCache.setSubhubDetails(subHubId, subHub)
       res.json(subHub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch subhub",
           details: error.message
       })
   }
})

router.delete("/api/subhub/delete", isAuthenticated, async (req, res) => {
   try {
       const { subHubId } = req.body
       const userId = req.user.id
       const subHub = await prisma.subHub.findFirst({
           where: {
               id: subHubId
           },
           include: {
               learningHub: true
           }
       })

       if (!subHub || subHub.learningHub.userId !== userId) return res.status(404).json({ error: "SubHub not found" })
       const hubId = subHub.learningHub.id

       const deletedSubHub = await prisma.subHub.delete({
           where: {
               id: subHubId
           }
       })

       // immediate cache invalidation for subhub deletion
       invalidator.invalidateSubHubData(subHubId, hubId, userId)
       res.json(deletedSubHub)
   } catch (error) {
       res.status(500).json({
           error: "Failed to delete subhub",
           details: error.message
       })
   }
})

// Get chapters for a SubHub from database
router.get("/api/subhub/:subHubId/chapters", isAuthenticated, async (req, res) => {
    try {
        const { subHubId } = req.params
        const userId = req.user.id

        // Verify the subhub belongs to the user
        const subHub = await prisma.subHub.findFirst({
            where: {
                id: parseInt(subHubId),
                learningHub: {
                    userId: userId
                }
            },
            include: {
                chapters: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })


        if (!subHub) return res.status(404).json({ error: "SubHub not found or not authorized" })
        res.json(subHub.chapters)
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch chapters from database",
            details: error.message
        })
    }
  })

router.get("/api/subhub/recommendations", isAuthenticated, async (req, res) => {
   try {
       const userId = req.user.id
       const topKRecommendations = require("../../recommendationAlgo/recommendation")

       // Get all subhubs with their engagement metrics
       const allSubHubs = await prisma.subHub.findMany({
           include: {
               learningHub: true,
               sharedPosts: {
                   include: {
                       likes: true,
                       comment: true
                   }
               }
           }
       })

       // Transform data for recommendation algorithm
       const videosData = allSubHubs.map(subhub => {
           // Calculate total likes and comments from shared posts
           const totalLikes = subhub.sharedPosts.reduce((sum, post) => sum + post.likes.length, 0)
           const totalComments = subhub.sharedPosts.reduce((sum, post) => sum + post.comment.length, 0)

           return {
               id: subhub.id,
               name: subhub.name,
               youtubeUrl: subhub.youtubeUrl,
               category: subhub.category,
               likes: totalLikes,
               comments: totalComments,
               learningHubId: subhub.learningHubId,
               isOwn: subhub.learningHub.userId === userId
           }
       })
       // Get recommendations
       const recommendations = topKRecommendations(videosData)
       // Filter out user's own subhubs from recommendations
       const filteredRecommendations = recommendations.filter(rec => !rec.isOwn)
       res.json(filteredRecommendations)
   } catch (error) {
       res.status(500).json({
           error: "Failed to get recommendations",
           details: error.message
       })
   }
})

module.exports = router
