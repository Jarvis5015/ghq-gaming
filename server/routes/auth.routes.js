// routes/auth.routes.js
const express = require('express')
const { body } = require('express-validator')
const { register, login, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

const router = express.Router()

// POST /api/auth/register
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3–20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('platform')
    .optional()
    .isIn(['PC', 'Mobile', 'Both'])
    .withMessage('Platform must be PC, Mobile or Both'),
], validate, register)

// POST /api/auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], validate, login)

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe)

module.exports = router
