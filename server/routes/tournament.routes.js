// routes/tournament.routes.js
const express = require('express')
const { body } = require('express-validator')
const {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  setRoomCredentials,
  clearRoomCredentials,
  announceResults,
  getBracket,
} = require('../controllers/tournament.controller')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

const router = express.Router()

// ── Public (with optional auth — needed to check if user is registered) ───────
router.get('/',            optionalAuth, getTournaments)
router.get('/:id',         optionalAuth, getTournamentById)
router.get('/:id/bracket', getBracket)

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('game').trim().notEmpty().withMessage('Game is required'),
  body('platform').isIn(['PC', 'Mobile', 'Both']).withMessage('Invalid platform'),
  body('type').isIn(['TOURNAMENT', 'CHAMPIONS']).withMessage('Invalid type'),
  body('mode').isIn(['FREE', 'PAID']).withMessage('Invalid mode'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('coinReward').optional().isInt({ min: 0 }),
], validate, createTournament)

router.put('/:id',                    protect, adminOnly, updateTournament)
router.put('/:id/room',               protect, adminOnly, setRoomCredentials)
router.delete('/:id/room',            protect, adminOnly, clearRoomCredentials)
router.post('/:id/announce-results',  protect, adminOnly, announceResults)

module.exports = router
