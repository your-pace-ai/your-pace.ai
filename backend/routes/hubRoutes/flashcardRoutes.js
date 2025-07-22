const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const fetch = require("../../utils/fetch.js")

const prisma = new PrismaClient()
const router = Router()

// Public endpoint to get flashcards for any subhub (this is for the type ahead feature. I need content to be accessible publicly to other authenticated users)
router.get("/api/flashcards/:subHubId/public", isAuthenticated, async (req, res) => {
   try {
       const { subHubId } = req.params

       const subHub = await prisma.subHub.findFirst({
           where: {
               id: parseInt(subHubId)
           },
           include: {
               flashCard: {
                   orderBy: {
                       id: 'asc'
                   }
               }
           }
       })

       if (!subHub) return res.status(404).json({ error: "SubHub not found" })
       if (subHub.flashCard && subHub.flashCard.length > 0) {
           const flashcardsData = {}
           subHub.flashCard.forEach((card, index) => {
               flashcardsData[`flashcard${index + 1}`] = {
                   front: card.question,
                   back: card.answer
               }
           })
           res.json(flashcardsData)
       } else {
           res.json({})
       }
   } catch (error) {
       res.status(500).json({
           error: "Failed to fetch flashcards",
           details: error.message
       })
   }
})

// Smart flashcards endpoint - checks database first, then calls agent if needed
router.post("/api/flashcards/smart-get", isAuthenticated, async (req, res) => {
   try {
       const { youtubeUrl, subHubId } = req.body
       const userId = req.user.id

       if (!youtubeUrl && !subHubId) return res.status(400).json({ error: "YouTube URL or SubHub ID is required" })


       let subHub;

       if (subHubId) {
           // Find SubHub by ID and verify ownership
           subHub = await prisma.subHub.findFirst({
               where: {
                   id: parseInt(subHubId),
                   learningHub: {
                       userId: userId
                   }
               },
               include: {
                   flashCard: {
                       orderBy: { id: 'asc' }
                   }
               }
           })
       } else {
           // Find SubHub by YouTube URL and user
           subHub = await prisma.subHub.findFirst({
               where: {
                   youtubeUrl: youtubeUrl,
                   learningHub: {
                       userId: userId
                   }
               },
               include: {
                   flashCard: {
                       orderBy: { id: 'asc' }
                   }
               }
           })
       }

       // If SubHub exists and has flashcards, return them from database
       if (subHub && subHub.flashCard.length > 0) {
           const flashcardsData = {}
           subHub.flashCard.forEach((card, index) => {
               flashcardsData[`flashcard${index + 1}`] = {
                   front: card.question,
                   back: card.answer
               }
           })
           return res.json(flashcardsData)
       }

       // If no flashcards in database, generate from persisted chapters or URL
       try {
           let targetSubHub = subHub
           if (!targetSubHub && youtubeUrl) {
               targetSubHub = await prisma.subHub.findFirst({
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
           } else if (targetSubHub) {
               // Include chapters if we found SubHub by ID
               targetSubHub = await prisma.subHub.findFirst({
                   where: { id: targetSubHub.id },
                   include: {
                       chapters: {
                           orderBy: { createdAt: 'asc' }
                       }
                   }
               })
           }

           let flashcardsData;

           // First try to use persisted chapters to generate flashcards
           if (targetSubHub && targetSubHub.chapters.length > 0) {

               const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/flash-cards-from-chapters`, {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json"
                   },
                   body: JSON.stringify({
                       chapters: targetSubHub.chapters.map(ch => ({
                           title: ch.title,
                           summary: ch.summary
                       }))
                   })
               })

               if (agentResponse.ok) {
                   flashcardsData = await agentResponse.json()
               } else {
                   throw new Error("Failed to generate flashcards from chapters")
               }
           } else {
               // Fallback to YouTube URL if no chapters available
               const targetUrl = youtubeUrl || targetSubHub?.youtubeUrl
               if (!targetUrl) return res.status(400).json({ error: "No YouTube URL or chapters available for flashcard generation" })

               const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/flash-cards`, {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json"
                   },
                   body: JSON.stringify({
                       youtubeUrl: targetUrl
                   })
               })

               if (!agentResponse.ok) throw new Error("Failed to generate flashcards from YouTube URL")
               flashcardsData = await agentResponse.json()
           }

           // Save flashcards to database if we have a SubHub
           if (targetSubHub) {
               const flashcardEntries = Object.entries(flashcardsData).map(([key, flashcard]) => ({
                   question: flashcard.front,
                   answer: flashcard.back,
                   subHubId: targetSubHub.id
               }))

               await prisma.flashCard.createMany({
                   data: flashcardEntries
               })
           }
       res.json(flashcardsData)
       } catch (agentError) {
           res.status(500).json({
               error: "Failed to generate flashcards",
               details: "Unable to process video content at this time"
           })
       }
   } catch (error) {
       res.status(500).json({
           error: "Failed to get flashcards",
           details: "Internal server error"
       })
   }
})

// Delete specific flashcard
router.delete("/api/flashcards/:flashcardId", isAuthenticated, async (req, res) => {
   try {
       const { flashcardId } = req.params
       const userId = req.user.id

       // Verify the flashcard belongs to a SubHub owned by the user
       const flashcard = await prisma.flashCard.findFirst({
           where: {
               id: parseInt(flashcardId),
               subHub: {
                   learningHub: {
                       userId: userId
                   }
               }
           }
       })
       if (!flashcard) return res.status(404).json({ error: "Flashcard not found or not authorized" })
       await prisma.flashCard.delete({
           where: { id: parseInt(flashcardId) }
       })
       res.json({ message: "Flashcard deleted successfully" })
   } catch (error) {
       res.status(500).json({
           error: "Failed to delete flashcard",
           details: "Unable to delete flashcard at this time"
       })
   }
})

module.exports = router
