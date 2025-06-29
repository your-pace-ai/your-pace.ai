const express = require("express")
const { isAuthenticated } = require("../../middleware/middleware.js")
const { Router } = express

const router = Router()

router.get("/api/user", isAuthenticated, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
