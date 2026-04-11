// middleware/auth.middleware.js
const jwt   = require('jsonwebtoken')
const prisma = require('../config/db')

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

    // ✅ FIXED: removed 'platform' — it no longer exists on User model
    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: {
        id:       true,
        username: true,
        email:    true,
        avatar:   true,
        role:     true,
        coins:    true,
        gollers:  true,
        isActive: true,
      },
    })

    if (!user)           return res.status(401).json({ message: 'User no longer exists' })
    if (!user.isActive)  return res.status(401).json({ message: 'Account has been deactivated' })

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Server error during authentication' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied — admin only' })
  }
  next()
}

module.exports = { protect, adminOnly }
