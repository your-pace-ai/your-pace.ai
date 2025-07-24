const request = require('supertest')
const express = require('express')


jest.mock('../../middleware/middleware.js', () => ({
 isAuthenticated: (req, res, next) => {
   if (req.isAuthenticated && req.isAuthenticated()) {
     next()
   } else {
     res.status(401).json({ error: 'Not authenticated' })
   }
 }
}))


jest.mock('../../cache/cacheManager', () => ({
 getStats: jest.fn(),
 isHealthy: jest.fn()
}))


const mockInvalidator = {
 invalidateAllData: jest.fn(),
 invalidateUserData: jest.fn()
}


jest.mock('../../cache/simpleInvalidator', () => {
 return jest.fn().mockImplementation(() => mockInvalidator)
})


const cacheManager = require('../../cache/cacheManager')
const SimpleInvalidator = require('../../cache/simpleInvalidator')
const cacheRoutes = require('../../routes/cacheRoutes/cacheRoutes')


describe('Cache Routes', () => {
 let app


 beforeEach(() => {
   jest.clearAllMocks()

   app = express()
   app.use(express.json())
   app.use((req, res, next) => {
     req.isAuthenticated = () => true
     req.user = { id: 1 }
     next()
   })
   app.use(cacheRoutes)
 })


 describe('GET /api/admin/cache/stats', () => {
   it('should return cache statistics', async () => {
     const mockStats = {
       totalEntries: 150,
       memoryUsage: '2.5 MB',
       hitRate: 0.85,
       missRate: 0.15
     }


     cacheManager.getStats.mockReturnValue(mockStats)


     const response = await request(app)
       .get('/api/admin/cache/stats')
       .expect(200)


     expect(cacheManager.getStats).toHaveBeenCalled()
     expect(response.body).toEqual({
       success: true,
       timestamp: expect.any(String),
       cacheStats: mockStats
     })
   })


   it('should handle errors when getting cache stats', async () => {
     cacheManager.getStats.mockImplementation(() => {
       throw new Error('Cache stats error')
     })


     await request(app)
       .get('/api/admin/cache/stats')
       .expect(500)
   })
 })


 describe('GET /api/admin/cache/health', () => {
   it('should return cache health status', async () => {
     const mockHealth = {
       healthy: true,
       uptime: '2h 30m',
       lastUpdate: new Date().toISOString()
     }


     cacheManager.isHealthy.mockReturnValue(mockHealth)


     const response = await request(app)
       .get('/api/admin/cache/health')
       .expect(200)


     expect(cacheManager.isHealthy).toHaveBeenCalled()
     expect(response.body).toEqual(mockHealth)
   })


   it('should handle errors when checking cache health', async () => {
     cacheManager.isHealthy.mockImplementation(() => {
       throw new Error('Health check error')
     })


     const response = await request(app)
       .get('/api/admin/cache/health')
       .expect(500)


     expect(response.body).toEqual({
       healthy: false,
       error: 'Failed to check cache health',
       details: 'Health check error'
     })
   })
 })


 describe('POST /api/admin/cache/clear-all', () => {
   it('should clear all caches successfully', async () => {
     const response = await request(app)
       .post('/api/admin/cache/clear-all')
       .expect(200)


     expect(mockInvalidator.invalidateAllData).toHaveBeenCalled()
     expect(response.body).toEqual({
       success: true,
       message: 'All caches cleared successfully',
       timestamp: expect.any(String)
     })
   })


   it('should handle errors when clearing caches', async () => {
     mockInvalidator.invalidateAllData.mockImplementation(() => {
       throw new Error('Clear cache error')
     })


     await request(app)
       .post('/api/admin/cache/clear-all')
       .expect(500)
   })
 })


 describe('POST /api/admin/cache/clear-user', () => {
   it('should clear user-specific caches', async () => {
     const response = await request(app)
       .post('/api/admin/cache/clear-user')
       .send({ userId: 123 })
       .expect(200)


     expect(mockInvalidator.invalidateUserData).toHaveBeenCalledWith(123)
     expect(response.body).toEqual({
       success: true,
       message: 'Cache cleared for user 123',
       timestamp: expect.any(String)
     })
   })


   it('should return 400 when userId is missing', async () => {
     await request(app)
       .post('/api/admin/cache/clear-user')
       .send({})
       .expect(400)
   })


   it('should handle errors when clearing user cache', async () => {
     mockInvalidator.invalidateUserData.mockImplementation(() => {
       throw new Error('Clear user cache error')
     })


     await request(app)
       .post('/api/admin/cache/clear-user')
       .send({ userId: 123 })
       .expect(500)
   })
 })


 describe('Authentication', () => {
   it('should reject unauthenticated requests', async () => {
     const unauthApp = express()
     unauthApp.use(express.json())
     unauthApp.use((req, res, next) => {
       req.isAuthenticated = () => false
       next()
     })
     unauthApp.use(cacheRoutes)


     await request(unauthApp)
       .get('/api/admin/cache/stats')
       .expect(401)


     await request(unauthApp)
       .get('/api/admin/cache/health')
       .expect(401)


     await request(unauthApp)
       .post('/api/admin/cache/clear-all')
       .expect(401)


     await request(unauthApp)
       .post('/api/admin/cache/clear-user')
       .send({ userId: 123 })
       .expect(401)
   })
 })
})
