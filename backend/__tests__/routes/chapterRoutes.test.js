const request = require('supertest')
const express = require('express')


const mockSubHub = {
 findFirst: jest.fn(),
 create: jest.fn(),
 update: jest.fn()
}


const mockChapter = {
 createMany: jest.fn()
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


jest.mock('../../utils/fetch.js', () => jest.fn())


const { PrismaClient } = require('@prisma/client')
const fetch = require('../../utils/fetch.js')
const chapterRoutes = require('../../routes/hubRoutes/chapterRoutes')


describe('Chapter Routes', () => {
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
   app.use(chapterRoutes)
 })


 describe('POST /api/chapters/smart-get', () => {
   it('should return existing chapters from database if available', async () => {
     const mockSubHubData = {
       id: 1,
       chapters: [
         { title: 'Chapter 1', summary: 'Summary 1' },
         { title: 'Chapter 2', summary: 'Summary 2' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(200)


     expect(mockSubHub.findFirst).toHaveBeenCalledWith({
       where: {
         youtubeUrl: 'https://www.youtube.com/watch?v=test',
         learningHub: {
           userId: 1
         }
       },
       include: {
         chapters: {
           orderBy: { createdAt: 'asc' }
         }
       }
     })


     expect(response.body).toEqual({
       'Chapter 1': 'Summary 1',
       'Chapter 2': 'Summary 2'
     })
     expect(fetch).not.toHaveBeenCalled()
   })


   it('should call AI agent when no chapters exist in database', async () => {
     const mockSubHubData = {
       id: 1,
       chapters: []
     }


     const mockAgentResponse = {
       'Introduction': 'Intro summary',
       'Main Content': 'Main summary'
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)
     fetch.mockResolvedValue({
       ok: true,
       json: jest.fn().mockResolvedValue(mockAgentResponse)
     })


     process.env.AGENT_API_URL = 'http://localhost:3001'


     const response = await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(200)


     expect(fetch).toHaveBeenCalledWith(
       'http://localhost:3001/api/chapters',
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           youtubeUrl: 'https://www.youtube.com/watch?v=test'
         })
       }
     )


     expect(response.body).toEqual(mockAgentResponse)
   })


   it('should return 400 when YouTube URL is missing', async () => {
     await request(app)
       .post('/api/chapters/smart-get')
       .send({})
       .expect(400)
   })


   it('should handle agent API errors', async () => {
     const mockSubHubData = {
       id: 1,
       chapters: []
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)
     fetch.mockResolvedValue({
       ok: false,
       status: 500,
       statusText: 'Internal Server Error'
     })


     process.env.AGENT_API_URL = 'http://localhost:3001'


     await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(500)
   })


   it('should handle network errors when calling agent', async () => {
     const mockSubHubData = {
       id: 1,
       chapters: []
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)
     fetch.mockRejectedValue(new Error('Network error'))


     process.env.AGENT_API_URL = 'http://localhost:3001'


     await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(500)
   })


   it('should handle database errors', async () => {
     mockSubHub.findFirst.mockRejectedValue(new Error('Database error'))


     await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(500)
   })


   it('should handle case when subHub does not exist', async () => {
     mockSubHub.findFirst.mockResolvedValue(null)

     const mockAgentResponse = {
       'New Chapter': 'New summary'
     }


     fetch.mockResolvedValue({
       ok: true,
       json: jest.fn().mockResolvedValue(mockAgentResponse)
     })


     process.env.AGENT_API_URL = 'http://localhost:3001'


     const response = await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(200)


     expect(fetch).toHaveBeenCalled()
     expect(response.body).toEqual(mockAgentResponse)
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
     unauthApp.use(chapterRoutes)


     await request(unauthApp)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://www.youtube.com/watch?v=test' })
       .expect(401)
   })
 })
})
