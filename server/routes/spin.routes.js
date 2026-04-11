// routes/spin.routes.js
const express = require('express')
const {
  dailySpin,
  getSpinStatus,
  convertCoinsToGollars,
  getPublicConfig,
  getAdminConfig,
  updateAdminConfig,
} = require('../controllers/spin.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// ── Public (no auth needed) ───────────────────────────────────────────────────
router.get('/config', getPublicConfig)   // frontend needs segment list to draw wheel

// ── Player (logged in) ────────────────────────────────────────────────────────
router.get('/status',   protect, getSpinStatus)          // can I spin today?
router.post('/daily',   protect, dailySpin)              // spin the wheel
router.post('/convert', protect, convertCoinsToGollars)  // coins → Gollars

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin-config',  protect, adminOnly, getAdminConfig)
router.put('/admin-config',  protect, adminOnly, updateAdminConfig)

module.exports = router
