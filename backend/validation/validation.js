const validateLocalSignUp = (req, res, next) => {
    const { body : { email, password } } = req
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    next()
}

module.exports = {
    validateLocalSignUp
}
