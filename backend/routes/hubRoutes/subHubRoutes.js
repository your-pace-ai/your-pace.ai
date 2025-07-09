const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const prisma = new PrismaClient()
const router = express.Router()

// get all subhubs for a learning hub
router.get("/api/learning-hub/subhub", isAuthenticated, async (req, res) => {
    try {
        const { body: { learningHubId } } = req
        const learningHub = await prisma.learningHub.findFirst({
            where: {
                id: learningHubId
            },
            include: {
                subHub: true
            }
        })
        res.json(learningHub.subHub)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post("/api/subhub/create", isAuthenticated, async (req, res) => {
    try {
        const { body: { title, youtubeUrl, learningHubId} } = req
        const userId = req.user.id
        let hubId = learningHubId

        if (!hubId) {
            const learningHub = await prisma.learningHub.create({
                data: {
                    name: title,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            })
            hubId = learningHub.id
        } else {
            const learningHub = await prisma.learningHub.findFirst({
                where: {
                    id: hubId
                }
            })

            if (!learningHub) return res.status(404).json({ message: "Learning hub not found" })
        }

        const subhub = await prisma.subHub.create({
            data: {
                name: title,
                youtubeUrl: youtubeUrl,
                learningHub: {
                    connect: {
                        id: hubId
                    }
                }
            }
        })
        res.json(subhub)

    } catch (error) {
        res.status(500).json({ error: "Failed to create subub" })
    }
})

router.get("/api/subhub", isAuthenticated, async (req, res) => {
    try {
        const { body: { subHubId } } = req
        const subHub = await prisma.subHub.findFirst({
            where: {
                id: subHubId
            },
            include: {
                chapters: true,
                subHubComment: true,
                flashCard: true,
                quiz: true
            }
        })
        res.json(subHub)

    } catch (error) {
        res.status(500).json({ error: "Failed to get subhub" })
    }
})

router.get("/api/subhub/all", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        const learningHubs = await prisma.learningHub.findMany({
            where: {
                userId: userId
            },
            include: {
                subHub: true
            }
        })

        const subHubs = learningHubs.flatMap(hub => hub.subHub)
        res.json(subHubs)
    } catch (error) {
        res.status(500).json({ error: "Failed to get all subhub"})
    }
})

router.delete("/api/subhub/delete", isAuthenticated, async (req, res) => {
    try {
        const { body : { subHubId } } = req
        const userId = req.user.id
        const subHub = await prisma.subHub.findFirst({
            where: {
                id: subHubId
            },
            include: {
                learningHub: true
            }
        })
        if (!subHub || subHub.learningHub.userId !== userId) return res.status(404).json({ message: "Subhub not found" })

        const deletedSubHub = await prisma.subHub.delete({
            where: {
                id: subHubId
            }
        })
        res.json(deletedSubHub)
    } catch (error) {
        res.status(500).json({ error: "Failed to delete subhub" })
    }
})

module.exports = router
