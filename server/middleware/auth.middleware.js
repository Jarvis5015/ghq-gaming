// middleware/auth.middleware.js
const jwt    = require('jsonwebtoken')
const prisma = require('../config/db')

// ── protect — requires valid token ───────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized — no token provided' })
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired — please log in again' })
      }
      return res.status(401).json({ message: 'Invalid token' })
    }

    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: { id: true, username: true, email: true, avatar: true, role: true, coins: true, gollers: true, isActive: true },
    })

    if (!user)          return res.status(401).json({ message: 'User no longer exists' })
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' })

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Server error during authentication' })
  }
}

// ── optionalAuth — reads token if present, continues if not ──────────────────
// Used on public routes that need to know WHO is asking (e.g. to show room details)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token — just continue without user
      req.user = null
      return next()
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // Invalid/expired token — continue without user, don't error
      req.user = null
      return next()
    }

    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: { id: true, username: true, email: true, avatar: true, role: true, coins: true, gollers: true, isActive: true },
    })

    req.user = (user && user.isActive) ? user : null
    next()
  } catch (error) {
    req.user = null
    next()
  }
}

// ── adminOnly — requires ADMIN role ──────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied — admin only' })
  }
  next()
}

module.exports = { protect, optionalAuth, adminOnly }
