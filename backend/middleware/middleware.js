const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const validateLocalSignUp = async (req, res, next) => {
    const { body : { email, password } } = req
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (user) return res.status(400).json({ error: 'Email already exists' })
    next()
}

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    return res.status(401).json({ error: 'Not authenticated' })
}

const validateFollowRequestBody = (req, res, next) => {
    const { body : { followId } } = req
    if (!followId) return res.status(400).json({ error: 'Follow ID is required' })
    next()
}

module.exports = {
    validateLocalSignUp,
    isAuthenticated,
    validateFollowRequestBody
}
