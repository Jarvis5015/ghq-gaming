// routes/ad.routes.js
const express = require('express')
const { protect, adminOnly } = require('../middleware/auth.middleware')
const { getActiveAds, getGateAds, getAllAds, createAd, updateAd, deleteAd } = require('../controllers/ad.controller')

const router = express.Router()

// Public
router.get('/',                   getActiveAds)
router.get('/gate/:tournamentId', getGateAds)

// Admin
router.get('/admin/all',    protect, adminOnly, getAllAds)
router.post('/admin',       protect, adminOnly, createAd)
router.put('/admin/:id',    protect, adminOnly, updateAd)
router.delete('/admin/:id', protect, adminOnly, deleteAd)

module.exports = router
