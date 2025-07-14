const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")

const prisma = new PrismaClient()
const router = Router()

// Get all users in the application
router.get("/api/community/users", isAuthenticated, async (req, res) => {
    try {
        const currentUserId = req.user.id
        
        const users = await prisma.user.findMany({
            where: {
                // Exclude current user
                id: { not: currentUserId } 
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

        // Check which users the current user is following
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
                following: { select: { id: true } }
            }
        })

        const followingIds = new Set(currentUser.following.map(user => user.id))

        const usersWithFollowStatus = users.map(user => ({
            ...user,
            isFollowing: followingIds.has(user.id),
            followersCount: user._count.followedBy,
            followingCount: user._count.following,
            postsCount: user._count.post
        }))

        res.json(usersWithFollowStatus)
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch users",
            details: error.message
        })
    }
})

// Get followers of current user
router.get("/api/community/followers", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                followedBy: {
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
                    }
                },
                following: {
                    select: { id: true }
                }
            }
        })

        // Get list of users we're following
        const followingIds = new Set(user.following.map(u => u.id))

        const followers = user.followedBy.map(follower => ({
            ...follower,
            followersCount: follower._count.followedBy,
            followingCount: follower._count.following,
            postsCount: follower._count.post,
            isFollowing: followingIds.has(follower.id)
        }))

        res.json(followers)
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch followers",
            details: error.message
        })
    }
})

// Get users that current user is following
router.get("/api/community/following", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                following: {
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
                    }
                }
            }
        })

        const following = user.following.map(followedUser => ({
            ...followedUser,
            followersCount: followedUser._count.followedBy,
            followingCount: followedUser._count.following,
            postsCount: followedUser._count.post
        }))

        res.json(following)
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch following",
            details: error.message
        })
    }
})

// Follow a user
router.post("/api/community/follow/:targetUserId", isAuthenticated, async (req, res) => {
    try {
        const { targetUserId } = req.params
        const currentUserId = req.user.id

        if (targetUserId === currentUserId) {
            return res.status(400).json({ error: "Cannot follow yourself" })
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        })

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" })
        }

        // Check if already following
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
                following: {
                    where: { id: targetUserId }
                }
            }
        })

        if (currentUser.following.length > 0) {
            return res.status(400).json({ error: "Already following this user" })
        }

        // Create follow relationship
        await prisma.user.update({
            where: { id: currentUserId },
            data: {
                following: {
                    connect: { id: targetUserId }
                }
            }
        })

        res.json({ message: "Successfully followed user", following: true })
    } catch (error) {
        res.status(500).json({
            error: "Failed to follow user",
            details: error.message
        })
    }
})

// Unfollow a user
router.delete("/api/community/follow/:targetUserId", isAuthenticated, async (req, res) => {
    try {
        const { targetUserId } = req.params
        const currentUserId = req.user.id

        // Check if currently following
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
                following: {
                    where: { id: targetUserId }
                }
            }
        })

        if (currentUser.following.length === 0) {
            return res.status(400).json({ error: "Not following this user" })
        }

        // Remove follow relationship
        await prisma.user.update({
            where: { id: currentUserId },
            data: {
                following: {
                    disconnect: { id: targetUserId }
                }
            }
        })

        res.json({ message: "Successfully unfollowed user", following: false })
    } catch (error) {
        res.status(500).json({
            error: "Failed to unfollow user",
            details: error.message
        })
    }
})

// Get community stats for current user
router.get("/api/community/stats", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: {
                        following: true,
                        followedBy: true,
                        post: true
                    }
                }
            }
        })

        res.json({
            followersCount: user._count.followedBy,
            followingCount: user._count.following,
            postsCount: user._count.post
        })
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch community stats",
            details: error.message
        })
    }
})

module.exports = router 