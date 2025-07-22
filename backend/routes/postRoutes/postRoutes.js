const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const fetch = require("../../utils/fetch.js")
const { extractThumbnailFromUrl } = require("../../utils/youtubeThumbnail.js")
const topKRecommendations = require("../../recommendationAlgo/recommendation")

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

       // Get thumbnail from shared SubHub if available
       let thumbnail = null
       if (sharedSubHubId) {
           const sharedSubHub = await prisma.subHub.findUnique({
               where: { id: parseInt(sharedSubHubId) },
               select: { youtubeUrl: true }
           })
           if (sharedSubHub && sharedSubHub.youtubeUrl) {
               thumbnail = extractThumbnailFromUrl(sharedSubHub.youtubeUrl, 'hqdefault')
           }
       }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                userId,
                sharedSubHubId: sharedSubHubId || null,
                thumbnail: thumbnail
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

       if (!subHub) return res.status(404).json({ error: "SubHub not found or not authorized" })

       // Generate Twitter-style summary using AI agent
       let postTitle = title || `📚 ${subHub.name}`
       let postContent = content

       if (!content) {
           try {
               // Check if we have cached AI summary
               if (subHub.aiSummary) {
                   postContent = subHub.aiSummary
               } else if (subHub.chapters.length > 0) {
                   // Use existing chapters to generate Twitter-style summary
                   const summaryResponse = await fetch(`${process.env.AGENT_API_URL}/api/summary-from-chapters`, {
                       method: "POST",
                       headers: {
                           "Content-Type": "application/json"
                       },
                       body: JSON.stringify({
                           chapters: subHub.chapters.map(ch => ({
                               title: ch.title,
                               summary: ch.summary
                           }))
                       })
                   })

                   if (summaryResponse.ok) {
                       const { summary } = await summaryResponse.json()
                       postContent = summary

                       // Cache the AI summary for future use
                       await prisma.subHub.update({
                           where: { id: parseInt(subHubId) },
                           data: { aiSummary: summary }
                       })
                   } else {
                       throw new Error("Failed to generate summary from chapters")
                   }
               } else if (subHub.youtubeUrl) {
                   // Generate summary directly from YouTube URL
                   const summaryResponse = await fetch(`${process.env.AGENT_API_URL}/api/summary`, {
                       method: "POST",
                       headers: {
                           "Content-Type": "application/json"
                       },
                       body: JSON.stringify({
                           youtubeUrl: subHub.youtubeUrl
                       })
                   })

                   if (summaryResponse.ok) {
                       const { summary } = await summaryResponse.json()
                       postContent = summary

                       // Cache the AI summary for future use
                       await prisma.subHub.update({
                           where: { id: parseInt(subHubId) },
                           data: { aiSummary: summary }
                       })
                   } else {
                       const errorText = await summaryResponse.text()
                       throw new Error(`Failed to generate summary from YouTube URL: ${errorText}`)
                   }
               } else {
                   // Fallback if no YouTube URL
                   postContent = `Just completed "${subHub.name}" - an amazing learning experience! 🚀 So many valuable insights to apply. #Learning`
               }
           } catch (aiError) {
               // Fallback to simple content if AI fails
               postContent = `Just completed "${subHub.name}" - incredible learning journey! 🧠 Can't wait to apply these insights! #Learning #Growth`
           }
       }
       // Extract thumbnail from YouTube URL
       const thumbnail = subHub.youtubeUrl ? extractThumbnailFromUrl(subHub.youtubeUrl, 'hqdefault') : null
       const sharedPost = await prisma.post.create({
           data: {
               title: postTitle,
               content: postContent,
               userId,
               sharedSubHubId: parseInt(subHubId),
               thumbnail
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

// Get recommended posts (For You feed)
router.get("/api/posts/recommendations", isAuthenticated, async (req, res) => {
   try {
       const userId = req.user.id

       // Get user's following list for enhanced recommendations
       const followingUsers = await prisma.user.findUnique({
           where: { id: userId },
           select: { following: { select: { id: true } } }
       })
       const followingIds = followingUsers.following.map(user => user.id)

       // Fetch all posts that share a SubHub (have a category) and include engagement data
       const posts = await prisma.post.findMany({
           include: {
               user: {
                   select: {
                       id: true,
                       firstName: true,
                       lastName: true,
                       email: true,
                       followedBy: { select: { id: true } }
                   }
               },
               comment: true,
               likes: true,
               sharedSubHub: true
           }
       })

       // Transform posts for recommendation algorithm
       const videoPosts = posts.filter(p => p.sharedSubHub)
       const transformed = videoPosts.map(p => {
           const likes = p.likes.length
           const comments = p.comment.length
           const category = p.sharedSubHub?.category || 'OTHER'
           const isFromFollowing = followingIds.includes(p.userId)
           const postAge = Date.now() - new Date(p.createdAt).getTime()
           const hoursOld = postAge / (1000 * 60 * 60)
           const creatorFollowerCount = p.user.followedBy.length

           return {
               id: p.id,
               post: p,
               category,
               likes,
               comments,
               isFromFollowing,
               hoursOld,
               creatorFollowerCount,
               isOwn: p.userId === userId
           }
       })

       const recommended = topKRecommendations(transformed).filter(r => !r.isOwn)
       const postsRecommended = recommended.map(r => r.post)
       res.json(postsRecommended)
   } catch (error) {
       res.status(500).json({ error: 'Failed to fetch recommendations', details: error.message })
   }
})

module.exports = router
