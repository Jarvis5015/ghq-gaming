// routes/economy.routes.js
const express = require('express')
const {
  getBalance, getTransactions,
  claimDailyBonus, getAchievements, adminGrantCoins,
} = require('../controllers/economy.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// All economy routes require login
router.use(protect)

// GET /api/economy/balance
router.get('/balance', getBalance)

// GET /api/economy/transactions
router.get('/transactions', getTransactions)

// POST /api/economy/daily-bonus
router.post('/daily-bonus', claimDailyBonus)

// GET /api/economy/achievements
router.get('/achievements', getAchievements)

// POST /api/economy/grant  (admin only)
router.post('/grant', adminOnly, adminGrantCoins)

module.exports = router
