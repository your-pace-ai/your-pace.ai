class SimpleInvalidator {
    constructor(cacheManager) {
        this.cacheManager = cacheManager
    }
    // invalidate all caches related to a user
    invalidateUserData(userId) {
        try {
            if (!userId) throw new Error('User ID is required for cache invalidation')
            // clear all user-related caches in parallel
            this.cacheManager.invalidateUserHubs(userId),
            this.cacheManager.subHubCache.invalidateUserSubhubs(userId),
            this.cacheManager.userCache.delete(`user:${userId}`),
            this.cacheManager.userCache.delete(`user:${userId}:profile`)
        } catch (error) {
            throw new Error(`Cache invalidation failed for user ${userId}: ${error.message}`)
        }
    }
    // invalidate caches when a learning hub changes
    invalidateLearningHubData(hubId, userId) {
        try {
            if (!hubId || !userId) throw new Error('Hub ID and User ID are required for cache invalidation')

            this.cacheManager.learningHubCache.invalidateHub(hubId, userId),
            this.cacheManager.invalidateUserHubs(userId),
            this.cacheManager.subHubCache.delete(`hub:${hubId}:subhubs`),
            this.cacheManager.learningHubCache.delete(`hub:${hubId}:details`)
        } catch (error) {
            throw new Error(`Cache invalidation failed for hub ${hubId}: ${error.message}`)
        }
    }
    // invalidate caches when a subhub changes
    invalidateSubHubData(subHubId, hubId, userId) {
        try {
            if (!subHubId || !hubId || !userId) throw new Error('SubHub ID, Hub ID, and User ID are required for cache invalidation')

            this.cacheManager.subHubCache.invalidateSubhub(subHubId, userId, hubId),
            this.cacheManager.subHubCache.delete(`user:${userId}:subhubs`),
            this.cacheManager.subHubCache.delete(`hub:${hubId}:subhubs`),
            this.cacheManager.subHubCache.delete(`subhub:${subHubId}:details`)
        } catch (error) {
            throw new Error(`Cache invalidation failed for subhub ${subHubId}: ${error.message}`)
        }
    }
    // invalidate session-related caches
    invalidateSessionData(sessionId, userId) {
        try {
            if (!sessionId) throw new Error('Session ID is required for cache invalidation')

            this.cacheManager.sessionCache.delete(`session:${sessionId}`)

            if (userId) {
                    this.cacheManager.userCache.delete(`user:${userId}:sessions`)
            }
        } catch (error) {
            throw new Error(`Cache invalidation failed for session ${sessionId}: ${error.message}`)
        }
    }
    // clear all caches
    invalidateAllData() {
        try {
            this.cacheManager.clearAll()
        } catch (error) {
            throw new Error(`Failed to clear all caches: ${error.message}`)
        }
    }
 }
 module.exports = SimpleInvalidator
