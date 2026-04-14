// controllers/economy.controller.js
const prisma           = require('../config/db')
const { getConfigValue } = require('./config.controller')

// ── GET /api/economy/balance ──────────────────────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { coins: true, totalEarned: true, totalSpent: true },
    })
    res.json(user)
  } catch (error) {
    console.error('GetBalance error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/economy/transactions ────────────────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where:   { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take:    Number(limit),
        skip,
      }),
      prisma.coinTransaction.count({ where: { userId: req.user.id } }),
    ])

    res.json({ transactions, total, page: Number(page) })
  } catch (error) {
    console.error('GetTransactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/economy/daily-bonus ─────────────────────────────────────────────
// Amount is pulled from PlatformConfig — admin can change it anytime
const claimDailyBonus = async (req, res) => {
  try {
    const userId = req.user.id

    // Get the current daily bonus amount from admin config
    const BONUS = await getConfigValue('daily_bonus_coins') || 25

    // Check if already claimed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alreadyClaimed = await prisma.coinTransaction.findFirst({
      where: {
        userId,
        label:     { contains: 'Daily bonus' },
        createdAt: { gte: today },
      },
    })

    if (alreadyClaimed) {
      return res.status(400).json({ message: 'Daily bonus already claimed today. Come back tomorrow!' })
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  {
          coins:       { increment: BONUS },
          totalEarned: { increment: BONUS },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type:   'EARN',
          amount: BONUS,
          label:  '📅 Daily bonus',
        },
      }),
    ])

    res.json({
      message:     `Daily bonus claimed! +${BONUS} ⬡ GHQ Coins`,
      coinsEarned: BONUS,
      newBalance:  user.coins,
    })
  } catch (error) {
    console.error('DailyBonus error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/economy/achievements ────────────────────────────────────────────
const getAchievements = async (req, res) => {
  try {
    const userId = req.user.id

    const allAchievements = await prisma.achievement.findMany()
    const earned = await prisma.userAchievement.findMany({
      where:  { userId },
      select: { achievementId: true, earnedAt: true },
    })

    const earnedMap = {}
    for (const e of earned) earnedMap[e.achievementId] = e.earnedAt

    const achievements = allAchievements.map(a => ({
      ...a,
      earned:   !!earnedMap[a.id],
      earnedAt: earnedMap[a.id] || null,
    }))

    res.json({ achievements })
  } catch (error) {
    console.error('GetAchievements error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/economy/grant (Admin only) ─────────────────────────────────────
const adminGrantCoins = async (req, res) => {
  try {
    const { username, amount, reason } = req.body

    const targetUser = await prisma.user.findUnique({ where: { username } })
    if (!targetUser) return res.status(404).json({ message: 'User not found' })

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data:  {
          coins:       { increment: Number(amount) },
          totalEarned: { increment: Number(amount) },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: targetUser.id,
          type:   'EARN',
          amount: Number(amount),
          label:  `⚙️ Admin grant: ${reason || 'Manual adjustment'}`,
        },
      }),
    ])

    res.json({
      message:    `✓ Granted ${amount} coins to ${username}`,
      newBalance: updated.coins,
    })
  } catch (error) {
    console.error('AdminGrantCoins error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getBalance,
  getTransactions,
  claimDailyBonus,
  getAchievements,
  adminGrantCoins,
}
