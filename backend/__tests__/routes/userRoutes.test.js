const request = require('supertest')
const express = require('express')
const session = require('express-session')


jest.mock('../../middleware/middleware.js', () => ({
 isAuthenticated: (req, res, next) => {
   if (req.isAuthenticated && req.isAuthenticated()) {
     next()
   } else {
     res.status(401).json({ error: 'Not authenticated' })
   }
 }
}))


const userRoutes = require('../../routes/userRoutes/userRoutes')


const app = express()
app.use(express.json())
app.use(session({
 secret: 'test-secret',
 resave: false,
 saveUninitialized: false
}))


app.use(userRoutes)


describe('User Routes', () => {
 describe('GET /api/user', () => {
   it('should return user data for authenticated user', async () => {
     const testApp = express()
     testApp.use(express.json())
     testApp.use((req, res, next) => {
       req.isAuthenticated = () => true
       req.user = { id: 123 }
       next()
     })
     testApp.use(userRoutes)


     const response = await request(testApp)
       .get('/api/user')
       .expect(200)


     expect(response.body).toEqual({ user: 123 })
   })


   it('should return 401 for unauthenticated user', async () => {
     const testApp = express()
     testApp.use(express.json())
     testApp.use((req, res, next) => {
       req.isAuthenticated = () => false
       next()
     })
     testApp.use(userRoutes)


     await request(testApp)
       .get('/api/user')
       .expect(401)
   })
 })
})
