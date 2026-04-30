// routes/game.routes.js
const express = require('express')
const {
  getSupportedGames,
  getGameStats,
  getMyGameProfiles,
  getUserGameProfiles,
  addGameProfile,
  updateGameProfile,
  removeGameProfile,
  getGameLeaderboard,
  getMyStatsSummary,
} = require('../controllers/gameProfile.controller')
const { protect } = require('../middleware/auth.middleware')

const router = express.Router()

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/games/supported
// Returns the full list of games GHQ supports
router.get('/supported', getSupportedGames)

// GET /api/games/platform-stats
// Admin dashboard — real player count per game
router.get('/platform-stats', getGameStats)

// GET /api/games/leaderboard/:game
// Per-game leaderboard e.g. /api/games/leaderboard/BGMI
router.get('/leaderboard/:game', getGameLeaderboard)

// GET /api/games/profiles/:userId
// View any player's game profiles (public)
router.get('/profiles/:userId', getUserGameProfiles)

// ── Protected routes (must be logged in) ─────────────────────────────────────

// GET /api/games/my-profiles
// Your own game profiles with full detail
router.get('/my-profiles', protect, getMyGameProfiles)

// GET /api/games/stats/summary
// Your per-game stats summary
router.get('/stats/summary', protect, getMyStatsSummary)

// POST /api/games/my-profiles
// Add a new game to your profile
router.post('/my-profiles', protect, addGameProfile)

// PUT /api/games/my-profiles/:game
// Update a game profile e.g. PUT /api/games/my-profiles/BGMI
router.put('/my-profiles/:game', protect, updateGameProfile)

// DELETE /api/games/my-profiles/:game
// Remove a game e.g. DELETE /api/games/my-profiles/CS2
router.delete('/my-profiles/:game', protect, removeGameProfile)

module.exports = router
