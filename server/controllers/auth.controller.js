// controllers/auth.controller.js
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../config/db')

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// Returns safe user object (no password hash)
// Includes both gollers (real currency) and coins (earned currency)
const safeUser = (user) => ({
  id:          user.id,
  username:    user.username,
  email:       user.email,
  avatar:      user.avatar,
  role:        user.role,
  // 🪙 Gollers wallet
  gollers:     user.gollers,
  totalBought: user.totalBought,
  totalSpent:  user.totalSpent,
  // GHQ Coins (earned)
  coins:       user.coins,
  totalEarned: user.totalEarned,
  // Stats
  wins:        user.wins,
  losses:      user.losses,
  rank:        user.rank,
  createdAt:   user.createdAt,
})

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password, platform = 'PC' } = req.body

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' })

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const avatar       = username.slice(0, 2).toUpperCase()

    const user = await prisma.user.create({
      data: {
        username,
        email:        email.toLowerCase(),
        passwordHash,
        avatar,
        gollers:      100,   // welcome Gollers bonus
        totalBought:  100,
        coins:        500,   // welcome GHQ Coins
        totalEarned:  500,
      },
    })

    // Log the welcome Goller bonus
    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        type:   'EARN',
        amount: 500,
        label:  '🎉 Welcome bonus — 500 GHQ Coins',
      },
    })

    const token = generateToken(user.id)

    res.status(201).json({
      message: 'Account created! You received 100 🪙 Gollers + 500 GHQ Coins as a welcome bonus.',
      token,
      user: safeUser(user),
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' })

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user.id)

    res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: safeUser(user) })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, getMe }
