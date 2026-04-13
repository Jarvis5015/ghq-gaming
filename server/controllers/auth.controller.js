// controllers/auth.controller.js
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const https  = require('https')
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

// ── Helper: verify Google ID token with Google's API ─────────────────────────
// We call Google's tokeninfo endpoint — no extra library needed
const verifyGoogleToken = (idToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const payload = JSON.parse(data)
          if (payload.error) return reject(new Error(payload.error_description || 'Invalid Google token'))
          // Verify this token was issued for our app
          const clientId = process.env.GOOGLE_CLIENT_ID
          if (payload.aud !== clientId) return reject(new Error('Token audience mismatch'))
          resolve(payload)
        } catch (e) {
          reject(new Error('Failed to parse Google response'))
        }
      })
    }).on('error', reject)
  })
}

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Google Sign In — works for both login and registration
// Frontend sends the Google ID token, we verify it with Google and log them in
const googleAuth = async (req, res) => {
  try {
    const { idToken, username: requestedUsername } = req.body

    if (!idToken) return res.status(400).json({ message: 'Google token is required' })

    // Verify token with Google
    let googleUser
    try {
      googleUser = await verifyGoogleToken(idToken)
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google token — please try again' })
    }

    const { email, name, picture, sub: googleId } = googleUser

    if (!email) return res.status(400).json({ message: 'Google account must have an email' })

    // Check if user already exists with this email
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (user) {
      // ── EXISTING USER — just log them in ─────────────────────────────────
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account has been deactivated' })
      }

      // Update avatar from Google if they don't have one
      if (!user.avatar && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { avatar: picture },
        })
      }

      const token = generateToken(user.id)
      return res.json({
        message:  'Logged in with Google!',
        token,
        user:     safeUser(user),
        isNewUser: false,
      })
    }

    // ── NEW USER — create account ─────────────────────────────────────────
    // Generate a username from their Google name
    let baseUsername = (name || email.split('@')[0])
      .replace(/[^a-zA-Z0-9_]/g, '')   // remove special chars
      .slice(0, 16)                      // max 16 chars
      || 'Player'

    // If a username was provided from the frontend (user picked their own), use that
    let finalUsername = requestedUsername || baseUsername

    // Make sure username is unique — add random digits if taken
    const existing = await prisma.user.findUnique({ where: { username: finalUsername } })
    if (existing) {
      finalUsername = finalUsername + Math.floor(Math.random() * 9000 + 1000)
    }
    // Final length check
    if (finalUsername.length < 3) finalUsername = finalUsername + '123'
    finalUsername = finalUsername.slice(0, 20)

    // Create the new user — no password (googleId stored instead)
    user = await prisma.user.create({
      data: {
        username:     finalUsername,
        email:        email.toLowerCase(),
        passwordHash: '',              // empty — Google users don't have passwords
        avatar:       picture || finalUsername.slice(0, 2).toUpperCase(),
        googleId:     googleId,        // store Google's user ID
        gollers:      0,
        totalBought:  0,
        totalSpent:   0,
        coins:        100,             // welcome bonus
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

    const token = generateToken(user.id)
    res.status(201).json({
      message:   `Welcome to GHQ, ${finalUsername}! 🎮 You got 100 GHQ Coins.`,
      token,
      user:      safeUser(user),
      isNewUser: true,
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' })

    // Google-only accounts have no password
    if (!user.passwordHash) {
      return res.status(401).json({ message: 'This account uses Google Sign In — please use the Google button' })
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

module.exports = { register, login, getMe, googleAuth }
