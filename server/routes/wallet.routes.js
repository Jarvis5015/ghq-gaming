// routes/wallet.routes.js
const express = require('express')
const {
  getBalance,
  getHistory,
  initiateTopUp,
  submitTopUpCode,
  getTopUpStatus,
  verifyTopUp,
  getPendingTopUps,
  joinTournamentWithGollars,
} = require('../controllers/wallet.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// All wallet routes require login
router.use(protect)

// ── Player routes ─────────────────────────────────────────────────────────────
router.get('/balance',          getBalance)
router.get('/history',          getHistory)
router.post('/initiate-topup',  initiateTopUp)
router.post('/submit-code',     submitTopUpCode)
router.get('/topup-status',     getTopUpStatus)
router.post('/join-tournament', joinTournamentWithGollars)

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/pending', adminOnly, getPendingTopUps)
router.post('/verify', adminOnly, verifyTopUp)

module.exports = router
