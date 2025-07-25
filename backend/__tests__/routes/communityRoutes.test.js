const request = require('supertest')
const express = require('express')


const mockUser = {
 findMany: jest.fn(),
 findUnique: jest.fn(),
 update: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   user: mockUser
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


const { PrismaClient } = require('@prisma/client')
const communityRoutes = require('../../routes/communityRoutes/communityRoutes')


describe('Community Routes', () => {
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
   app.use(communityRoutes)
 })


 describe('GET /api/community/users', () => {
   it('should return all users except current user with follow status', async () => {
     const mockUsers = [
       {
         id: 2,
         email: 'user2@example.com',
         firstName: 'User',
         lastName: 'Two',
         username: 'user2',
         createdAt: '2025-07-24T08:43:20.359Z',
         _count: {
           following: 5,
           followedBy: 3,
           post: 10
         }
       },
       {
         id: 3,
         email: 'user3@example.com',
         firstName: 'User',
         lastName: 'Three',
         username: 'user3',
         createdAt: '2025-07-24T08:43:20.359Z',
         _count: {
           following: 2,
           followedBy: 8,
           post: 5
         }
       }
     ]


     const currentUser = {
       following: [{ id: 2 }]
     }


     mockUser.findMany.mockResolvedValue(mockUsers)
     mockUser.findUnique.mockResolvedValue(currentUser)


     const response = await request(app)
       .get('/api/community/users')
       .expect(200)


     expect(mockUser.findMany).toHaveBeenCalledWith({
       where: {
         id: { not: 1 }
       },
       select: {
         id: true,
         email: true,
         firstName: true,
         lastName: true,
         username: true,
         createdAt: true,
         _count: {
           select: {
             following: true,
             followedBy: true,
             post: true
           }
         }
       },
       orderBy: { createdAt: 'desc' }
     })


     expect(mockUser.findUnique).toHaveBeenCalledWith({
       where: { id: 1 },
       select: {
         following: { select: { id: true } }
       }
     })


     expect(response.body).toEqual([
       {
         ...mockUsers[0],
         isFollowing: true,
         followersCount: 3,
         followingCount: 5,
         postsCount: 10
       },
       {
         ...mockUsers[1],
         isFollowing: false,
         followersCount: 8,
         followingCount: 2,
         postsCount: 5
       }
     ])
   })


   it('should handle empty following list', async () => {
     const mockUsers = [{
       id: 2,
       email: 'user2@example.com',
       firstName: 'User',
       lastName: 'Two',
       username: 'user2',
       createdAt: new Date(),
       _count: {
         following: 0,
         followedBy: 0,
         post: 0
       }
     }]


     const currentUser = {
       following: []
     }


     mockUser.findMany.mockResolvedValue(mockUsers)
     mockUser.findUnique.mockResolvedValue(currentUser)


     const response = await request(app)
       .get('/api/community/users')
       .expect(200)


     expect(response.body[0].isFollowing).toBe(false)
   })


   it('should handle database errors', async () => {
     mockUser.findMany.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/community/users')
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
     unauthApp.use(communityRoutes)


     await request(unauthApp)
       .get('/api/community/users')
       .expect(401)
   })
 })
})
