// routes/fake.routes.js
const express = require('express')
const { fillTournamentWithFakePlayers, cleanFakePlayers } = require('../controllers/fake.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// POST /api/fake/fill-tournament  — add fake players to a tournament
router.post('/fill-tournament',  protect, adminOnly, fillTournamentWithFakePlayers)

// DELETE /api/fake/clean-tournament — remove all fake players from a tournament
router.delete('/clean-tournament', protect, adminOnly, cleanFakePlayers)

module.exports = router
