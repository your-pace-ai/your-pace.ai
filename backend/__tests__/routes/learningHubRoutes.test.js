const request = require('supertest')
const express = require('express')


const mockLearningHub = {
 create: jest.fn(),
 findMany: jest.fn(),
 update: jest.fn(),
 delete: jest.fn()
}


const mockUser = {
 findUnique: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   learningHub: mockLearningHub,
   user: mockUser
 }))
}))


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
 getCachedUserHubs: jest.fn(),
 cacheUserHubs: jest.fn()
}))


jest.mock('../../cache/simpleInvalidator', () => {
 return jest.fn().mockImplementation(() => ({
   invalidateUserData: jest.fn()
 }))
})


const { PrismaClient } = require('@prisma/client')
const cacheManager = require('../../cache/cacheManager')
const learningHubRoutes = require('../../routes/hubRoutes/learningHubRoutes')


describe('Learning Hub Routes', () => {
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
   app.use(learningHubRoutes)
 })


 describe('POST /api/learning-hub/create', () => {
   it('should create a learning hub with title', async () => {
     const hubData = { title: 'Test Hub' }
     const createdHub = {
       id: 1,
       name: 'Test Hub',
       userId: 1
     }


     mockLearningHub.create.mockResolvedValue(createdHub)


     const response = await request(app)
       .post('/api/learning-hub/create')
       .send(hubData)
       .expect(200)


     expect(mockLearningHub.create).toHaveBeenCalledWith({
       data: {
         name: 'Test Hub',
         user: {
           connect: {
             id: 1
           }
         }
       }
     })
     expect(response.body).toEqual(createdHub)
   })


   it('should create a learning hub with default title when none provided', async () => {
     const createdHub = {
       id: 1,
       name: 'Untitled Learning Hub',
       userId: 1
     }


     mockLearningHub.create.mockResolvedValue(createdHub)


     const response = await request(app)
       .post('/api/learning-hub/create')
       .send({})
       .expect(200)


     expect(mockLearningHub.create).toHaveBeenCalledWith({
       data: {
         name: 'Untitled Learning Hub',
         user: {
           connect: {
             id: 1
           }
         }
       }
     })
     expect(response.body).toEqual(createdHub)
   })


   it('should handle database errors', async () => {
     mockLearningHub.create.mockRejectedValue(new Error('Database error'))


     await request(app)
       .post('/api/learning-hub/create')
       .send({ title: 'Test Hub' })
       .expect(500)
   })
 })


 describe('GET /api/learning-hub', () => {
   it('should return cached hubs if available', async () => {
     const cachedHubs = [{ id: 1, name: 'Cached Hub' }]
     cacheManager.getCachedUserHubs.mockReturnValue(cachedHubs)


     const response = await request(app)
       .get('/api/learning-hub')
       .expect(200)


     expect(response.body).toEqual(cachedHubs)
     expect(mockUser.findUnique).not.toHaveBeenCalled()
   })


   it('should fetch from database when cache is empty', async () => {
     const userData = {
       learningHub: [
         { id: 1, name: 'Hub 1' },
         { id: 2, name: 'Hub 2' }
       ]
     }


     cacheManager.getCachedUserHubs.mockReturnValue(null)
     mockUser.findUnique.mockResolvedValue(userData)


     const response = await request(app)
       .get('/api/learning-hub')
       .expect(200)


     expect(mockUser.findUnique).toHaveBeenCalledWith({
       where: { id: 1 },
       include: { learningHub: true }
     })
     expect(cacheManager.cacheUserHubs).toHaveBeenCalledWith(1, userData.learningHub)
     expect(response.body).toEqual(userData.learningHub)
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
     unauthApp.use(learningHubRoutes)


     await request(unauthApp)
       .post('/api/learning-hub/create')
       .send({ title: 'Test' })
       .expect(401)


     await request(unauthApp)
       .get('/api/learning-hub')
       .expect(401)
   })
 })
})
