// routes/auth.routes.js
const express = require('express')
const { body } = require('express-validator')
const { register, login, googleAuth, googleComplete, checkUsername, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

const router = express.Router()

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register)

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login)

// POST /api/auth/google — Step 1: verify Google token, return needsUsername if new user
router.post('/google', googleAuth)

// POST /api/auth/google/complete — Step 2: new user submits chosen username, creates account
router.post('/google/complete', googleComplete)

// POST /api/auth/check-username — live username availability check
router.post('/check-username', checkUsername)

// GET /api/auth/me (protected)
router.get('/me', protect, getMe)

module.exports = router
