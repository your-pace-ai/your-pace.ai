const InMemoryCache = require('./inMemoryCache')
const MAX_SIZE = 500
const DEFAULT_TTL = 600000
const CLEANUP_INTERVAL = 180000

class LearningHubCache extends InMemoryCache {
   constructor() {
       super({
           maxSize: MAX_SIZE,
           defaultTTL: DEFAULT_TTL,
           cleanupInterval: CLEANUP_INTERVAL
       })
   }
   // cache user's learning hubs
   setUserHubs(userId, hubs) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.set(`user:${userId}:hubs`, hubs)
       } catch (error) {
           throw new Error(`Failed to cache user hubs: ${error.message}`)
       }
   }

   getUserHubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.get(`user:${userId}:hubs`)
       } catch (error) {
           throw new Error(`Failed to get cached user hubs: ${error.message}`)
       }
   }
   // cache specific learning hub
   setLearningHub(hubId, hub) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           return this.set(`hub:${hubId}`, hub)
       } catch (error) {
           throw new Error(`Failed to cache learning hub: ${error.message}`)
       }
   }

   getLearningHub(hubId) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           return this.get(`hub:${hubId}`)
       } catch (error) {
           throw new Error(`Failed to get cached learning hub: ${error.message}`)
       }
   }
   // cache learning hub's subhubs
   setHubSubhubs(hubId, subhubs) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           return this.set(`hub:${hubId}:subhubs`, subhubs)
       } catch (error) {
           throw new Error(`Failed to cache hub subhubs: ${error.message}`)
       }
   }

   getHubSubhubs(hubId) {
       try {
           if (!hubId) throw new Error('Hub ID is required')
           return this.get(`hub:${hubId}:subhubs`)
       } catch (error) {
           throw new Error(`Failed to get cached hub subhubs: ${error.message}`)
       }
   }
   // invalidate related caches when hub is modified
   invalidateHub(hubId, userId) {
       try {
           if (!hubId || !userId) throw new Error('Hub ID and User ID are required')
           const deletedKeys = []
           if (this.delete(`hub:${hubId}`)) deletedKeys.push(`hub:${hubId}`)
           if (this.delete(`hub:${hubId}:subhubs`)) deletedKeys.push(`hub:${hubId}:subhubs`)
           if (this.delete(`user:${userId}:hubs`)) deletedKeys.push(`user:${userId}:hubs`)
           return deletedKeys
       } catch (error) {
           throw new Error(`Failed to invalidate hub cache: ${error.message}`)
       }
   }
   // invalidate user's hub cache
   invalidateUserHubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.delete(`user:${userId}:hubs`)
       } catch (error) {
           throw new Error(`Failed to invalidate user hubs cache: ${error.message}`)
       }
   }
}
module.exports = LearningHubCache
