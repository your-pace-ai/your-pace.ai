const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { isAuthenticated } = require('../../middleware/middleware')
const { AutocompleteSystem, buildTypeaheadIndex, levenshteinDistance } = require('../../typeAhead/typeAhead.js')

const router = express.Router()
const prisma = new PrismaClient()
const GOOD_MATCH_SCORE = 60
const FUZZY_MATCH_SCALE = 50

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
       const searchLimit = Number(limit)

      // Search all content types in parallel
        const [flashcards, quizzes, subHubs, chapters, posts] = await Promise.all([
          // Search Flashcards
          prisma.flashCard.findMany({
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
          }),
          // Search Quizzes
          prisma.quiz.findMany({
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
          }),
          // Search SubHubs
          prisma.subHub.findMany({
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
          }),
          // Search Chapters
          prisma.chapter.findMany({
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
          }),
          // Search Posts
          prisma.post.findMany({
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
      ])


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
              name: subHub.name,
              content: subHub.aiSummary,
              description: subHub.aiSummary,
              learningHub: subHub.learningHubId,
              chapterCount: subHub._count.chapters,
              youtubeUrl: subHub.youtubeUrl,
              category: subHub.category
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
router.post('/api/typeahead', isAuthenticated, async (req, res) => {
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

        // get suggestions from autocomplete system
        const autocompleteSuggestions = autocompleteSystem.search(query, {
            maxResults,
            includeFuzzy,
            // dynamic threshold based on query length
            fuzzyThreshold: Math.min(3, Math.floor(query.length / 3))
        })

       // Create enhanced search terms including autocomplete suggestions
       const allSearchTerms = new Set([query.trim()])
       autocompleteSuggestions.forEach(suggestion => allSearchTerms.add(suggestion))

       // Get direct database matches for more comprehensive results
       const searchTerm = query.trim()
       const searchLimit = Math.min(maxResults, 10)

       // Create fuzzy search patterns for better misspelling handling
       const fuzzyPatterns = []

       // Add all search terms (original query + autocomplete suggestions)
       allSearchTerms.forEach(term => fuzzyPatterns.push(term))

       // Add single character variations for common typos
       if (searchTerm.length > 2) {
           // Add patterns with single character deletions
           for (let i = 0; i < searchTerm.length; i++) {
               const pattern = searchTerm.slice(0, i) + searchTerm.slice(i + 1)
               if (pattern.length > 1) fuzzyPatterns.push(pattern)
           }

           // Add patterns with single character substitutions (PS:: this is for common keyboard mistakes)
           const keyboardMap = {
               'a': ['s', 'q', 'w'], 'b': ['v', 'g', 'h', 'n'], 'c': ['x', 'd', 'f', 'v'],
               'd': ['s', 'e', 'r', 'f', 'c'], 'e': ['w', 'r', 'd', 's'], 'f': ['d', 'r', 't', 'g', 'c', 'v'],
               'g': ['f', 't', 'y', 'h', 'v', 'b'], 'h': ['g', 'y', 'u', 'j', 'b', 'n'], 'i': ['u', 'o', 'k', 'j'],
               'j': ['h', 'u', 'i', 'k', 'n', 'm'], 'k': ['j', 'i', 'o', 'l', 'm'], 'l': ['k', 'o', 'p'],
               'm': ['n', 'j', 'k'], 'n': ['b', 'h', 'j', 'm'], 'o': ['i', 'p', 'l', 'k'], 'p': ['o', 'l'],
               'q': ['w', 'a'], 'r': ['e', 't', 'f', 'd'], 's': ['a', 'w', 'e', 'd', 'z', 'x'],
               't': ['r', 'y', 'g', 'f'], 'u': ['y', 'i', 'j', 'h'], 'v': ['c', 'f', 'g', 'b'],
               'w': ['q', 'e', 's', 'a'], 'x': ['z', 's', 'd', 'c'], 'y': ['t', 'u', 'h', 'g'],
               'z': ['a', 's', 'x']
           }

           // PS:: Only add a few common substitution patterns to avoid too many queries
           if (searchTerm.length <= 6) {
               for (let i = 0; i < Math.min(2, searchTerm.length); i++) {
                   const char = searchTerm[i].toLowerCase()
                   if (keyboardMap[char]) {
                       keyboardMap[char].slice(0, 2).forEach(replacement => {
                           const pattern = searchTerm.slice(0, i) + replacement + searchTerm.slice(i + 1)
                           fuzzyPatterns.push(pattern)
                       })
                   }
               }
           }
       }

       // Search all content types with fuzzy patterns in parallel
       const [subHubs, chapters, flashcards, quizzes, posts] = await Promise.all([
           // Search SubHubs with fuzzy patterns
           prisma.subHub.findMany({
               where: {
                   OR: fuzzyPatterns.flatMap(pattern => [
                       { name: { contains: pattern, mode: 'insensitive' } },
                       { aiSummary: { contains: pattern, mode: 'insensitive' } }
                   ])
               },
               take: searchLimit
           }),
           // Search Chapters with fuzzy patterns
           prisma.chapter.findMany({
               where: {
                   OR: fuzzyPatterns.flatMap(pattern => [
                       { title: { contains: pattern, mode: 'insensitive' } },
                       { summary: { contains: pattern, mode: 'insensitive' } }
                   ])
               },
               include: {
                   subHub: {
                       select: {
                           id: true,
                           name: true,
                           youtubeUrl: true
                       }
                   }
               },
               take: searchLimit
           }),
           // Search Flashcards with fuzzy patterns
           prisma.flashCard.findMany({
               where: {
                   OR: fuzzyPatterns.flatMap(pattern => [
                       { question: { contains: pattern, mode: 'insensitive' } },
                       { answer: { contains: pattern, mode: 'insensitive' } }
                   ])
               },
               include: {
                   subHub: {
                       select: {
                           id: true,
                           name: true,
                           youtubeUrl: true
                       }
                   }
               },
               take: searchLimit
           }),
           // Search Quizzes with fuzzy patterns
           prisma.quiz.findMany({
               where: {
                   OR: fuzzyPatterns.flatMap(pattern => [
                       { question: { contains: pattern, mode: 'insensitive' } },
                       { answer: { contains: pattern, mode: 'insensitive' } }
                   ])
               },
               include: {
                   subHub: {
                       select: {
                           id: true,
                           name: true,
                           youtubeUrl: true
                       }
                   }
               },
               take: searchLimit
           }),
           // Search Posts with fuzzy patterns
           prisma.post.findMany({
               where: {
                   OR: fuzzyPatterns.flatMap(pattern => [
                       { title: { contains: pattern, mode: 'insensitive' } },
                       { content: { contains: pattern, mode: 'insensitive' } }
                   ])
               },
               include: {
                   sharedSubHub: {
                       select: {
                           id: true,
                           name: true,
                           youtubeUrl: true
                       }
                   }
               },
               take: searchLimit
           })
       ])

       // Helper function to calculate relevance score
       const calculateScore = (text, query) => {
           const lowerText = text.toLowerCase()
           const lowerQuery = query.toLowerCase()

           // Check if text matches any autocomplete suggestion (higher priority)
           const isAutocompleteSuggestion = autocompleteSuggestions.some(suggestion =>
               lowerText.includes(suggestion.toLowerCase())
           )

           // Exact match gets highest score
           if (lowerText === lowerQuery) return isAutocompleteSuggestion ? 110 : 100

           // Starts with query gets high score
           if (lowerText.startsWith(lowerQuery)) return isAutocompleteSuggestion ? 100 : 90

           // Contains query gets medium score
           if (lowerText.includes(lowerQuery)) return isAutocompleteSuggestion ? 85 : 70

           // Check if text contains any autocomplete suggestion
           for (const suggestion of autocompleteSuggestions) {
               if (lowerText.includes(suggestion.toLowerCase())) {
                   return GOOD_MATCH_SCORE
               }
           }

           // Calculate character distance for fuzzy matches
           const distance = levenshteinDistance(lowerQuery, lowerText)
           const maxLength = Math.max(lowerQuery.length, lowerText.length)
           const similarity = 1 - (distance / maxLength)

           return Math.floor(similarity * FUZZY_MATCH_SCALE)
       }

       // Format suggestions with scoring
       const suggestions = [
           ...subHubs.map(subHub => ({
               id: subHub.id,
               type: 'subhub',
               title: subHub.name,
               name: subHub.name,
               youtubeUrl: subHub.youtubeUrl,
               category: subHub.category,
               score: Math.max(
                   calculateScore(subHub.name, searchTerm),
                   subHub.aiSummary ? calculateScore(subHub.aiSummary, searchTerm) : 0
               )
           })),
           ...chapters.map(chapter => ({
               id: chapter.id,
               type: 'chapter',
               title: `${chapter.title} (${chapter.subHub?.name || 'Unknown SubHub'})`,
               name: chapter.title,
               subHub: chapter.subHub,
               score: Math.max(
                   calculateScore(chapter.title, searchTerm),
                   chapter.summary ? calculateScore(chapter.summary, searchTerm) : 0
               )
           })),
           ...flashcards.map(flashcard => ({
               id: flashcard.id,
               type: 'flashcard',
               title: `Flashcard: ${flashcard.question.substring(0, 40)}... (${flashcard.subHub?.name || 'Unknown SubHub'})`,
               name: flashcard.question,
               subHub: flashcard.subHub,
               score: Math.max(
                   calculateScore(flashcard.question, searchTerm),
                   calculateScore(flashcard.answer, searchTerm)
               )
           })),
           ...quizzes.map(quiz => ({
               id: quiz.id,
               type: 'quiz',
               title: `Quiz: ${quiz.question.substring(0, 40)}... (${quiz.subHub?.name || 'Unknown SubHub'})`,
               name: quiz.question,
               subHub: quiz.subHub,
               score: Math.max(
                   calculateScore(quiz.question, searchTerm),
                   calculateScore(quiz.answer, searchTerm)
               )
           })),
           ...posts.map(post => ({
               id: post.id,
               type: 'post',
               title: post.title,
               name: post.title,
               subHub: post.sharedSubHub,
               score: Math.max(
                   calculateScore(post.title, searchTerm),
                   post.content ? calculateScore(post.content, searchTerm) : 0
               )
           }))
       ]
       // Sort by score descending
       .sort((a, b) => b.score - a.score)
       .slice(0, maxResults)
       // Remove score from final result
       .map(({ score, ...item }) => item)

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
