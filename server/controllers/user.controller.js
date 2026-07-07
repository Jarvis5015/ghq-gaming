// controllers/user.controller.js
const prisma = require('../config/db')

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
        achievements: { include: { achievement: true }, orderBy: { earnedAt: 'desc' } },
        registrations: {
          include: { tournament: { select: { id: true, name: true, game: true, status: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const { passwordHash, ...safeUser } = user
    res.json({ user: safeUser })
  } catch (error) {
    console.error('GetProfile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { username, platform, favoriteGame, avatar } = req.body
    if (username && username !== req.user.username) {
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing) return res.status(400).json({ message: 'Username already taken' })
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(username     && { username }),
        ...(platform     && { platform }),
        ...(favoriteGame && { favoriteGame }),
        ...(avatar       && { avatar }),
      },
    })
    const { passwordHash, ...safeUser } = updated
    res.json({ message: 'Profile updated', user: safeUser })
  } catch (error) {
    console.error('UpdateProfile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/users/leaderboard ────────────────────────────────────────────────
// ✅ FIXED: Exclude admins from leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { game, limit = 50 } = req.query

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role:     'PLAYER',  // ✅ exclude ADMIN accounts
        ...(game && game !== 'all' ? { favoriteGame: game } : {}),
      },
      orderBy: { coins: 'desc' },
      take:    Number(limit),
      select: {
        id: true, username: true, avatar: true,
        coins: true, wins: true, losses: true,
      },
    })

    const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }))
    res.json({ leaderboard: ranked })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: Number(req.params.id) },
      select: {
        id: true, username: true, avatar: true,
        coins: true, wins: true, losses: true,
        rank: true, createdAt: true,
        achievements: { include: { achievement: true } },
      },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (error) {
    console.error('GetUserById error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getProfile, updateProfile, getLeaderboard, getUserById }
