const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const fetch = require("../../utils/fetch.js")

const prisma = new PrismaClient()
const router = Router()

// Smart chapters endpoint - checks database first, then calls agent if needed
router.post("/api/chapters/smart-get", isAuthenticated, async (req, res) => {
    try {
        const { youtubeUrl } = req.body
        const userId = req.user.id

        if (!youtubeUrl) {
            return res.status(400).json({ error: "YouTube URL is required" })
        }

        // Find SubHub by YouTube URL and user
        const subHub = await prisma.subHub.findFirst({
            where: {
                youtubeUrl: youtubeUrl,
                learningHub: {
                    userId: userId
                }
            },
            include: {
                chapters: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        // If SubHub exists and has chapters, return them from database
        if (subHub && subHub.chapters.length > 0) {
            const chaptersData = {}
            subHub.chapters.forEach(chapter => {
                chaptersData[chapter.title] = chapter.summary
            })
            return res.json(chaptersData)
        }

        // If no chapters in database, call the AI agent
        try {
            const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/chapters`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    youtubeUrl: youtubeUrl
                })
            })

            if (!agentResponse.ok) {
                throw new Error("Failed to generate chapters from AI agent")
            }

            const chaptersData = await agentResponse.json()

           // If we don't have a SubHub but have a YouTube URL, try to find it again
           let targetSubHub = subHub
           if (!targetSubHub && youtubeUrl) {
               targetSubHub = await prisma.subHub.findFirst({
                   where: {
                       youtubeUrl: youtubeUrl,
                       learningHub: {
                           userId: userId
                       }
                   }
               })
           }

           // Save chapters to database if we have a SubHub
           if (targetSubHub) {
               const chapterEntries = Object.entries(chaptersData).map(([title, summary]) => ({
                   title,
                   summary,
                   subHubId: targetSubHub.id
               }))

               await prisma.chapter.createMany({
                   data: chapterEntries
               })
           }
           res.json(chaptersData)
       } catch (agentError) {
           res.status(500).json({
               error: "Failed to generate chapters",
               details: "Unable to process video content at this time"
           })
       }
   } catch (error) {
       res.status(500).json({
           error: "Failed to get chapters",
           details: "Internal server error"
       })
   }
})

// Delete specific chapter
router.delete("/api/chapters/:chapterId", isAuthenticated, async (req, res) => {
    try {
        const { chapterId } = req.params
        const userId = req.user.id

        // Verify the chapter belongs to a SubHub owned by the user
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: parseInt(chapterId),
                subHub: {
                    learningHub: {
                        userId: userId
                    }
                }
            }
        })

        if (!chapter) {
            return res.status(404).json({ error: "Chapter not found or not authorized" })
        }

        await prisma.chapter.delete({
            where: { id: parseInt(chapterId) }
        })

        res.json({ message: "Chapter deleted successfully" })
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete chapter",
            details: "Unable to delete chapter at this time"
        })
    }
})

module.exports = router
