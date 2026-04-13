// routes/auth.routes.js
const express = require('express')
const { body } = require('express-validator')
const { register, login, getMe, googleAuth } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

const router = express.Router()

// POST /api/auth/google — Google Sign In (login or register)
router.post('/google', [
  body('idToken').notEmpty().withMessage('Google token is required'),
], validate, googleAuth)

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Letters, numbers and underscores only'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register)

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login)

// GET /api/auth/me (protected)
router.get('/me', protect, getMe)

module.exports = router
