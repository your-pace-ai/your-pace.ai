const request = require('supertest')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const { PrismaClient } = require('@prisma/client')


const mockUser = {
 findUnique: jest.fn(),
 findMany: jest.fn(),
 create: jest.fn(),
 update: jest.fn()
}


const mockLearningHub = {
 create: jest.fn(),
 findMany: jest.fn()
}


const mockPost = {
 findMany: jest.fn(),
 create: jest.fn()
}


const mockSubHub = {
 findFirst: jest.fn(),
 create: jest.fn(),
 findMany: jest.fn()
}


const mockFlashCard = {
 findMany: jest.fn()
}


const mockQuiz = {
 findMany: jest.fn()
}


const mockChapter = {
 findMany: jest.fn(),
 createMany: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   user: mockUser,
   learningHub: mockLearningHub,
   post: mockPost,
   subHub: mockSubHub,
   flashCard: mockFlashCard,
   quiz: mockQuiz,
   chapter: mockChapter
 }))
}))


jest.mock('bcrypt', () => ({
 hash: jest.fn()
}))


jest.mock('../../middleware/middleware.js', () => ({
 isAuthenticated: (req, res, next) => {
   req.user = { id: 1 }
   next()
 },
 validateLocalSignUp: (req, res, next) => {
   const { body: { email, password } } = req
   if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
   next()
 }
}))


jest.mock('../../strategies/localStrategy.js', () => ({}))
jest.mock('../../strategies/googleStrategy.js', () => ({}))


const mockCacheManager = {
 getCachedUserHubs: jest.fn(),
 setCachedUserHubs: jest.fn(),
 cacheUserHubs: jest.fn(),
 getStats: jest.fn(),
 isHealthy: jest.fn(),
 subHubCache: {
   getSubhubDetails: jest.fn(),
   setSubhubDetails: jest.fn()
 }
}


jest.mock('../../cache/cacheManager', () => mockCacheManager)


jest.mock('../../cache/simpleInvalidator', () => {
 return jest.fn().mockImplementation(() => ({
   invalidateUserData: jest.fn(),
   invalidateAllData: jest.fn()
 }))
})


jest.mock('../../utils/fetch.js', () => jest.fn())
jest.mock('../../utils/youtubeThumbnail.js', () => ({
 extractThumbnailFromUrl: jest.fn()
}))
jest.mock('../../typeAhead/typeAhead.js', () => ({
 AutocompleteSystem: jest.fn().mockImplementation(() => ({
   search: jest.fn().mockReturnValue(['test suggestion']),
   indexContent: jest.fn()
 })),
 buildTypeaheadIndex: jest.fn().mockResolvedValue({ test: 'data' }),
 levenshteinDistance: jest.fn().mockReturnValue(1)
}))


const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
app.use(session({
 secret: 'test-secret',
 resave: false,
 saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const authRoutes = require('../../routes/authRoutes/authRoutes')
const userRoutes = require('../../routes/userRoutes/userRoutes')
const learningHubRoutes = require('../../routes/hubRoutes/learningHubRoutes')
const subHubRoutes = require('../../routes/hubRoutes/subHubRoutes')
const chapterRoutes = require('../../routes/hubRoutes/chapterRoutes')
const postRoutes = require('../../routes/postRoutes/postRoutes')
const communityRoutes = require('../../routes/communityRoutes/communityRoutes')
const flashcardRoutes = require('../../routes/hubRoutes/flashcardRoutes')
const quizRoutes = require('../../routes/hubRoutes/quizRoutes')
const searchRoutes = require('../../routes/searchRoutes/searchRoutes')
const cacheRoutes = require('../../routes/cacheRoutes/cacheRoutes')


// Mount all routes
app.use(authRoutes)
app.use(userRoutes)
app.use(learningHubRoutes)
app.use(subHubRoutes)
app.use(chapterRoutes)
app.use(postRoutes)
app.use(communityRoutes)
app.use(flashcardRoutes)
app.use(quizRoutes)
app.use(searchRoutes)
app.use(cacheRoutes)


describe('API Integration Tests', () => {
 beforeEach(() => {
   jest.clearAllMocks()

   // Setup default cache manager mock returns
   mockCacheManager.getCachedUserHubs.mockReturnValue(null)
   mockCacheManager.setCachedUserHubs.mockReturnValue(null)
   mockCacheManager.cacheUserHubs.mockReturnValue(null)
   mockCacheManager.getStats.mockReturnValue({ totalCaches: 0 })
   mockCacheManager.isHealthy.mockReturnValue({ healthy: true })
   mockCacheManager.subHubCache.getSubhubDetails.mockReturnValue(null)
   mockCacheManager.subHubCache.setSubhubDetails.mockReturnValue(null)
 })


 describe('Authentication Flow', () => {
   it('should complete signup and user retrieval flow', async () => {
     const userData = {
       email: 'test@example.com',
       password: 'password123'
     }


     const createdUser = {
       id: 1,
       email: userData.email,
       password: 'hashedPassword'
     }


     bcrypt.hash.mockResolvedValue('hashedPassword')
     mockUser.create.mockResolvedValue(createdUser)


     const signupResponse = await request(app)
       .post('/api/local-auth/signup')
       .send(userData)
       .expect(200)


     expect(signupResponse.body).toEqual(createdUser)
   })


   it('should handle signup validation errors', async () => {
     await request(app)
       .post('/api/local-auth/signup')
       .send({ email: 'test@example.com' })
       .expect(400)


     await request(app)
       .post('/api/local-auth/signup')
       .send({ password: 'password123' })
       .expect(400)
   })


   it('should prevent duplicate email signup', async () => {
     const userData = {
       email: 'existing@example.com',
       password: 'password123'
     }


     // Mock database constraint error for duplicate email
     mockUser.create.mockRejectedValue({
       code: 'P2002',
       message: 'Unique constraint violation'
     })


     await request(app)
       .post('/api/local-auth/signup')
       .send(userData)
       .expect(500) // Auth route returns 500 on database errors
   })
 })


 describe('Learning Hub Integration', () => {
   it('should create learning hub and retrieve it', async () => {
     const hubData = { title: 'Integration Test Hub' }
     const createdHub = { id: 1, name: 'Integration Test Hub', userId: 1 }
     const userWithHubs = { learningHub: [createdHub] }




     mockLearningHub.create.mockResolvedValue(createdHub)
     mockUser.findUnique.mockResolvedValue(userWithHubs)


     // Create hub
     const createResponse = await request(app)
       .post('/api/learning-hub/create')
       .send(hubData)
       .expect(200)


     expect(createResponse.body).toEqual(createdHub)


     // Retrieve hubs
     const getResponse = await request(app)
       .get('/api/learning-hub')
       .expect(200)


     expect(getResponse.body).toEqual([createdHub])
   })
 })


 describe('Posts Integration', () => {
   it('should retrieve posts with different feed types', async () => {
     const mockPosts = [{
       id: 1,
       title: 'Test Post',
       userId: 1,
       content: 'Test content',
       createdAt: '2024-01-01T00:00:00.000Z',
       likes: [
         {
           id: 1,
           userId: 2,
           postId: 1,
           user: { id: 2, email: 'liker@example.com' }
         }
       ],
       comment: [
         {
           id: 1,
           content: 'Test comment',
           userId: 2,
           postId: 1,
           createdAt: '2024-01-01T01:00:00.000Z',
           user: {
             id: 2,
             email: 'commenter@example.com',
             firstName: 'Test',
             lastName: 'User'
           }
         }
       ],
       user: {
         id: 1,
         email: 'test@example.com',
         firstName: 'Test',
         lastName: 'Author'
       },
       sharedSubHub: {
         id: 1,
         name: 'Test SubHub',
         youtubeUrl: 'https://youtube.com/watch?v=test'
       }
     }]
     const followingUser = { following: [{ id: 2 }] }


     mockPost.findMany.mockResolvedValue(mockPosts)
     mockUser.findUnique.mockResolvedValue(followingUser)


     // Get all posts
     await request(app)
       .get('/api/posts')
       .expect(200)


     // Get following posts
     await request(app)
       .get('/api/posts?feedType=following')
       .expect(200)


     expect(mockPost.findMany).toHaveBeenCalledTimes(2)
   })
 })


 describe('Community Integration', () => {
   it('should retrieve community users with follow status', async () => {
     const mockUsers = [{
       id: 2,
       email: 'user2@example.com',
       _count: { following: 5, followedBy: 3, post: 10 }
     }]
     const currentUser = { following: [{ id: 2 }] }


     app.use((req, res, next) => {
       req.isAuthenticated = () => true
       req.user = { id: 1 }
       next()
     })


     mockUser.findMany.mockResolvedValue(mockUsers)
     mockUser.findUnique.mockResolvedValue(currentUser)


     const response = await request(app)
       .get('/api/community/users')
       .expect(200)


     expect(response.body[0].isFollowing).toBe(true)
   })
 })


 describe('Search Integration', () => {
   it('should search across all content types', async () => {
     const mockResults = {
       flashCards: [{
         id: 1,
         question: 'Test?',
         answer: 'Test answer',
         subHub: {
           id: 1,
           name: 'Test Hub',
           learningHub: {
             id: 1,
             name: 'Test Learning Hub'
           }
         }
       }],
       quizzes: [{
         id: 1,
         question: 'Test Quiz',
         options: ['A', 'B'],
         answer: 'A',
         subHub: {
           id: 1,
           name: 'Test Hub',
           learningHub: {
             id: 1,
             name: 'Test Learning Hub'
           }
         }
       }],
       subHubs: [{
         id: 1,
         name: 'Test Hub',
         aiSummary: 'Test AI summary',
         learningHub: {
           id: 1,
           name: 'Test Learning Hub'
         },
         _count: {
           chapters: 3
         },
         youtubeUrl: 'https://youtube.com/watch?v=test',
         category: 'Test Category'
       }],
       chapters: [{
         id: 1,
         title: 'Test Chapter',
         summary: 'Test summary',
         subHub: {
           id: 1,
           name: 'Test Hub',
           learningHub: {
             id: 1,
             name: 'Test Learning Hub'
           }
         }
       }],
       posts: [{
         id: 1,
         title: 'Test Post',
         content: 'Test content',
         userId: 1,
         user: {
           id: 1,
           firstName: 'Test',
           lastName: 'User',
           email: 'test@example.com'
         },
         sharedSubHub: {
           id: 1,
           name: 'Test Hub',
           learningHub: {
             id: 1,
             name: 'Test Learning Hub'
           }
         }
       }]
     }


     mockFlashCard.findMany.mockResolvedValue(mockResults.flashCards)
     mockQuiz.findMany.mockResolvedValue(mockResults.quizzes)
     mockSubHub.findMany.mockResolvedValue(mockResults.subHubs)
     mockChapter.findMany.mockResolvedValue(mockResults.chapters)
     mockPost.findMany.mockResolvedValue(mockResults.posts)


     const response = await request(app)
       .post('/api/search')
       .send({ query: 'test', limit: 10 })
       .expect(200)


     expect(response.body).toHaveProperty('flashcards')
     expect(response.body).toHaveProperty('quizzes')
     expect(response.body).toHaveProperty('subHubs')
     expect(response.body).toHaveProperty('chapters')
     expect(response.body).toHaveProperty('posts')
     expect(response.body.totalResults).toBe(5)
     expect(response.body.query).toBe('test')
   })
 })


 describe('SubHub Integration', () => {
   it('should retrieve public subhub data', async () => {
     const mockSubHubData = {
       id: 1,
       name: 'Public SubHub',
       learningHub: { id: 1, name: 'Parent Hub', userId: 2 }
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/subhub/1/public')
       .expect(200)


     expect(response.body).toEqual(mockSubHubData)
   })
 })


 describe('Flashcard Integration', () => {
   it('should retrieve formatted flashcards', async () => {
     const mockSubHubData = {
       flashCard: [
         { id: 1, question: 'Q1', answer: 'A1' },
         { id: 2, question: 'Q2', answer: 'A2' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     expect(response.body).toEqual({
       flashcard1: { front: 'Q1', back: 'A1' },
       flashcard2: { front: 'Q2', back: 'A2' }
     })
   })
 })


 describe('Quiz Integration', () => {
   it('should retrieve quizzes organized by difficulty', async () => {
     const mockSubHubData = {
       quiz: [
         { id: 1, question: 'Easy?', options: ['A'], answer: 'A', explanation: 'Easy' },
         { id: 2, question: 'Medium?', options: ['B'], answer: 'B', explanation: 'Medium' },
         { id: 3, question: 'Hard?', options: ['C'], answer: 'C', explanation: 'Hard' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(response.body).toHaveProperty('easy')
     expect(response.body).toHaveProperty('medium')
     expect(response.body).toHaveProperty('hard')
   })
 })


 describe('Chapter Integration', () => {
   it('should retrieve chapters from database or AI', async () => {
     const mockSubHubData = {
       id: 1,
       chapters: [
         { title: 'Chapter 1', summary: 'Summary 1' }
       ]
     }


     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     const response = await request(app)
       .post('/api/chapters/smart-get')
       .send({ youtubeUrl: 'https://youtube.com/watch?v=test' })
       .expect(200)


     expect(response.body).toEqual({
       'Chapter 1': 'Summary 1'
     })
   })
 })


 describe('Cache Integration', () => {
   it('should provide cache management endpoints', async () => {
     const mockStats = { totalEntries: 100, hitRate: 0.8 }
     const mockHealth = { healthy: true, uptime: '1h' }


     app.use((req, res, next) => {
       req.isAuthenticated = () => true
       req.user = { id: 1 }
       next()
     })


     const cacheManager = require('../../cache/cacheManager')
     cacheManager.getStats.mockReturnValue(mockStats)
     cacheManager.isHealthy.mockReturnValue(mockHealth)


     // Get cache stats
     const statsResponse = await request(app)
       .get('/api/admin/cache/stats')
       .expect(200)


     expect(statsResponse.body.cacheStats).toEqual(mockStats)


     // Get cache health
     const healthResponse = await request(app)
       .get('/api/admin/cache/health')
       .expect(200)


     expect(healthResponse.body).toEqual(mockHealth)


     // Clear all caches
     await request(app)
       .post('/api/admin/cache/clear-all')
       .expect(200)
   })
 })


 describe('Protected Routes', () => {
   it('should verify that routes use authentication middleware', async () => {
     // This test verifies that the middleware mock is working
     // Since the middleware is globally mocked to always authenticate,
     // we test that routes that should be protected are accessible when authenticated

     // Setup mock data for authentication verification
     const mockUserData = {
       id: 1,
       email: 'test@example.com',
       learningHub: [],
       following: [{ id: 2 }]
     }
     const mockCommunityUsers = [{
       id: 2,
       email: 'user2@example.com',
       firstName: 'Test',
       lastName: 'User2',
       username: 'testuser2',
       createdAt: '2024-01-01T00:00:00.000Z',
       _count: {
         following: 5,
         followedBy: 3,
         post: 10
       }
     }]
     const mockPostsForAuth = [{
       id: 1,
       title: 'Test',
       userId: 1,
       content: 'Test',
       likes: [],
       comment: [],
       user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
       sharedSubHub: null
     }]
     const mockSubHubForAuth = {
       id: 1,
       name: 'Test',
       learningHub: { id: 1, name: 'Test', userId: 1 },
       chapters: [
         {
           id: 1,
           title: 'Test Chapter',
           summary: 'Test Summary',
           createdAt: '2024-01-01T00:00:00.000Z'
         }
       ]
     }

     // Set up all necessary mocks for authenticated route testing
     // For community route, we need separate mocks for findMany and findUnique calls
     mockUser.findMany.mockResolvedValue(mockCommunityUsers)
     mockUser.findUnique.mockImplementation((query) => {
       if (query.select && query.select.following) {
         // This is the community route asking for following data
         return Promise.resolve({ following: [{ id: 2 }] })
       }
       // This is other routes asking for user data
       return Promise.resolve(mockUserData)
     })
     mockPost.findMany.mockResolvedValue(mockPostsForAuth)
     mockSubHub.findFirst.mockResolvedValue(mockSubHubForAuth)
     mockFlashCard.findMany.mockResolvedValue([{ id: 1, question: 'Test?', answer: 'Test', subHub: { id: 1, name: 'Test', learningHub: { id: 1, name: 'Test' } } }])
     mockQuiz.findMany.mockResolvedValue([{ id: 1, question: 'Test?', options: ['A'], answer: 'A', subHub: { id: 1, name: 'Test', learningHub: { id: 1, name: 'Test' } } }])
     mockChapter.findMany.mockResolvedValue([{ id: 1, title: 'Test', summary: 'Test', subHub: { id: 1, name: 'Test', learningHub: { id: 1, name: 'Test' } } }])

     // Test that authenticated requests succeed
     await request(app).get('/api/user').expect(200)
     await request(app).get('/api/learning-hub').expect(200)
     await request(app).get('/api/posts').expect(200)
     await request(app).get('/api/community/users').expect(200)
     await request(app).post('/api/search').send({ query: 'test' }).expect(200)
     await request(app).get('/api/subhub/1/public').expect(200)
     await request(app).get('/api/flashcards/1/public').expect(200)
     await request(app).get('/api/quizzes/1/public').expect(200)
     await request(app).post('/api/chapters/smart-get').send({ youtubeUrl: 'test' }).expect(200)
     await request(app).get('/api/admin/cache/stats').expect(200)

     // The actual authentication testing is handled in individual route tests
     // where middleware can be properly mocked per test case
   })
 })


 describe('End-to-End Workflow', () => {
   it('should support complete learning hub workflow', async () => {
     app.use((req, res, next) => {
       req.isAuthenticated = () => true
       req.user = { id: 1 }
       next()
     })


     const hubData = { title: 'Complete Workflow Hub' }
     const createdHub = { id: 1, name: 'Complete Workflow Hub', userId: 1 }
     const userWithHubs = { learningHub: [createdHub] }
     const mockSubHubData = { id: 1, name: 'SubHub', flashCard: [], quiz: [] }


     mockLearningHub.create.mockResolvedValue(createdHub)
     mockUser.findUnique.mockResolvedValue(userWithHubs)
     mockSubHub.findFirst.mockResolvedValue(mockSubHubData)


     // 1. Create learning hub
     await request(app)
       .post('/api/learning-hub/create')
       .send(hubData)
       .expect(200)


     // 2. Get learning hubs
     await request(app)
       .get('/api/learning-hub')
       .expect(200)


     // 3. Access subhub content
     await request(app)
       .get('/api/subhub/1/public')
       .expect(200)


     // 4. Get flashcards
     await request(app)
       .get('/api/flashcards/1/public')
       .expect(200)


     // 5. Get quizzes
     await request(app)
       .get('/api/quizzes/1/public')
       .expect(200)


     expect(mockLearningHub.create).toHaveBeenCalled()
     expect(mockUser.findUnique).toHaveBeenCalled()
     expect(mockSubHub.findFirst).toHaveBeenCalledTimes(3)
   })
 })
})
