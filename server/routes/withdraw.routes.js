// routes/withdraw.routes.js
const express = require('express')
const { protect, adminOnly } = require('../middleware/auth.middleware')
const {
  requestWithdraw,
  getMyRequests,
  getAllRequests,
  markPaid,
  rejectRequest,
} = require('../controllers/withdraw.controller')

const router = express.Router()

router.use(protect)

// Player
router.post('/request',      requestWithdraw)
router.get('/my-requests',   getMyRequests)

// Admin
router.get('/admin/all',           adminOnly, getAllRequests)
router.post('/admin/:id/pay',      adminOnly, markPaid)
router.post('/admin/:id/reject',   adminOnly, rejectRequest)

module.exports = router
