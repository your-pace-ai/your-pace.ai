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

module.exports = {
    validateLocalSignUp
}
