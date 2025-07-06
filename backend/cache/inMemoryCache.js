class InMemoryCache {
    constructor(options = {}) {
        this.store = new Map()
        this.ttlStore = new Map()
        this.maxSize = options.maxSize || 1000
        this.defaultTTL = options.defaultTTL || 3600000
        this.cleanupInterval = options.cleanupInterval || 300000
        this.startCleanup()
    }

    set(key, value, ttl = this.defaultTTL) {
        try {
            if (!key) throw new Error('Cache key cannot be empty')
            if (ttl < 0) throw new Error('TTL cannot be negative')
            // checks if we need to evict old entries
            if (this.store.size >= this.maxSize) this.evictOldest()

            const expiresAt = Date.now() + ttl

            this.store.set(key, {
                value,
                createdAt: Date.now(),
                accessCount: 0,
                lastAccessed: Date.now()
            })

            this.ttlStore.set(key, expiresAt)
            return true
        } catch (error) {
            throw new Error(`Cache SET failed for key "${key}": ${error.message}`)
        }
    }

    get(key) {
        try {
            if (!key) throw new Error('Cache key cannot be empty')
            if (!this.store.has(key)) return null

            const expiresAt = this.ttlStore.get(key)
            if (Date.now() > expiresAt) {
                this.delete(key)
                return null
            }
            // update access stats
            const item = this.store.get(key)
            item.accessCount++
            item.lastAccessed = Date.now()

            return item.value
        } catch (error) {
            throw new Error(`Cache GET failed for key "${key}": ${error.message}`)
        }
    }

    delete(key) {
        try {
            if (!key) throw new Error('Cache key cannot be empty')

            const deleted = this.store.delete(key)
            this.ttlStore.delete(key)
            return deleted
        } catch (error) {
            throw new Error(`Cache DELETE failed for key "${key}": ${error.message}`)
        }
    }

    clear() {
        try {
            this.store.clear()
            this.ttlStore.clear()
            return true
        } catch (error) {
            throw new Error(`Cache CLEAR failed: ${error.message}`)
        }
    }

    // LRU eviction strategy
    evictOldest() {
        try {
            let oldestKey = null
            let oldestTime = Date.now()

            for (const [key, item] of this.store) {
                if (item.lastAccessed < oldestTime) {
                    oldestTime = item.lastAccessed
                    oldestKey = key
                }
            }

            if (oldestKey) this.delete(oldestKey)
        } catch (error) {
            throw new Error(`Cache eviction failed: ${error.message}`)
        }
    }

    // cleanup expired entries
    cleanup() {
        try {
            const now = Date.now()
            const expiredKeys = []

            for (const [key, expiresAt] of this.ttlStore) {
                if (now > expiresAt) expiredKeys.push(key)
            }

            expiredKeys.forEach(key => this.delete(key))
            return expiredKeys.length

        } catch (error) {
            throw new Error(`Cache cleanup failed: ${error.message}`)
        }
    }

    startCleanup() {
        try {
            setInterval(() => {
                try {
                    this.cleanup()
                } catch (error) {
                    throw new Error('Cache cleanup error:', error.message)
                }
            }, this.cleanupInterval)
        } catch (error) {
            throw new Error(`Failed to start cache cleanup: ${error.message}`)
        }
    }

    getStats() {
        try {
            return {
                size: this.store.size,
                maxSize: this.maxSize,
                memoryUsage: this.getMemoryUsage(),
                hitRate: this.calculateHitRate()
            }
        } catch (error) {
            throw new Error(`Failed to get cache stats: ${error.message}`)
        }
    }


    getMemoryUsage() {
        try {
            let totalSize = 0
            for (const [key, item] of this.store) {
                totalSize += JSON.stringify(key).length + JSON.stringify(item.value).length
            }
            return `${(totalSize / 1024).toFixed(2)} KB`
        } catch (error) {
            throw new Error(`Failed to calculate memory usage: ${error.message}`)
        }
    }

    calculateHitRate() {
        try {
            let totalAccess = 0
            for (const [key, item] of this.store) {
                totalAccess += item.accessCount
            }
            return totalAccess > 0 ? `${((totalAccess / this.store.size) * 100).toFixed(2)}%` : '0%'
        } catch (error) {
            throw new Error(`Failed to calculate hit rate: ${error.message}`)
        }
    }
 }
module.exports = InMemoryCache
