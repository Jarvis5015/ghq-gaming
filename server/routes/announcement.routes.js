// routes/announcement.routes.js
const express = require('express')
const {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcement.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()

// Public — anyone can see active announcements
router.get('/',       getAnnouncements)

// Admin only
router.get('/admin',  protect, adminOnly, getAllAnnouncements)
router.post('/',      protect, adminOnly, createAnnouncement)
router.put('/:id',    protect, adminOnly, updateAnnouncement)
router.delete('/:id', protect, adminOnly, deleteAnnouncement)

module.exports = router
