const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")

const prisma = new PrismaClient()
const router = Router()

// Get all posts for community feed with filtering options
router.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
        const { feedType, page = 1, limit = 10 } = req.query
        const userId = req.user.id
        const skip = (page - 1) * limit
        
        let whereClause = {}
        
        if (feedType === 'following') {
            // Get posts from users that the current user follows
            const following = await prisma.user.findUnique({
                where: { id: userId },
                select: { following: { select: { id: true } } }
            })
            const followingIds = following.following.map(user => user.id)
            whereClause = {
                userId: { in: followingIds }
            }
        } else if (feedType === 'followers') {
            // Get posts from users that follow the current user
            const followers = await prisma.user.findUnique({
                where: { id: userId },
                select: { followedBy: { select: { id: true } } }
            })
            const followerIds = followers.followedBy.map(user => user.id)
            whereClause = {
                userId: { in: followerIds }
            }
        }
        // For 'all' or no feedType, we don't add any where clause (get all posts)

        const posts = await prisma.post.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                likes: {
                    include: {
                        user: {
                            select: { id: true, email: true }
                        }
                    }
                },
                sharedSubHub: {
                    select: {
                        id: true,
                        name: true,
                        youtubeUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        })

        // Add like count and user's like status to each post
        const postsWithLikeInfo = posts.map(post => ({
            ...post,
            like: post.likes.length,
            isLikedByUser: post.likes.some(like => like.userId === userId)
        }))

        res.json(postsWithLikeInfo)
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch posts",
            details: error.message
        })
    }
})

// Create a new post
router.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
        const { title, content, sharedSubHubId } = req.body
        const userId = req.user.id

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                userId,
                sharedSubHubId: sharedSubHubId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                likes: true,
                sharedSubHub: {
                    select: {
                        id: true,
                        name: true,
                        youtubeUrl: true
                    }
                }
            }
        })

        res.status(201).json({
            ...newPost,
            like: newPost.likes.length,
            isLikedByUser: false
        })
    } catch (error) {
        res.status(500).json({
            error: "Failed to create post",
            details: error.message
        })
    }
})

// Like/unlike a post
router.post("/api/posts/:postId/like", isAuthenticated, async (req, res) => {
    try {
        const { postId } = req.params
        const userId = req.user.id

        // Check if user already liked this post
        const existingLike = await prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: parseInt(postId)
                }
            }
        })

        if (existingLike) {
            // Unlike the post
            await prisma.postLike.delete({
                where: { id: existingLike.id }
            })
            res.json({ liked: false, message: "Post unliked" })
        } else {
            // Like the post
            await prisma.postLike.create({
                data: {
                    userId,
                    postId: parseInt(postId)
                }
            })
            res.json({ liked: true, message: "Post liked" })
        }
    } catch (error) {
        res.status(500).json({
            error: "Failed to like/unlike post",
            details: error.message
        })
    }
})

// Add a comment to a post
router.post("/api/posts/:postId/comment", isAuthenticated, async (req, res) => {
    try {
        const { postId } = req.params
        const { comment } = req.body
        const userId = req.user.id

        const newComment = await prisma.postComment.create({
            data: {
                comment,
                postId: parseInt(postId),
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json({
            error: "Failed to add comment",
            details: error.message
        })
    }
})

// Delete a post (only by owner)
router.delete("/api/posts/:postId", isAuthenticated, async (req, res) => {
    try {
        const { postId } = req.params
        const userId = req.user.id

        // Check if the post belongs to the current user
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
            select: { userId: true }
        })

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        if (post.userId !== userId) {
            return res.status(403).json({ error: "Not authorized to delete this post" })
        }

        await prisma.post.delete({
            where: { id: parseInt(postId) }
        })

        res.json({ message: "Post deleted successfully" })
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete post",
            details: error.message
        })
    }
})

// Share a SubHub as a post with chapter summary
router.post("/api/posts/share-subhub", isAuthenticated, async (req, res) => {
    try {
        const { subHubId, title, content } = req.body
        const userId = req.user.id

        // Verify the subhub exists and belongs to the user
        const subHub = await prisma.subHub.findFirst({
            where: {
                id: parseInt(subHubId),
                learningHub: {
                    userId: userId
                }
            },
            include: {
                learningHub: true,
                chapters: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!subHub) {
            return res.status(404).json({ error: "SubHub not found or not authorized" })
        }

        // Generate smart content from chapters or fetch them if not in database
        let postTitle = title || `📚 My Learning Journey: ${subHub.name}`
        let postContent = content

        if (!content) {
            // If we have chapters in database, use them
            if (subHub.chapters.length > 0) {
                // Create essay-style content from key insights
                const insights = subHub.chapters.slice(0, 4).map(chapter => {
                    return chapter.summary.length > 100 
                        ? chapter.summary.substring(0, 97) + "..."
                        : chapter.summary
                })

                const totalChapters = subHub.chapters.length
                const moreText = totalChapters > 4 ? ` The course covered ${totalChapters} key areas, each building on the previous concepts.` : ''

                // Create flowing essay content
                let essayContent = `Just completed my learning journey with "${subHub.name}" and I'm excited to share what I discovered! 🧠\n\n`
                
                if (insights.length >= 2) {
                    essayContent += `${insights[0]} This foundation helped me understand ${insights[1].toLowerCase()}`
                    
                    if (insights.length >= 3) {
                        essayContent += ` Building on these concepts, I learned that ${insights[2].toLowerCase()}`
                        
                        if (insights.length >= 4) {
                            essayContent += ` The most valuable takeaway was understanding ${insights[3].toLowerCase()}`
                        }
                    }
                } else if (insights.length === 1) {
                    essayContent += insights[0]
                }

                essayContent += moreText
                essayContent += `\n\nThis learning experience has been incredibly valuable and I'm already thinking about how to apply these insights in real projects. What's your experience with similar topics?`

                postContent = `${essayContent}

#Learning #TechTips #Growth #Education #KnowledgeSharing`
            } else if (subHub.youtubeUrl) {
                // If no chapters in database, fetch them from agent and use for sharing
                try {
                    const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/chapters`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            youtubeUrl: subHub.youtubeUrl
                        })
                    })

                    if (agentResponse.ok) {
                        const chaptersData = await agentResponse.json()
                        
                        // Save chapters to database for future use
                        const chapterEntries = Object.entries(chaptersData).map(([chapterTitle, summary]) => ({
                            title: chapterTitle,
                            summary: summary,
                            subHubId: parseInt(subHubId)
                        }))

                        await prisma.chapter.createMany({
                            data: chapterEntries
                        })

                        // Create essay-style post content from fresh chapters
                        const insights = Object.entries(chaptersData).slice(0, 4).map(([chapterTitle, summary]) => {
                            return summary.length > 100 
                                ? summary.substring(0, 97) + "..."
                                : summary
                        })

                        const totalChapters = Object.keys(chaptersData).length
                        const moreText = totalChapters > 4 ? ` The course covered ${totalChapters} key areas, each building on the previous concepts.` : ''

                        // Create flowing essay content
                        let essayContent = `Just completed my learning journey with "${subHub.name}" and I'm excited to share what I discovered! 🧠\n\n`
                        
                        if (insights.length >= 2) {
                            essayContent += `${insights[0]} This foundation helped me understand ${insights[1].toLowerCase()}`
                            
                            if (insights.length >= 3) {
                                essayContent += ` Building on these concepts, I learned that ${insights[2].toLowerCase()}`
                                
                                if (insights.length >= 4) {
                                    essayContent += ` The most valuable takeaway was understanding ${insights[3].toLowerCase()}`
                                }
                            }
                        } else if (insights.length === 1) {
                            essayContent += insights[0]
                        }

                        essayContent += moreText
                        essayContent += `\n\nThis learning experience has been incredibly valuable and I'm already thinking about how to apply these insights in real projects. What's your experience with similar topics?`

                        postContent = `${essayContent}

#Learning #TechTips #Growth #Education #KnowledgeSharing`
                    } else {
                        throw new Error("Failed to fetch chapters from AI agent")
                    }
                } catch (agentError) {
                    // Fallback to generic content
                    postContent = `I've been exploring "${subHub.name}" and it's been an amazing learning experience! 🚀

This content has given me so many valuable insights. Can't wait to apply what I've learned!

#Learning #Growth #Knowledge #Education`
                }
            } else {
                // Fallback if no YouTube URL
                postContent = `I've been working on "${subHub.name}" and wanted to share my learning journey! 🚀

#Learning #Growth #Knowledge`
            }
        }

        const sharedPost = await prisma.post.create({
            data: {
                title: postTitle,
                content: postContent,
                userId,
                sharedSubHubId: parseInt(subHubId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                comment: true,
                likes: true,
                sharedSubHub: {
                    select: {
                        id: true,
                        name: true,
                        youtubeUrl: true
                    }
                }
            }
        })

        res.status(201).json({
            ...sharedPost,
            like: sharedPost.likes.length,
            isLikedByUser: false
        })
    } catch (error) {
        res.status(500).json({
            error: "Failed to share SubHub",
            details: error.message
        })
    }
})

module.exports = router 