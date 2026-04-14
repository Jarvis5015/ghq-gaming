// controllers/auth.controller.js
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../config/db')

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const safeUser = (user) => ({
  id:          user.id,
  username:    user.username,
  email:       user.email,
  avatar:      user.avatar,
  role:        user.role,
  gollers:     user.gollers,
  totalBought: user.totalBought,
  totalSpent:  user.totalSpent,
  coins:       user.coins,
  totalEarned: user.totalEarned,
  wins:        user.wins,
  losses:      user.losses,
  rank:        user.rank,
  createdAt:   user.createdAt,
})

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Google Sign In — match by email, create account if new
// No googleId column needed — email is the unique identifier
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ message: 'Google token is required' })

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign In not configured on server' })
    }

    // Verify the token with Google
    let payload
    try {
      const { OAuth2Client } = require('google-auth-library')
      const client  = new OAuth2Client(GOOGLE_CLIENT_ID)
      const ticket  = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch (verifyErr) {
      console.error('Google token verify failed:', verifyErr.message)
      return res.status(401).json({ message: 'Invalid Google token — please try again' })
    }

    const { email, name, picture } = payload
    if (!email) return res.status(400).json({ message: 'Could not get email from Google account' })

    // Check if user already exists by email
    let user      = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    let isNewUser = false

    if (user) {
      // ── Existing user — just log them in ─────────────────────────────────
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account has been deactivated' })
      }
      // Update avatar with Google profile picture if they don't have one yet
      if ((!user.avatar || user.avatar.length <= 2) && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { avatar: picture },
        })
      }
    } else {
      // ── New user — create account automatically ───────────────────────────
      isNewUser = true

      // Generate username from Google name
      let baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')  // remove special chars
        .slice(0, 18)
        || 'Player'

      if (baseUsername.length < 3) baseUsername = 'Player' + baseUsername

      // Make sure username is unique
      let username = baseUsername
      let suffix   = 1
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix++}`
      }

      user = await prisma.user.create({
        data: {
          username,
          email:        email.toLowerCase(),
          passwordHash: '',   // Google users have no password
          avatar:       picture || username.slice(0, 2).toUpperCase(),
          gollers:      0,
          totalBought:  0,
          totalSpent:   0,
          coins:        100,
          totalEarned:  100,
        },
      })

      // Welcome coins transaction
      await prisma.coinTransaction.create({
        data: {
          userId: user.id,
          type:   'EARN',
          amount: 100,
          label:  '🎉 Welcome bonus — 100 GHQ Coins',
        },
      })
    }

    const token = generateToken(user.id)
    res.json({
      message:   isNewUser
        ? `Welcome to GHQ, ${user.username}! 🎮 You got 100 GHQ Coins.`
        : `Welcome back, ${user.username}!`,
      token,
      user:      safeUser(user),
      isNewUser,
    })

  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ message: 'Server error during Google sign in' })
  }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' })

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const avatar       = username.slice(0, 2).toUpperCase()

    const user = await prisma.user.create({
      data: {
        username,
        email:        email.toLowerCase(),
        passwordHash,
        avatar,
        gollers:      0,
        totalBought:  0,
        totalSpent:   0,
        coins:        100,
        totalEarned:  100,
      },
    })

    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        type:   'EARN',
        amount: 100,
        label:  '🎉 Welcome bonus — 100 GHQ Coins',
      },
    })

    const token = generateToken(user.id)
    res.status(201).json({
      message: 'Account created! You received 100 GHQ Coins.',
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
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' })

    // Google-only accounts have empty passwordHash
    if (!user.passwordHash) {
      return res.status(401).json({
        message: 'This account was created with Google Sign In — please use the Google button below',
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user.id)
    res.json({ message: 'Logged in successfully', token, user: safeUser(user) })
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

module.exports = { register, login, googleAuth, getMe }
