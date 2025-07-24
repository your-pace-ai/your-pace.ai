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
