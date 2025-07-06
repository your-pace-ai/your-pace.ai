const LearningHubCache = require('./learningHubCache')
const SubHubCache = require('./subHubCache')
const InMemoryCache = require('./inMemoryCache')

class CacheManager {
   constructor() {
       if (CacheManager.instance) return CacheManager.instance

       try {
           this.learningHubCache = new LearningHubCache()
           this.subHubCache = new SubHubCache()
           this.userCache = new InMemoryCache({
               maxSize: 200,
               defaultTTL: 1800000
           })
           this.sessionCache = new InMemoryCache({
               maxSize: 1000,
               defaultTTL: 3600000
           })
           CacheManager.instance = this
       } catch (error) {
           throw new Error(`Failed to initialize CacheManager: ${error.message}`)
       }
   }
   // learning Hub operations
   async cacheUserHubs(userId, hubs) {
       try {
           if (!userId) throw new Error('User ID is required')
           if (!hubs) throw new Error('Hubs data is required')
           return this.learningHubCache.setUserHubs(userId, hubs)
       } catch (error) {
           throw new Error(`Failed to cache user hubs: ${error.message}`)
       }
   }

   async getCachedUserHubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.learningHubCache.getUserHubs(userId)
       } catch (error) {
           throw new Error(`Failed to get cached user hubs: ${error.message}`)
       }
   }

   async invalidateUserHubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.learningHubCache.invalidateUserHubs(userId)
       } catch (error) {
           throw new Error(`Failed to invalidate user hubs: ${error.message}`)
       }
   }
   // subHub operations
   async cacheUserSubhubs(userId, subhubs) {
       try {
           if (!userId) throw new Error('User ID is required')
           if (!subhubs) throw new Error('Subhubs data is required')
           return this.subHubCache.setUserSubhubs(userId, subhubs)
       } catch (error) {
           throw new Error(`Failed to cache user subhubs: ${error.message}`)
       }
   }

   async getCachedUserSubhubs(userId) {
       try {
           if (!userId) {
               throw new Error('User ID is required')
           }
           return this.subHubCache.getUserSubhubs(userId)
       } catch (error) {
           throw new Error(`Failed to get cached user subhubs: ${error.message}`)
       }
   }

   async cacheHubSubhubs(hubId, subhubs) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           if (!subhubs) throw new Error('Subhubs data is required')
           return this.subHubCache.setHubSubhubs(hubId, subhubs)
       } catch (error) {
           throw new Error(`Failed to cache hub subhubs: ${error.message}`)
       }
   }

   async getCachedHubSubhubs(hubId) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           return this.subHubCache.getHubSubhubs(hubId)
       } catch (error) {
           throw new Error(`Failed to get cached hub subhubs: ${error.message}`)
       }
   }
   // user operations
   async cacheUser(userId, userData) {
       try {
           if (!userId) throw new Error('User ID is required')
           if (!userData) throw new Error('User data is required')
           return this.userCache.set(`user:${userId}`, userData)
       } catch (error) {
           throw new Error(`Failed to cache user: ${error.message}`)
       }
   }

   async getCachedUser(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.userCache.get(`user:${userId}`)
       } catch (error) {
           throw new Error(`Failed to get cached user: ${error.message}`)
       }
   }
   // session operations
   async cacheSession(sessionId, sessionData) {
       try {
           if (!sessionId) throw new Error('Session ID is required')
           if (!sessionData) throw new Error('Session data is required')
           return this.sessionCache.set(`session:${sessionId}`, sessionData)
       } catch (error) {
           throw new Error(`Failed to cache session: ${error.message}`)
       }
   }

   async getCachedSession(sessionId) {
       try {
           if (!sessionId) throw new Error('Session ID is required')
           return this.sessionCache.get(`session:${sessionId}`)
       } catch (error) {
           throw new Error(`Failed to get cached session: ${error.message}`)
       }
   }
   // get overall cache statistics
   getStats() {
       try {
           return {
               learningHubs: this.learningHubCache.getStats(),
               subHubs: this.subHubCache.getStats(),
               users: this.userCache.getStats(),
               sessions: this.sessionCache.getStats(),
               totalMemoryUsage: this.getTotalMemoryUsage()
           }
       } catch (error) {
           throw new Error(`Failed to get cache stats: ${error.message}`)
       }
   }

   getTotalMemoryUsage() {
       try {
           const processMemory = process.memoryUsage()
           return {
               heapUsed: `${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
               heapTotal: `${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
               external: `${(processMemory.external / 1024 / 1024).toFixed(2)} MB`,
               rss: `${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`
           }
       } catch (error) {
           throw new Error(`Failed to get memory usage: ${error.message}`)
       }
   }
   // clear all caches
   clearAll() {
       try {
           this.learningHubCache.clear()
           this.subHubCache.clear()
           this.userCache.clear()
           this.sessionCache.clear()
           return true
       } catch (error) {
           throw new Error(`Failed to clear all caches: ${error.message}`)
       }
   }
   // health check
   isHealthy() {
       try {
           const stats = this.getStats()
           const memoryUsage = process.memoryUsage()
           const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024

           return {
               // consider unhealthy if using > 500MB
               healthy: heapUsedMB < 500,
               stats,
               timestamp: new Date().toISOString()
           }
       } catch (error) {
           return {
               healthy: false,
               error: error.message,
               timestamp: new Date().toISOString()
           }
       }
   }
}
module.exports = new CacheManager()
