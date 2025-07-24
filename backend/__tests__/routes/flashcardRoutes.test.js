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
const flashcardRoutes = require('../../routes/hubRoutes/flashcardRoutes')


describe('Flashcard Routes', () => {
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
   app.use(flashcardRoutes)
 })


 describe('GET /api/flashcards/:subHubId/public', () => {
   it('should return formatted flashcards for subhub', async () => {
     const mockSubHubData = {
       flashCard: [
         { id: 1, question: 'Question 1', answer: 'Answer 1' },
         { id: 2, question: 'Question 2', answer: 'Answer 2' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     expect(mockSubHub.findFirst).toHaveBeenCalledWith({
       where: {
         id: 1
       },
       include: {
         flashCard: {
           orderBy: {
             id: 'asc'
           }
         }
       }
     })


     expect(response.body).toEqual({
       flashcard1: {
         front: 'Question 1',
         back: 'Answer 1'
       },
       flashcard2: {
         front: 'Question 2',
         back: 'Answer 2'
       }
     })
   })


   it('should return empty object when no flashcards exist', async () => {
     const mockSubHubData = {
       flashCard: []
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     expect(response.body).toEqual({})
   })


   it('should return empty object when flashCard is null', async () => {
     const mockSubHubData = {
       flashCard: null
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     expect(response.body).toEqual({})
   })


   it('should return 404 for non-existent subhub', async () => {
     mockSubHub.findFirst.mockResolvedValue(null)


     await request(app)
       .get('/api/flashcards/999/public')
       .expect(404)
   })


   it('should handle database errors', async () => {
     mockSubHub.findFirst.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/flashcards/1/public')
       .expect(500)
   })


   it('should correctly format multiple flashcards', async () => {
     const mockSubHubData = {
       flashCard: [
         { id: 1, question: 'What is React?', answer: 'A JavaScript library' },
         { id: 2, question: 'What is Node.js?', answer: 'A JavaScript runtime' },
         { id: 3, question: 'What is Express?', answer: 'A web framework' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     expect(response.body).toEqual({
       flashcard1: {
         front: 'What is React?',
         back: 'A JavaScript library'
       },
       flashcard2: {
         front: 'What is Node.js?',
         back: 'A JavaScript runtime'
       },
       flashcard3: {
         front: 'What is Express?',
         back: 'A web framework'
       }
     })
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
     unauthApp.use(flashcardRoutes)


     await request(unauthApp)
       .get('/api/flashcards/1/public')
       .expect(401)
   })
 })
})
