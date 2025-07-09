const cacheManager = require('../cache/cacheManager')

const cacheMiddleware = (keyGenerator, ttl = 600000) => {
   return async (req, res, next) => {
       try {
           const cacheKey = keyGenerator(req)
           const cachedData = await cacheManager.userCache.get(cacheKey)

           if (cachedData) return res.json(cachedData)
           const originalJson = res.json
           // override res.json to cache the response
           res.json = (data) => {
               try {
                   cacheManager.userCache.set(cacheKey, data, ttl)
               } catch (error) {
                   throw new Error(`Cache SET failed for ${cacheKey}:`, error.message)
               }
               return originalJson.call(this, data)
           }
           next()
       } catch (error) {
           next()
           throw new Error(`Cache GET failed for ${cacheKey}:`, error.message)
       }
   }
}

const learningHubCacheMiddleware = cacheMiddleware((req) => `user:${req.user.id}:learning-hubs`, 600000)
const subHubCacheMiddleware = (hubId) => cacheMiddleware((req) => `hub:${hubId}:subhubs`,900000)
const userCacheMiddleware = cacheMiddleware((req) => `user:${req.user.id}:profile`,1800000)

module.exports = {
   cacheMiddleware,
   learningHubCacheMiddleware,
   subHubCacheMiddleware,
   userCacheMiddleware
}
