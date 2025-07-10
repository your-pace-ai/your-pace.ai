const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { isAuthenticated } = require("../../middleware/middleware.js")
const { validateFollowRequestBody } = require("../../middleware/middleware.js")

const router = express.Router()
const prisma = new PrismaClient()

// helper function t0 follow a user (using transaction to make sure both writes succeed gracefully)
const followUser = (id1, id2) => {
    return prisma.$transaction(async() => {
        try {
            const userA = await prisma.user.update({
                where: {
                    id: id1
                },
                data: {
                    following: {
                        connect: {
                            id: id2
                        }
                    }
                }
            })

            const userB = await prisma.user.update({
                where: {
                    id: id2
                },
                data: {
                    followedBy: {
                        connect: {
                            id: id1
                        }
                    }
                }
            })
            return { userA, userB }
        } catch (error) {
            return {cause: error}
        }
    })
}

const unFollowUser = (id1, id2) => {
    return prisma.$transaction(async() => {
        const userA = await prisma.user.update({
            where: {
                id: id1
            },
            data: {
                following: {
                    disconnect: {
                        id: id2
                    }
                }
            }
        })

        const userB = await prisma.user.update({
            where: {
                id: id2
            },
            data: {
                followedBy: {
                    disconnect: {
                        id: id1
                    }
                }
            }
        })

        return { userA, userB }
    })
}

router.patch("/api/follow", isAuthenticated, validateFollowRequestBody, async (req, res) => {
    const { followId } = req.body
    const userId = req.user.id

    try {
        const response = await followUser(userId, followId)
        res.json(response)
    } catch (error) {
        return res.status(400).json({ cause: error })
    }
})

router.patch("/api/unfollow", isAuthenticated, validateFollowRequestBody, async (req, res) => {
    const { followId } = req.body
    const userId = req.user.id

    try {
        const response = await unFollowUser(userId, followId)
        res.json(response)
    } catch (error) {
        return res.status(400).json({ cause: error })
    }
})

module.exports = router
