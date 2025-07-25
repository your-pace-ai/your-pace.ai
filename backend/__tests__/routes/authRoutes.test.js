const request = require('supertest')
const express = require('express')

const mockUser = {
 create: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   user: mockUser
 }))
}))


jest.mock('bcrypt', () => ({
 hash: jest.fn()
}))


jest.mock('../../middleware/middleware.js', () => ({
 validateLocalSignUp: (req, res, next) => {
   const { body: { email, password } } = req
   if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
   next()
 }
}))


jest.mock('../../strategies/localStrategy.js', () => ({}))
jest.mock('../../strategies/googleStrategy.js', () => ({}))


const bcrypt = require('bcrypt')
const authRoutes = require('../../routes/authRoutes/authRoutes')


describe('Auth Routes', () => {
 let app


 beforeEach(() => {
   jest.clearAllMocks()
   app = express()
   app.use(express.json())
   app.use(authRoutes)
 })


 describe('POST /api/local-auth/signup', () => {
   it('should create a new user with valid data', async () => {
     const userData = {
       email: 'test@example.com',
       password: 'password123'
     }

     const hashedPassword = 'hashedPassword123'
     const createdUser = {
       id: 1,
       email: userData.email,
       password: hashedPassword
     }


     bcrypt.hash.mockResolvedValue(hashedPassword)
     mockUser.create.mockResolvedValue(createdUser)


     const response = await request(app)
       .post('/api/local-auth/signup')
       .send(userData)
       .expect(200)


     expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12)
     expect(mockUser.create).toHaveBeenCalledWith({
       data: {
         email: userData.email,
         password: hashedPassword
       }
     })
     expect(response.body).toEqual(createdUser)
   })


   it('should return 400 for missing email', async () => {
     await request(app)
       .post('/api/local-auth/signup')
       .send({ password: 'password123' })
       .expect(400)
   })


   it('should return 400 for missing password', async () => {
     await request(app)
       .post('/api/local-auth/signup')
       .send({ email: 'test@example.com' })
       .expect(400)
   })
 })


 describe('POST /api/local-auth/logout', () => {
   it('should logout authenticated user', async () => {
     const testApp = express()
     testApp.use(express.json())
     testApp.use((req, res, next) => {
       req.user = { id: 1 }
       req.logout = jest.fn((callback) => callback(null))
       next()
     })
     testApp.use(authRoutes)


     await request(testApp)
       .post('/api/local-auth/logout')
       .expect(200)
   })


   it('should return 401 for unauthenticated user', async () => {
     const testApp = express()
     testApp.use(express.json())
     testApp.use((req, res, next) => {
       req.user = null
       next()
     })
     testApp.use(authRoutes)


     await request(testApp)
       .post('/api/local-auth/logout')
       .expect(401)
   })


   it('should return 400 for logout error', async () => {
     const testApp = express()
     testApp.use(express.json())
     testApp.use((req, res, next) => {
       req.user = { id: 1 }
       req.logout = jest.fn((callback) => callback(new Error('Logout error')))
       next()
     })
     testApp.use(authRoutes)


     await request(testApp)
       .post('/api/local-auth/logout')
       .expect(400)
   })
 })
})
