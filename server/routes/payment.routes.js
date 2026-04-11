// routes/payment.routes.js
const express = require('express')
const {
  initiatePayment,
  submitCode,
  verifyPayment,
  getMyCode,
  getPendingPayments,
  cancelPayment,
} = require('../controllers/payment.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// All payment routes require login
router.use(protect)

// ── Player routes ─────────────────────────────────────────────────────────────

// POST /api/payments/initiate
// Player starts the payment process — gets their unique code + UPI QR data
router.post('/initiate', initiatePayment)

// POST /api/payments/submit-code
// Player says "I paid" and submits their code
router.post('/submit-code', submitCode)

// GET /api/payments/my-code/:tournamentId
// Player checks current status of their code for a tournament
router.get('/my-code/:tournamentId', getMyCode)

// DELETE /api/payments/cancel
// Player cancels their pending payment
router.delete('/cancel', cancelPayment)

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/payments/pending
// Admin sees all codes waiting for verification
// ?status=SUBMITTED (default) | PENDING | VERIFIED | EXPIRED
router.get('/pending', adminOnly, getPendingPayments)

// POST /api/payments/verify
// Admin confirms they received the payment → auto-registers player
router.post('/verify', adminOnly, verifyPayment)

module.exports = router
