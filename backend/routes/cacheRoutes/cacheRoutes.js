const express = require("express")
const cacheManager = require("../../cache/cacheManager")
const SimpleInvalidator = require("../../cache/simpleInvalidator")
const { isAuthenticated } = require("../../middleware/middleware.js")
const router = express.Router()
const invalidator = new SimpleInvalidator(cacheManager)


// get cache statistics
router.get("/api/admin/cache/stats", isAuthenticated, (req, res) => {
   try {
       const stats = cacheManager.getStats()
       res.json({
           success: true,
           timestamp: new Date().toISOString(),
           cacheStats: stats
       })
   } catch (error) {
       res.status(500).json({
           success: false,
           error: "Failed to get cache stats",
           details: error.message
       })
   }
})

// get cache health status
router.get("/api/admin/cache/health", isAuthenticated, (req, res) => {
   try {
       const health = cacheManager.isHealthy()
       res.json(health)
   } catch (error) {
       res.status(500).json({
           healthy: false,
           error: "Failed to check cache health",
           details: error.message
       })
   }
})

// clear all caches (nuclear option)
router.post("/api/admin/cache/clear-all", isAuthenticated, async (req, res) => {
   try {
       await invalidator.invalidateAllData()
       res.json({
           success: true,
           message: "All caches cleared successfully",
           timestamp: new Date().toISOString()
       })
   } catch (error) {
       res.status(500).json({
           success: false,
           error: "Failed to clear all caches",
           details: error.message
       })
   }
})


// clear cache for specific user
router.post("/api/admin/cache/clear-user", isAuthenticated, async (req, res) => {
   try {
       const { userId } = req.body

       if (!userId) {
           return res.status(400).json({
               success: false,
               error: "User ID is required"
           })
       }

       await invalidator.invalidateUserData(userId)

       res.json({
           success: true,
           message: `Cache cleared for user ${userId}`,
           timestamp: new Date().toISOString()
       })
   } catch (error) {
       res.status(500).json({
           success: false,
           error: "Failed to clear user cache",
           details: error.message
       })
   }
})

// clear cache for specific learning hub
router.post("/api/admin/cache/clear-hub", isAuthenticated, async (req, res) => {
   try {
       const { hubId, userId } = req.body

       if (!hubId || !userId) {
           return res.status(400).json({
               success: false,
               error: "Hub ID and User ID are required"
           })
       }

       await invalidator.invalidateLearningHubData(hubId, userId)

       res.json({
           success: true,
           message: `Cache cleared for learning hub ${hubId}`,
           timestamp: new Date().toISOString()
       })
   } catch (error) {
       res.status(500).json({
           success: false,
           error: "Failed to clear hub cache",
           details: error.message
       })
   }
})

// test cache functionality
router.post("/api/admin/cache/test", isAuthenticated, async (req, res) => {
   try {
       const testKey = `test:${Date.now()}`
       const testData = {
           message: "Cache test data",
           timestamp: new Date().toISOString(),
           randomValue: Math.random()
       }


       // test SET
       await cacheManager.userCache.set(testKey, testData, 60000)
       // test GET
       const retrieved = await cacheManager.userCache.get(testKey)
       // test DELETE
       const deleted = await cacheManager.userCache.delete(testKey)

       res.json({
           success: true,
           test: {
               set: testData,
               get: retrieved,
               deleted: deleted,
               dataMatches: JSON.stringify(testData) === JSON.stringify(retrieved)
           },
           message: "Cache test completed successfully"
       })
   } catch (error) {
       res.status(500).json({
           success: false,
           error: "Cache test failed",
           details: error.message
       })
   }
})

module.exports = router
