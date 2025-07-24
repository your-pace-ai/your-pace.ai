const request = require('supertest')
const express = require('express')


const mockSubHub = {
 findFirst: jest.fn(),
 create: jest.fn(),
 update: jest.fn(),
 delete: jest.fn()
}


const mockChapter = {
 findMany: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   subHub: mockSubHub,
   chapter: mockChapter
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


jest.mock('../../cache/cacheManager', () => ({}))
jest.mock('../../cache/simpleInvalidator', () => {
 return jest.fn().mockImplementation(() => ({
   invalidateUserData: jest.fn()
 }))
})
jest.mock('../../utils/fetch.js', () => jest.fn())


const { PrismaClient } = require('@prisma/client')
const subHubRoutes = require('../../routes/hubRoutes/subHubRoutes')


describe('SubHub Routes', () => {
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
   app.use(subHubRoutes)
 })


 describe('GET /api/subhub/:subHubId/public', () => {
   it('should return subhub with learning hub info', async () => {
     const mockSubHubData = {
       id: 1,
       name: 'Test SubHub',
       learningHub: {
         id: 1,
         name: 'Test Learning Hub',
         userId: 1
       }
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/subhub/1/public')
       .expect(200)


     expect(mockSubHub.findFirst).toHaveBeenCalledWith({
       where: {
         id: 1
       },
       include: {
         learningHub: {
           select: {
             id: true,
             name: true,
             userId: true
           }
         }
       }
     })
     expect(response.body).toEqual(mockSubHubData)
   })


   it('should return 404 for non-existent subhub', async () => {
     mockSubHub.findFirst.mockResolvedValue(null)


     await request(app)
       .get('/api/subhub/999/public')
       .expect(404)
   })


   it('should handle database errors', async () => {
     mockSubHub.findFirst.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/subhub/1/public')
       .expect(500)
   })
 })


 describe('GET /api/subhub/:subHubId/chapters/public', () => {
   it('should return chapters for subhub', async () => {
     const mockChapters = [
       { id: 1, title: 'Chapter 1', content: 'Content 1' },
       { id: 2, title: 'Chapter 2', content: 'Content 2' }
     ]


     const mockSubHubData = {
       id: 1,
       name: 'Test SubHub',
       youtubeUrl: 'https://youtube.com/test',
       chapters: mockChapters
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/subhub/1/chapters/public')
       .expect(200)


     expect(mockSubHub.findFirst).toHaveBeenCalledWith({
       where: {
         id: 1
       },
       include: {
         chapters: {
           orderBy: {
             id: 'asc'
           }
         }
       }
     })

     expect(response.body).toEqual({
       subHub: {
         id: 1,
         name: 'Test SubHub',
         youtubeUrl: 'https://youtube.com/test'
       },
       chapters: mockChapters
     })
   })


   it('should handle empty chapters list', async () => {
     const mockSubHubData = {
       id: 1,
       name: 'Test SubHub',
       youtubeUrl: 'https://youtube.com/test',
       chapters: []
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/subhub/1/chapters/public')
       .expect(200)


     expect(response.body).toEqual({
       subHub: {
         id: 1,
         name: 'Test SubHub',
         youtubeUrl: 'https://youtube.com/test'
       },
       chapters: []
     })
   })


   it('should handle database errors', async () => {
     mockSubHub.findFirst.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/subhub/1/chapters/public')
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
     unauthApp.use(subHubRoutes)


     await request(unauthApp)
       .get('/api/subhub/1/public')
       .expect(401)


     await request(unauthApp)
       .get('/api/subhub/1/chapters/public')
       .expect(401)
   })
 })
})
