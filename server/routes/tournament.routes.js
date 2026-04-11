// routes/tournament.routes.js
const express = require('express')
const { body } = require('express-validator')
const {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  announceResults,
  getBracket,
} = require('../controllers/tournament.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

const router = express.Router()

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',             getTournaments)
router.get('/:id',          getTournamentById)
router.get('/:id/bracket',  getBracket)

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('game').trim().notEmpty().withMessage('Game is required'),
  body('platform').isIn(['PC', 'Mobile', 'Both']).withMessage('Platform must be PC, Mobile or Both'),
  body('type').isIn(['TOURNAMENT', 'CHAMPIONS']).withMessage('Type must be TOURNAMENT or CHAMPIONS'),
  body('mode').isIn(['FREE', 'PAID']).withMessage('Mode must be FREE or PAID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('coinReward').optional().isInt({ min: 0 }),
], validate, createTournament)

router.put('/:id',                    protect, adminOnly, updateTournament)
router.post('/:id/announce-results',  protect, adminOnly, announceResults)

module.exports = router
