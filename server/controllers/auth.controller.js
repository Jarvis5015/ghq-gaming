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
// Step 1 — Verify Google token
// If existing user  → log them in immediately
// If new user       → return { needsUsername: true, googleToken } — do NOT create account yet
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ message: 'Google token is required' })

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign In not configured on server' })
    }

    // Verify token with Google
    let payload
    try {
      const { OAuth2Client } = require('google-auth-library')
      const client = new OAuth2Client(GOOGLE_CLIENT_ID)
      const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })
      payload = ticket.getPayload()
    } catch (verifyErr) {
      console.error('Google token verify failed:', verifyErr.message)
      return res.status(401).json({ message: 'Invalid Google token — please try again' })
    }

    const { email, picture } = payload
    if (!email) return res.status(400).json({ message: 'Could not get email from Google account' })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (existingUser) {
      // ── Existing user — log in directly ──────────────────────────────────
      if (!existingUser.isActive) {
        return res.status(401).json({ message: 'Account has been deactivated' })
      }
      const token = generateToken(existingUser.id)
      return res.json({
        message:      `Welcome back, ${existingUser.username}!`,
        token,
        user:         safeUser(existingUser),
        isNewUser:    false,
        needsUsername: false,
      })
    }

    // ── New user — ask frontend to collect username first ─────────────────
    // Return the verified Google token so frontend can send it back with username
    // Account is NOT created yet
    return res.json({
      needsUsername: true,
      googleToken:   idToken,   // pass back so frontend can complete registration
      email:         email.toLowerCase(),
      picture:       picture || null,
      message:       'Please choose a username to complete your registration',
    })

  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ message: 'Server error during Google sign in' })
  }
}

// ── POST /api/auth/google/complete ────────────────────────────────────────────
// Step 2 — New Google user submits their chosen username
// Verifies token again + checks username is unique + creates account
const googleComplete = async (req, res) => {
  try {
    const { googleToken, username } = req.body

    if (!googleToken) return res.status(400).json({ message: 'Google token is required' })
    if (!username)    return res.status(400).json({ message: 'Username is required' })

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be 3–20 characters' })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers and underscores' })
    }

    // Check username is not taken
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken — please choose another' })
    }

    // Re-verify the Google token (security — can't trust frontend)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    let payload
    try {
      const { OAuth2Client } = require('google-auth-library')
      const client = new OAuth2Client(GOOGLE_CLIENT_ID)
      const ticket = await client.verifyIdToken({ idToken: googleToken, audience: GOOGLE_CLIENT_ID })
      payload = ticket.getPayload()
    } catch (verifyErr) {
      return res.status(401).json({ message: 'Google session expired — please sign in again' })
    }

    const { email, picture, sub: googleId } = payload
    if (!email) return res.status(400).json({ message: 'Could not get email from Google account' })

    // Final check — make sure email isn't already registered (race condition)
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingEmail) {
      return res.status(400).json({ message: 'This Google account is already registered — please sign in normally' })
    }

    // Create the account now
    const user = await prisma.user.create({
      data: {
        username,
        email:        email.toLowerCase(),
        passwordHash: await bcrypt.hash(googleId, 12), // not used for login but required
        avatar:       picture || username.slice(0, 2).toUpperCase(),
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
      message:   `Welcome to GHQ, ${user.username}! 🎮 You got 100 GHQ Coins.`,
      token,
      user:      safeUser(user),
      isNewUser: true,
    })

  } catch (error) {
    console.error('Google complete error:', error)
    res.status(500).json({ message: 'Server error completing registration' })
  }
}

// ── POST /api/auth/check-username ─────────────────────────────────────────────
// Quick check if a username is available (used for live validation)
const checkUsername = async (req, res) => {
  try {
    const { username } = req.body
    if (!username || username.length < 3) {
      return res.json({ available: false, message: 'Too short' })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({ available: false, message: 'Only letters, numbers and underscores allowed' })
    }
    const existing = await prisma.user.findUnique({ where: { username } })
    res.json({ available: !existing, message: existing ? 'Username already taken' : 'Username available!' })
  } catch (error) {
    res.status(500).json({ available: false, message: 'Server error' })
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

    if (!user.passwordHash) {
      return res.status(401).json({
        message: 'This account uses Google Sign In — please use the Google button to log in',
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

module.exports = { register, login, googleAuth, googleComplete, checkUsername, getMe }
