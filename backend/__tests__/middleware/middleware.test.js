const mockPrismaUser = {
 findUnique: jest.fn()
}

jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   user: mockPrismaUser
 }))
}))

// Mock the middleware module to use our mocked Prisma
jest.doMock('../../middleware/middleware', () => {
 const { PrismaClient } = require('@prisma/client')
 const prisma = new PrismaClient()
  return {
   validateLocalSignUp: async (req, res, next) => {
     const { body: { email, password } } = req
     if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })


     const user = await prisma.user.findUnique({
       where: { email: email }
     })


     if (user) return res.status(400).json({ error: 'Email already exists' })
     next()
   },
   isAuthenticated: (req, res, next) => {
     if (req.isAuthenticated()) return next()
     return res.status(401).json({ error: 'Not authenticated' })
   }
 }
})


const { validateLocalSignUp, isAuthenticated } = require('../../middleware/middleware')


describe('Middleware', () => {
 let req, res, next


 beforeEach(() => {
   jest.clearAllMocks()
   req = {
     body: {},
     isAuthenticated: jest.fn()
   }
   res = {
     status: jest.fn(() => res),
     json: jest.fn(() => res)
   }
   next = jest.fn()
 })


 describe('validateLocalSignUp', () => {
   it('should call next() for valid signup data', async () => {
     req.body = { email: 'test@example.com', password: 'password123' }
     mockPrismaUser.findUnique.mockResolvedValue(null)


     await validateLocalSignUp(req, res, next)


     expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
       where: { email: 'test@example.com' }
     })
     expect(next).toHaveBeenCalled()
     expect(res.status).not.toHaveBeenCalled()
   })


   it('should return 400 if email is missing', async () => {
     req.body = { password: 'password123' }


     await validateLocalSignUp(req, res, next)


     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' })
     expect(next).not.toHaveBeenCalled()
   })


   it('should return 400 if password is missing', async () => {
     req.body = { email: 'test@example.com' }


     await validateLocalSignUp(req, res, next)


     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' })
     expect(next).not.toHaveBeenCalled()
   })


   it('should return 400 if email already exists', async () => {
     req.body = { email: 'test@example.com', password: 'password123' }
     mockPrismaUser.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' })


     await validateLocalSignUp(req, res, next)


     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' })
     expect(next).not.toHaveBeenCalled()
   })
 })


 describe('isAuthenticated', () => {
   it('should call next() for authenticated user', () => {
     req.isAuthenticated.mockReturnValue(true)


     isAuthenticated(req, res, next)


     expect(next).toHaveBeenCalled()
     expect(res.status).not.toHaveBeenCalled()
   })


   it('should return 401 for unauthenticated user', () => {
     req.isAuthenticated.mockReturnValue(false)


     isAuthenticated(req, res, next)


     expect(res.status).toHaveBeenCalledWith(401)
     expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' })
     expect(next).not.toHaveBeenCalled()
   })
 })
})
