// routes/economy.routes.js
const express = require('express')
const { getBalance, getTransactions, claimDailyBonus, getAchievements, adminGrantCoins, convertCoins } = require('../controllers/economy.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

router.get('/balance',       protect, getBalance)
router.get('/transactions',  protect, getTransactions)
router.post('/daily-bonus',  protect, claimDailyBonus)
router.get('/achievements',  protect, getAchievements)
router.post('/convert',      protect, convertCoins)        // ✅ NEW: coins → gollars
router.post('/grant',        protect, adminOnly, adminGrantCoins)

module.exports = router
