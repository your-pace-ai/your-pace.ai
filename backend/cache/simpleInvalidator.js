class SimpleInvalidator {
    constructor(cacheManager) {
        this.cacheManager = cacheManager
    }
    // invalidate all caches related to a user
    async invalidateUserData(userId) {
        try {
            if (!userId) throw new Error('User ID is required for cache invalidation')
            // clear all user-related caches in parallel
            const invalidationTasks = [
                this.cacheManager.invalidateUserHubs(userId),
                this.cacheManager.subHubCache.invalidateUserSubhubs(userId),
                this.cacheManager.userCache.delete(`user:${userId}`),
                this.cacheManager.userCache.delete(`user:${userId}:profile`)
            ]
            await Promise.all(invalidationTasks)
            return true
        } catch (error) {
            throw new Error(`Cache invalidation failed for user ${userId}: ${error.message}`)
        }
    }
    // invalidate caches when a learning hub changes
    async invalidateLearningHubData(hubId, userId) {
        try {
            if (!hubId || !userId) throw new Error('Hub ID and User ID are required for cache invalidation')

            const invalidationTasks = [
                this.cacheManager.learningHubCache.invalidateHub(hubId, userId),
                this.cacheManager.invalidateUserHubs(userId),
                this.cacheManager.subHubCache.delete(`hub:${hubId}:subhubs`),
                this.cacheManager.learningHubCache.delete(`hub:${hubId}:details`)
            ]
            await Promise.all(invalidationTasks)
            return true
        } catch (error) {
            throw new Error(`Cache invalidation failed for hub ${hubId}: ${error.message}`)
        }
    }
    // invalidate caches when a subhub changes
    async invalidateSubHubData(subHubId, hubId, userId) {
        try {
            if (!subHubId || !hubId || !userId) throw new Error('SubHub ID, Hub ID, and User ID are required for cache invalidation')

            const invalidationTasks = [
                this.cacheManager.subHubCache.invalidateSubhub(subHubId, userId, hubId),
                this.cacheManager.subHubCache.delete(`user:${userId}:subhubs`),
                this.cacheManager.subHubCache.delete(`hub:${hubId}:subhubs`),
                this.cacheManager.subHubCache.delete(`subhub:${subHubId}:details`)
            ]

            await Promise.all(invalidationTasks)
            return true
        } catch (error) {
            throw new Error(`Cache invalidation failed for subhub ${subHubId}: ${error.message}`)
        }
    }
    // invalidate session-related caches
    async invalidateSessionData(sessionId, userId) {
        try {
            if (!sessionId) throw new Error('Session ID is required for cache invalidation')
            const invalidationTasks = [
                this.cacheManager.sessionCache.delete(`session:${sessionId}`)
            ]
            if (userId) {
                invalidationTasks.push(
                    this.cacheManager.userCache.delete(`user:${userId}:sessions`)
                )
            }
            await Promise.all(invalidationTasks)
            return true
        } catch (error) {
            throw new Error(`Cache invalidation failed for session ${sessionId}: ${error.message}`)
        }
    }
    // clear all caches
    async invalidateAllData() {
        try {
            this.cacheManager.clearAll()
            return true
        } catch (error) {
            throw new Error(`Failed to clear all caches: ${error.message}`)
        }
    }
 }
 module.exports = SimpleInvalidator
