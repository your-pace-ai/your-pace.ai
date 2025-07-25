const request = require('supertest')
const express = require('express')


const mockFlashCard = { findMany: jest.fn() }
const mockQuiz = { findMany: jest.fn() }
const mockSubHub = { findMany: jest.fn() }
const mockChapter = { findMany: jest.fn() }
const mockPost = { findMany: jest.fn() }


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   flashCard: mockFlashCard,
   quiz: mockQuiz,
   subHub: mockSubHub,
   chapter: mockChapter,
   post: mockPost
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


jest.mock('../../typeAhead/typeAhead.js', () => ({
 AutocompleteSystem: jest.fn().mockImplementation(() => ({
   search: jest.fn().mockReturnValue(['test suggestion']),
   indexContent: jest.fn()
 })),
 buildTypeaheadIndex: jest.fn().mockResolvedValue({ test: 'data' }),
 levenshteinDistance: jest.fn().mockReturnValue(1)
}))


const { PrismaClient } = require('@prisma/client')
const searchRoutes = require('../../routes/searchRoutes/searchRoutes')


describe('Search Routes', () => {
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
   app.use(searchRoutes)
 })


 describe('POST /api/search', () => {
   it('should return empty results for empty query', async () => {
     const response = await request(app)
       .post('/api/search')
       .send({ query: '' })
       .expect(200)


     expect(response.body).toEqual({
       flashcards: [],
       quizzes: [],
       subHubs: [],
       chapters: [],
       posts: [],
       totalResults: 0
     })


     expect(mockFlashCard.findMany).not.toHaveBeenCalled()
   })


   it('should search across all content types', async () => {
     const mockFlashcards = [{
       id: 1,
       question: 'Test question',
       answer: 'Test answer',
       subHub: {
         id: 1,
         name: 'Test SubHub',
         learningHub: {
           id: 1,
           name: 'Test Learning Hub'
         }
       }
     }]
     const mockQuizzes = [{
       id: 1,
       question: 'Test quiz question',
       answer: 'Test quiz answer',
       options: ['A', 'B', 'C'],
       subHub: {
         id: 1,
         name: 'Test SubHub',
         learningHub: {
           id: 1,
           name: 'Test Learning Hub'
         }
       }
     }]
     const mockSubHubs = [{
       id: 1,
       name: 'Test subhub',
       aiSummary: 'Test summary',
       learningHub: {
         id: 1,
         name: 'Test Learning Hub'
       },
       _count: {
         chapters: 5
       },
       youtubeUrl: 'https://youtube.com/test',
       category: 'test'
     }]
     const mockChapters = [{
       id: 1,
       title: 'Test chapter',
       summary: 'Test chapter summary',
       subHub: {
         id: 1,
         name: 'Test SubHub',
         learningHub: {
           id: 1,
           name: 'Test Learning Hub'
         }
       }
     }]
     const mockPosts = [{
       id: 1,
       title: 'Test post',
       content: 'Test post content',
       user: {
         id: 1,
         firstName: 'John',
         lastName: 'Doe',
         email: 'john@example.com'
       },
       sharedSubHub: {
         id: 1,
         name: 'Test SubHub',
         learningHub: {
           id: 1,
           name: 'Test Learning Hub'
         }
       }
     }]


     mockFlashCard.findMany.mockResolvedValue(mockFlashcards)
     mockQuiz.findMany.mockResolvedValue(mockQuizzes)
     mockSubHub.findMany.mockResolvedValue(mockSubHubs)
     mockChapter.findMany.mockResolvedValue(mockChapters)
     mockPost.findMany.mockResolvedValue(mockPosts)


     const response = await request(app)
       .post('/api/search')
       .send({ query: 'test', limit: 10 })
       .expect(200)


     expect(mockFlashCard.findMany).toHaveBeenCalledWith({
       where: {
         OR: [
           { question: { contains: 'test', mode: 'insensitive' } },
           { answer: { contains: 'test', mode: 'insensitive' } }
         ]
       },
       include: {
         subHub: {
           select: {
             id: true,
             name: true,
             learningHub: {
               select: {
                 id: true,
                 name: true
               }
             }
           }
         }
       },
       take: 10
     })


     expect(response.body.flashcards).toHaveLength(1)
     expect(response.body.quizzes).toHaveLength(1)
     expect(response.body.subHubs).toHaveLength(1)
     expect(response.body.chapters).toHaveLength(1)
     expect(response.body.posts).toHaveLength(1)
     expect(response.body.totalResults).toBe(5)
     expect(response.body.query).toBe('test')
   })


   it('should handle custom limit parameter', async () => {
     mockFlashCard.findMany.mockResolvedValue([])
     mockQuiz.findMany.mockResolvedValue([])
     mockSubHub.findMany.mockResolvedValue([])
     mockChapter.findMany.mockResolvedValue([])
     mockPost.findMany.mockResolvedValue([])


     await request(app)
       .post('/api/search')
       .send({ query: 'test', limit: 5 })
       .expect(200)


     expect(mockFlashCard.findMany).toHaveBeenCalledWith(
       expect.objectContaining({ take: 5 })
     )
   })


   it('should handle database errors', async () => {
     mockFlashCard.findMany.mockRejectedValue(new Error('Database error'))


     await request(app)
       .post('/api/search')
       .send({ query: 'test' })
       .expect(500)
   })


   it('should trim whitespace from query', async () => {
     mockFlashCard.findMany.mockResolvedValue([])
     mockQuiz.findMany.mockResolvedValue([])
     mockSubHub.findMany.mockResolvedValue([])
     mockChapter.findMany.mockResolvedValue([])
     mockPost.findMany.mockResolvedValue([])


     await request(app)
       .post('/api/search')
       .send({ query: '  test  ' })
       .expect(200)


     expect(mockFlashCard.findMany).toHaveBeenCalledWith(
       expect.objectContaining({
         where: {
           OR: [
             { question: { contains: 'test', mode: 'insensitive' } },
             { answer: { contains: 'test', mode: 'insensitive' } }
           ]
         }
       })
     )
   })
 })


 describe('POST /api/typeahead', () => {
   it('should return empty suggestions for empty query', async () => {
     const response = await request(app)
       .post('/api/typeahead')
       .send({ query: '' })
       .expect(200)


     expect(response.body).toEqual({ suggestions: [] })
   })


   it('should return typeahead suggestions', async () => {
     const mockSubHubs = [{ id: 1, name: 'Test subhub', aiSummary: 'Test summary', youtubeUrl: 'https://youtube.com/test', category: 'test' }]
     const mockChapters = [{ id: 1, title: 'Test chapter', summary: 'Test summary', subHub: { id: 1, name: 'Test SubHub', youtubeUrl: 'https://youtube.com/test' } }]
     const mockFlashcards = [{ id: 1, question: 'Test question', answer: 'Test answer', subHub: { id: 1, name: 'Test SubHub', youtubeUrl: 'https://youtube.com/test' } }]
     const mockQuizzes = [{ id: 1, question: 'Test quiz', answer: 'Test answer', subHub: { id: 1, name: 'Test SubHub', youtubeUrl: 'https://youtube.com/test' } }]
     const mockPosts = [{ id: 1, title: 'Test post', content: 'Test content', sharedSubHub: { id: 1, name: 'Test SubHub', youtubeUrl: 'https://youtube.com/test' } }]


     mockSubHub.findMany.mockResolvedValue(mockSubHubs)
     mockChapter.findMany.mockResolvedValue(mockChapters)
     mockFlashCard.findMany.mockResolvedValue(mockFlashcards)
     mockQuiz.findMany.mockResolvedValue(mockQuizzes)
     mockPost.findMany.mockResolvedValue(mockPosts)


     const response = await request(app)
       .post('/api/typeahead')
       .send({ query: 'test', maxResults: 10 })
       .expect(200)


     expect(response.body.query).toBe('test')
     expect(response.body.suggestions).toBeDefined()
     expect(response.body.totalFound).toBeDefined()
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
     unauthApp.use(searchRoutes)


     await request(unauthApp)
       .post('/api/search')
       .send({ query: 'test' })
       .expect(401)
   })
 })
})
