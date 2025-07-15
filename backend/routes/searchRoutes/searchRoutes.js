const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { isAuthenticated } = require('../../middleware/middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Search across all content types
router.get('/api/search', isAuthenticated, async (req, res) => {
   try {
       const { query, limit = 20 } = req.query

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
                   { answer: { contains: searchTerm, mode: 'insensitive' } },
                   {
                       chapter: {
                           title: { contains: searchTerm, mode: 'insensitive' }
                       }
                   }
               ]
           },
           include: {
               chapter: {
                   select: {
                       id: true,
                       title: true,
                       subHub: {
                           select: {
                               id: true,
                               title: true,
                               learningHub: {
                                   select: {
                                       id: true,
                                       title: true
                                   }
                               }
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
                   { correctAnswer: { contains: searchTerm, mode: 'insensitive' } },
                   { wrongAnswer1: { contains: searchTerm, mode: 'insensitive' } },
                   { wrongAnswer2: { contains: searchTerm, mode: 'insensitive' } },
                   { wrongAnswer3: { contains: searchTerm, mode: 'insensitive' } },
                   {
                       chapter: {
                           title: { contains: searchTerm, mode: 'insensitive' }
                       }
                   }
               ]
           },
           include: {
               chapter: {
                   select: {
                       id: true,
                       title: true,
                       subHub: {
                           select: {
                               id: true,
                               title: true,
                               learningHub: {
                                   select: {
                                       id: true,
                                       title: true
                                   }
                               }
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
                   { title: { contains: searchTerm, mode: 'insensitive' } },
                   { description: { contains: searchTerm, mode: 'insensitive' } },
                   {
                       learningHub: {
                           title: { contains: searchTerm, mode: 'insensitive' }
                       }
                   }
               ]
           },
           include: {
               learningHub: {
                   select: {
                       id: true,
                       title: true
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
                   { content: { contains: searchTerm, mode: 'insensitive' } },
                   {
                       subHub: {
                           title: { contains: searchTerm, mode: 'insensitive' }
                       }
                   }
               ]
           },
           include: {
               subHub: {
                   select: {
                       id: true,
                       title: true,
                       learningHub: {
                           select: {
                               id: true,
                               title: true
                           }
                       }
                   }
               },
               _count: {
                   select: {
                       flashCards: true,
                       quizzes: true
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
               learningHub: {
                   select: {
                       id: true,
                       title: true
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
               chapter: card.chapter,
               path: `/hub/${card.chapter?.subHub?.learningHub?.id}/subhub/${card.chapter?.subHub?.id}/chapter/${card.chapter?.id}/flashcards`
           })),
           quizzes: quizzes.map(quiz => ({
               id: quiz.id,
               type: 'quiz',
               title: `Quiz: ${quiz.question.substring(0, 50)}...`,
               content: quiz.correctAnswer,
               question: quiz.question,
               correctAnswer: quiz.correctAnswer,
               options: [quiz.wrongAnswer1, quiz.wrongAnswer2, quiz.wrongAnswer3],
               chapter: quiz.chapter,
               path: `/hub/${quiz.chapter?.subHub?.learningHub?.id}/subhub/${quiz.chapter?.subHub?.id}/chapter/${quiz.chapter?.id}/quizzes`
           })),
           subHubs: subHubs.map(subHub => ({
               id: subHub.id,
               type: 'subhub',
               title: subHub.title,
               content: subHub.description,
               description: subHub.description,
               learningHub: subHub.learningHub,
               chapterCount: subHub._count.chapters,
               path: `/hub/${subHub.learningHub?.id}/subhub/${subHub.id}`
           })),
           chapters: chapters.map(chapter => ({
               id: chapter.id,
               type: 'chapter',
               title: chapter.title,
               content: chapter.content?.substring(0, 200) + (chapter.content?.length > 200 ? '...' : ''),
               fullContent: chapter.content,
               subHub: chapter.subHub,
               flashcardCount: chapter._count.flashCards,
               quizCount: chapter._count.quizzes,
               path: `/hub/${chapter.subHub?.learningHub?.id}/subhub/${chapter.subHub?.id}/chapter/${chapter.id}`
           })),
           posts: posts.map(post => ({
               id: post.id,
               type: 'post',
               title: post.title,
               content: post.content?.substring(0, 200) + (post.content?.length > 200 ? '...' : ''),
               user: post.user,
               learningHub: post.learningHub,
               path: `/community`
           })),
           totalResults,
           query: searchTerm
       }
       res.json(results)
   } catch (error) {
       res.status(500).json({
           error: 'Search failed',
           details: error.message
       })
   }
})

module.exports = router
