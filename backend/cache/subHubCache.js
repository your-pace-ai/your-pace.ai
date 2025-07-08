const InMemoryCache = require('./inMemoryCache')
const MAX_SIZE = 1000
const DEFAULT_TTL = 900000
const CLEANUP_INTERVAL = 300000

class SubHubCache extends InMemoryCache {
   constructor() {
       super({
           maxSize: MAX_SIZE,
           defaultTTL: DEFAULT_TTL,
           cleanupInterval: CLEANUP_INTERVAL
       })
   }
   // cache all user subhubs
   setUserSubhubs(userId, subhubs) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.set(`user:${userId}:subhubs`, subhubs)
       } catch (error) {
           throw new Error(`Failed to cache user subhubs: ${error.message}`)
       }
   }

   getUserSubhubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.get(`user:${userId}:subhubs`)
       } catch (error) {
           throw new Error(`Failed to get cached user subhubs: ${error.message}`)
       }
   }
   // cache specific subhub with details
   setSubhubDetails(subhubId, details) {
       try {
           if (!subhubId) throw new Error('Subhub ID is required')
           return this.set(`subhub:${subhubId}:details`, details)
       } catch (error) {
           throw new Error(`Failed to cache subhub details: ${error.message}`)
       }
   }

   getSubhubDetails(subhubId) {
       try {
           if (!subhubId) throw new Error('Subhub ID is required')
           return this.get(`subhub:${subhubId}:details`)
       } catch (error) {
           throw new Error(`Failed to get cached subhub details: ${error.message}`)
       }
   }
   // cache subhubs for a specific hub
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
   // invalidate when subhub is modified
   invalidateSubhub(subhubId, userId, hubId) {
       try {
           if (!subhubId || !userId || !hubId) throw new Error('Subhub ID, User ID, and Hub ID are required')
           const deletedKeys = []

           if (this.delete(`subhub:${subhubId}:details`)) deletedKeys.push(`subhub:${subhubId}:details`)
           if (this.delete(`user:${userId}:subhubs`)) deletedKeys.push(`user:${userId}:subhubs`)
           if (this.delete(`hub:${hubId}:subhubs`)) deletedKeys.push(`hub:${hubId}:subhubs`)

           return deletedKeys
       } catch (error) {
           throw new Error(`Failed to invalidate subhub cache: ${error.message}`)
       }
   }
   // invalidate all user subhubs
   invalidateUserSubhubs(userId) {
       try {
           if (!userId) throw new Error('User ID is required')
           return this.delete(`user:${userId}:subhubs`)
       } catch (error) {
           throw new Error(`Failed to invalidate user subhubs cache: ${error.message}`)
       }
   }
}
module.exports = SubHubCache
