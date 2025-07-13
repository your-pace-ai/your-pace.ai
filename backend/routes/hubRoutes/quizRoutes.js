const express = require("express")
const { Router } = express
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const { fetch } = require("../../utils/fetch.js")

const prisma = new PrismaClient()
const router = Router()

// Smart quiz endpoint - checks database first, then calls agent if needed
router.post("/api/quizzes/smart-get", isAuthenticated, async (req, res) => {
   try {
       const { youtubeUrl, subHubId } = req.body
       const userId = req.user.id

       if (!youtubeUrl && !subHubId) return res.status(400).json({ error: "YouTube URL or SubHub ID is required" })

       let subHub;

       if (subHubId) {
           // Find SubHub by ID and verify ownership
           try {
               subHub = await prisma.subHub.findFirst({
                   where: {
                       id: parseInt(subHubId),
                       learningHub: {
                           userId: userId
                       }
                   },
                   include: {
                       quiz: {
                           orderBy: { id: 'asc' }
                       }
                   }
               })
           } catch (dbError) {
               return res.status(500).json({ error: 'Database error', details: dbError.message })
           }
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
                   quiz: {
                       orderBy: { id: 'asc' }
                   }
               }
           })
       }
       // If SubHub exists and has quizzes, return them from database
       if (subHub && subHub.quiz.length > 0) {
           const quizData = {
               easy: [],
               medium: [],
               hard: []
           }

           // Organize quizzes by difficulty
           const quizzes = subHub.quiz
           const perDifficulty = Math.ceil(quizzes.length / 3)

           quizzes.forEach((quiz, index) => {
               const formattedQuiz = {
                   question: quiz.question,
                   options: quiz.options,
                   ans: quiz.answer,
                   explanation: quiz.explanation || "No explanation provided"
               }

               if (index < perDifficulty) {
                   quizData.easy.push(formattedQuiz)
               } else if (index < perDifficulty * 2) {
                   quizData.medium.push(formattedQuiz)
               } else {
                   quizData.hard.push(formattedQuiz)
               }
           })

           return res.json(quizData)
       }

       // If no quizzes in database, generate from persisted chapters or URL
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

           let quizData = null
           // First try to use persisted chapters to generate quizzes
           if (targetSubHub && targetSubHub.chapters.length > 0) {
               try {
                   const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/quiz-from-chapters`, {
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
                       quizData = await agentResponse.json()
                   } else {
                       throw new Error("Failed to generate quizzes from chapters")
                   }
               } catch (chapterError) {
                   throw new Error("Failed to generate quizzes from chapters")
               }
           }
           // If chapter-based generation failed or no chapters available, try URL-based generation
           if (!quizData) {
               const targetUrl = youtubeUrl || targetSubHub?.youtubeUrl
               if (!targetUrl) return res.status(400).json({ error: "No YouTube URL or chapters available for quiz generation" })

               try {
                   const agentResponse = await fetch(`${process.env.AGENT_API_URL}/api/quiz`, {
                       method: "POST",
                       headers: {
                           "Content-Type": "application/json"
                       },
                       body: JSON.stringify({
                           youtubeUrl: targetUrl
                       })
                   })

                   if (!agentResponse.ok) throw new Error("Failed to generate quizzes from YouTube URL")
                   quizData = await agentResponse.json()
               } catch (urlError) {
                   return res.status(500).json({ error: "Failed to generate quizzes from both chapters and URL" })
               }
           }
           // Validate quiz data before processing
           if (!quizData || typeof quizData !== 'object') return res.status(500).json({ error: 'Failed to generate quizzes. Please try again.' })

           // Save quizzes to database if we have a SubHub
           if (targetSubHub) {
               try {
                   const quizEntries = []

                   // Double-check quizData is valid before processing
                   if (!quizData || typeof quizData !== 'object') {
                       throw new Error('Invalid quiz data at saving stage')
                   }

                   // Process each difficulty level
                   ['easy', 'medium', 'hard'].forEach(difficulty => {
                       if (quizData[difficulty]) {
                           // Handle both array and object formats
                           const quizzes = Array.isArray(quizData[difficulty])
                               ? quizData[difficulty]
                               : [quizData[difficulty]]

                           if (quizzes && Array.isArray(quizzes)) {
                               quizzes.forEach(quiz => {
                                   quizEntries.push({
                                       question: quiz.question,
                                       options: quiz.options,
                                       answer: quiz.ans,
                                       subHubId: targetSubHub.id
                                   })
                               })
                           }
                       }
               })

               if (quizEntries.length > 0) {
                   await prisma.quiz.createMany({
                       data: quizEntries
                   })
               }
               } catch (saveError) {
                   throw new Error("Failed to save quizzes to database")
               }
           }
           res.json(quizData)
       } catch (agentError) {
           res.status(500).json({
               error: "Failed to generate quizzes",
               details: agentError.message
           })
       }
   } catch (error) {
       res.status(500).json({
           error: "Failed to get quizzes",
           details: error.message
       })
   }
})
// Delete specific quiz
router.delete("/api/quizzes/:quizId", isAuthenticated, async (req, res) => {
   try {
       const { quizId } = req.params
       const userId = req.user.id

       // Verify the quiz belongs to a SubHub owned by the user
       const quiz = await prisma.quiz.findFirst({
           where: {
               id: parseInt(quizId),
               subHub: {
                   learningHub: {
                       userId: userId
                   }
               }
           }
       })

       if (!quiz) return res.status(404).json({ error: "Quiz not found or not authorized" })

       await prisma.quiz.delete({
           where: { id: parseInt(quizId) }
       })

       res.json({ message: "Quiz deleted successfully" })
   } catch (error) {
       res.status(500).json({
           error: "Failed to delete quiz",
           details: "Unable to delete quiz at this time"
       })
   }
})

module.exports = router
