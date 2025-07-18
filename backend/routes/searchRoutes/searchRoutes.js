const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { isAuthenticated } = require('../../middleware/middleware')
const { AutocompleteSystem, buildTypeaheadIndex } = require('../../typeAhead/typeAhead.js')

const router = express.Router()
const prisma = new PrismaClient()

// Initialize autocomplete system globally
let autocompleteSystem = null
let lastIndexTime = 0
const INDEX_CACHE_DURATION = 5 * 60 * 1000

// Search across all content types
router.post('/api/search',isAuthenticated, async (req, res) => {
   try {
       const { query, limit = 20 } = req.body

       if (!query || query.trim() === '') {
           return res.json({
               flashcards: [],
               quizzes: [],
               subHubs: [],
               chapters: [],
               posts: [],
               totalResults: 0
           })
       }

       const searchTerm = query.trim()
       const searchLimit = parseInt(limit)

       // Search Flashcards
       const flashcards = await prisma.flashCard.findMany({
           where: {
               OR: [
                   { question: { contains: searchTerm, mode: 'insensitive' } },
                   { answer: { contains: searchTerm, mode: 'insensitive' } }
               ]
           },
           include: {
               subHub: {
                   select: {
                       id: true,
                       name: true,
                       learningHub: {
                           select: {
                               id: true,
                               name: true
                           }
                       }
                   }
               }
           },
           take: searchLimit
       })

       // Search Quizzes
       const quizzes = await prisma.quiz.findMany({
           where: {
               OR: [
                   { question: { contains: searchTerm, mode: 'insensitive' } },
                   { answer: { contains: searchTerm, mode: 'insensitive' } }
               ]
           },
           include: {
               subHub: {
                   select: {
                       id: true,
                       name: true,
                       learningHub: {
                           select: {
                               id: true,
                               name: true
                           }
                       }
                   }
               }
           },
           take: searchLimit
       })

       // Search SubHubs
       const subHubs = await prisma.subHub.findMany({
           where: {
               OR: [
                   { name: { contains: searchTerm, mode: 'insensitive' } },
                   { aiSummary: { contains: searchTerm, mode: 'insensitive' } }
               ]
           },
           include: {
               learningHub: {
                   select: {
                       id: true,
                       name: true
                   }
               },
               _count: {
                   select: {
                       chapters: true
                   }
               }
           },
           take: searchLimit
       })

       // Search Chapters
       const chapters = await prisma.chapter.findMany({
           where: {
               OR: [
                   { title: { contains: searchTerm, mode: 'insensitive' } },
                   { summary: { contains: searchTerm, mode: 'insensitive' } }
               ]
           },
           include: {
               subHub: {
                   select: {
                       id: true,
                       name: true,
                       learningHub: {
                           select: {
                               id: true,
                               name: true
                           }
                       }
                   }
               }
           },
           take: searchLimit
       })

       // Search Posts
       const posts = await prisma.post.findMany({
           where: {
               OR: [
                   { title: { contains: searchTerm, mode: 'insensitive' } },
                   { content: { contains: searchTerm, mode: 'insensitive' } }
               ]
           },
           include: {
               user: {
                   select: {
                       id: true,
                       firstName: true,
                       lastName: true,
                       email: true
                   }
               },
               sharedSubHub: {
                   select: {
                       id: true,
                       name: true,
                       learningHub: {
                           select: {
                               id: true,
                               name: true
                           }
                       }
                   }
               }
           },
           take: searchLimit
       })

       // Calculate total results
       const totalResults = flashcards.length + quizzes.length + subHubs.length + chapters.length + posts.length

       // Format the response
       const results = {
           flashcards: flashcards.map(card => ({
               id: card.id,
               type: 'flashcard',
               title: `Flashcard: ${card.question.substring(0, 50)}...`,
               content: card.answer,
               question: card.question,
               answer: card.answer,
               subHub: card.subHub
           })),
           quizzes: quizzes.map(quiz => ({
               id: quiz.id,
               type: 'quiz',
               title: `Quiz: ${quiz.question.substring(0, 50)}...`,
               content: quiz.answer,
               question: quiz.question,
               answer: quiz.answer,
               options: quiz.options,
               subHub: quiz.subHub
           })),
           subHubs: subHubs.map(subHub => ({
               id: subHub.id,
               type: 'subhub',
               title: subHub.name,
               content: subHub.aiSummary,
               description: subHub.aiSummary,
               learningHub: subHub.learningHubId,
               chapterCount: subHub._count.chapters,
           })),
           chapters: chapters.map(chapter => ({
               id: chapter.id,
               type: 'chapter',
               title: chapter.title,
               content: chapter.summary?.substring(0, 200) + (chapter.summary?.length > 200 ? '...' : ''),
               fullContent: chapter.summary,
               subHub: chapter.subHubId,
           })),
           posts: posts.map(post => ({
               id: post.id,
               type: 'post',
               title: post.title,
               content: post.content?.substring(0, 200) + (post.content?.length > 200 ? '...' : ''),
               user: post.user,
               subHub: post.sharedSubHub,
           })),
           totalResults,
           query: searchTerm
       }

       // update autocomplete index with search results in the background
       if (!autocompleteSystem || Date.now() - lastIndexTime > INDEX_CACHE_DURATION) {
           autocompleteSystem = new AutocompleteSystem()
           lastIndexTime = Date.now()
       }
       autocompleteSystem.indexContent(results)

       res.json(results)
   } catch (error) {
       res.status(500).json({
           error: 'Search failed',
           details: error.message
       })
   }
})

// typeahead autocomplete with fuzzy search
router.post('/api/typeahead', async (req, res) => {
    try {
        const {
            query,
            maxResults = 10,
            includeFuzzy = true,
            rebuildIndex = false
        } = req.body

        if (!query || query.trim() === '') {
            return res.json({ suggestions: [] })
        }

        // rebuild index if requested or if it's stale
        if (!autocompleteSystem || rebuildIndex || Date.now() - lastIndexTime > INDEX_CACHE_DURATION) {
            autocompleteSystem = new AutocompleteSystem()
            lastIndexTime = Date.now()

            // fetch sample data to build index
            const indexData = await buildTypeaheadIndex()
            autocompleteSystem.indexContent(indexData)
        }

        // get suggestions
        const suggestions = autocompleteSystem.search(query, {
            maxResults,
            includeFuzzy,
            // dynamic threshold based on query length
            fuzzyThreshold: Math.min(3, Math.floor(query.length / 3))
        })

        res.json({
            query,
            suggestions,
            totalFound: suggestions.length
        })

    } catch (error) {
        res.status(500).json({
            error: 'Typeahead failed',
            details: error.message
        })
    }
})

module.exports = router
