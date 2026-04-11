// routes/user.routes.js
const express = require('express')
const { getProfile, updateProfile, getLeaderboard, getUserById } = require('../controllers/user.controller')
const { protect } = require('../middleware/auth.middleware')

const router = express.Router()

// GET /api/users/leaderboard  (public)
router.get('/leaderboard', getLeaderboard)

// GET /api/users/me  (protected — your own full profile)
router.get('/me', protect, getProfile)

// PUT /api/users/me  (protected)
router.put('/me', protect, updateProfile)

// GET /api/users/:id  (public — view any player)
router.get('/:id', getUserById)

module.exports = router
