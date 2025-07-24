const request = require('supertest')
const express = require('express')


const mockPost = {
 findMany: jest.fn()
}


const mockUser = {
 findUnique: jest.fn()
}


jest.mock('@prisma/client', () => ({
 PrismaClient: jest.fn().mockImplementation(() => ({
   post: mockPost,
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


jest.mock('../../utils/fetch.js', () => jest.fn())
jest.mock('../../utils/youtubeThumbnail.js', () => ({
 extractThumbnailFromUrl: jest.fn()
}))


const { PrismaClient } = require('@prisma/client')
const postRoutes = require('../../routes/postRoutes/postRoutes')


describe('Post Routes', () => {
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
   app.use(postRoutes)
 })


 describe('GET /api/posts', () => {
   const mockPosts = [
     {
       id: 1,
       title: 'Test Post',
       content: 'Test content',
       user: {
         id: 1,
         email: 'test@example.com',
         firstName: 'Test',
         lastName: 'User'
       }
     }
   ]


   it('should return all posts when no feedType specified', async () => {
     const mockPostsWithLikes = mockPosts.map(post => ({
       ...post,
       likes: [],
       comment: [],
       sharedSubHub: null
     }))

     mockPost.findMany.mockResolvedValue(mockPostsWithLikes)


     const response = await request(app)
       .get('/api/posts')
       .expect(200)


     expect(mockPost.findMany).toHaveBeenCalledWith(
       expect.objectContaining({
         where: {},
         skip: 0,
         take: 10
       })
     )

     expect(response.body).toEqual(
       mockPostsWithLikes.map(post => ({
         ...post,
         like: 0,
         isLikedByUser: false
       }))
     )
   })


   it('should filter posts by following users', async () => {
     const followingUser = {
       following: [{ id: 2 }, { id: 3 }]
     }

     const mockPostsWithLikes = mockPosts.map(post => ({
       ...post,
       likes: [],
       comment: [],
       sharedSubHub: null
     }))

     mockUser.findUnique.mockResolvedValue(followingUser)
     mockPost.findMany.mockResolvedValue(mockPostsWithLikes)


     const response = await request(app)
       .get('/api/posts?feedType=following')
       .expect(200)


     expect(mockUser.findUnique).toHaveBeenCalledWith({
       where: { id: 1 },
       select: { following: { select: { id: true } } }
     })

     expect(mockPost.findMany).toHaveBeenCalledWith(
       expect.objectContaining({
         where: {
           userId: { in: [2, 3] }
         },
         skip: 0,
         take: 10
       })
     )
   })


   it('should filter posts by followers', async () => {
     const followersUser = {
       followedBy: [{ id: 4 }, { id: 5 }]
     }

     const mockPostsWithLikes = mockPosts.map(post => ({
       ...post,
       likes: [],
       comment: [],
       sharedSubHub: null
     }))

     mockUser.findUnique.mockResolvedValue(followersUser)
     mockPost.findMany.mockResolvedValue(mockPostsWithLikes)


     const response = await request(app)
       .get('/api/posts?feedType=followers')
       .expect(200)


     expect(mockUser.findUnique).toHaveBeenCalledWith({
       where: { id: 1 },
       select: { followedBy: { select: { id: true } } }
     })

     expect(mockPost.findMany).toHaveBeenCalledWith(
       expect.objectContaining({
         where: {
           userId: { in: [4, 5] }
         },
         skip: 0,
         take: 10
       })
     )
   })


   it('should handle pagination', async () => {
     const mockPostsWithLikes = mockPosts.map(post => ({
       ...post,
       likes: [],
       comment: [],
       sharedSubHub: null
     }))

     mockPost.findMany.mockResolvedValue(mockPostsWithLikes)


     await request(app)
       .get('/api/posts?page=2&limit=5')
       .expect(200)


     expect(mockPost.findMany).toHaveBeenCalledWith(
       expect.objectContaining({
         where: {},
         skip: 5,
         take: 5
       })
     )
   })


   it('should handle database errors', async () => {
     mockPost.findMany.mockRejectedValue(new Error('Database error'))


     await request(app)
       .get('/api/posts')
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
     unauthApp.use(postRoutes)


     await request(unauthApp)
       .get('/api/posts')
       .expect(401)
   })
 })
})
