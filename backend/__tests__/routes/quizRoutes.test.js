const request = require('supertest')
const express = require('express')


const mockSubHub = {
 findFirst: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   subHub: mockSubHub
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
const quizRoutes = require('../../routes/hubRoutes/quizRoutes')


describe('Quiz Routes', () => {
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
   app.use(quizRoutes)
 })


 describe('GET /api/quizzes/:subHubId/public', () => {
   it('should return formatted quizzes organized by difficulty', async () => {
     const mockSubHubData = {
       quiz: [
         {
           id: 1,
           question: 'Easy question?',
           options: ['A', 'B', 'C', 'D'],
           answer: 'A',
           explanation: 'Easy explanation'
         },
         {
           id: 2,
           question: 'Medium question?',
           options: ['A', 'B', 'C', 'D'],
           answer: 'B',
           explanation: 'Medium explanation'
         },
         {
           id: 3,
           question: 'Hard question?',
           options: ['A', 'B', 'C', 'D'],
           answer: 'C',
           explanation: 'Hard explanation'
         }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(mockSubHub.findFirst).toHaveBeenCalledWith({
       where: {
         id: 1
       },
       include: {
         quiz: {
           orderBy: {
             id: 'asc'
           }
         }
       }
     })


     expect(response.body).toHaveProperty('easy')
     expect(response.body).toHaveProperty('medium')
     expect(response.body).toHaveProperty('hard')
     expect(response.body.easy).toHaveLength(1)
     expect(response.body.medium).toHaveLength(1)
     expect(response.body.hard).toHaveLength(1)
   })


   it('should return empty object when no quizzes exist', async () => {
     const mockSubHubData = {
       quiz: []
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(response.body).toEqual({
       easy: [],
       medium: [],
       hard: []
     })
   })


   it('should handle null quiz array', async () => {
     const mockSubHubData = {
       quiz: null
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(response.body).toEqual({
       easy: [],
       medium: [],
       hard: []
     })
   })


   it('should return 404 for non-existent subhub', async () => {
     mockSubHub.findFirst.mockResolvedValue(null)


     await request(app)
       .get('/api/quizzes/999/public')
       .expect(404)
   })


   it('should handle database errors', async () => {
     mockSubHub.findFirst.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/quizzes/1/public')
       .expect(500)
   })


   it('should provide default explanation when none exists', async () => {
     const mockSubHubData = {
       quiz: [
         {
           id: 1,
           question: 'Test question?',
           options: ['A', 'B', 'C', 'D'],
           answer: 'A',
           explanation: null
         }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(response.body.easy[0].explanation).toBe('No explanation provided')
   })


   it('should distribute quizzes across difficulty levels', async () => {
     const mockSubHubData = {
       quiz: Array.from({ length: 9 }, (_, i) => ({
         id: i + 1,
         question: `Question ${i + 1}?`,
         options: ['A', 'B', 'C', 'D'],
         answer: 'A',
         explanation: `Explanation ${i + 1}`
       }))
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(response.body.easy).toHaveLength(3)
     expect(response.body.medium).toHaveLength(3)
     expect(response.body.hard).toHaveLength(3)
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
     unauthApp.use(quizRoutes)


     await request(unauthApp)
       .get('/api/quizzes/1/public')
       .expect(401)
   })
 })
})
