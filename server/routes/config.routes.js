// routes/config.routes.js
const express = require('express')
const { getPublicConfig, getAdminConfig, saveAdminConfig } = require('../controllers/config.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// Public — frontend reads these to know coin values
router.get('/public', getPublicConfig)

// Admin only
router.get('/admin',  protect, adminOnly, getAdminConfig)
router.put('/admin',  protect, adminOnly, saveAdminConfig)

module.exports = router
