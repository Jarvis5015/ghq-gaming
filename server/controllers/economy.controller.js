// controllers/economy.controller.js
const prisma             = require('../config/db')
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
const claimDailyBonus = async (req, res) => {
  try {
    const userId = req.user.id
    const BONUS  = await getConfigValue('daily_bonus_coins') || 25

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alreadyClaimed = await prisma.coinTransaction.findFirst({
      where: { userId, label: { contains: 'Daily bonus' }, createdAt: { gte: today } },
    })

    if (alreadyClaimed) {
      return res.status(400).json({ message: 'Daily bonus already claimed today. Come back tomorrow!' })
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  { coins: { increment: BONUS }, totalEarned: { increment: BONUS } },
      }),
      prisma.coinTransaction.create({
        data: { userId, type: 'EARN', amount: BONUS, label: '📅 Daily bonus' },
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
    const userId         = req.user.id
    const allAchievements = await prisma.achievement.findMany()
    const earned         = await prisma.userAchievement.findMany({
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

// ── POST /api/economy/convert ─────────────────────────────────────────────────
// Convert GHQ Coins → Gollars using admin-set rate
const convertCoins = async (req, res) => {
  try {
    const userId = req.user.id

    // Get settings from admin config
    const [enabled, rate, dailyMax, minCoins] = await Promise.all([
      getConfigValue('convert_enabled'),
      getConfigValue('convert_rate'),
      getConfigValue('convert_daily_limit'),
      getConfigValue('convert_min_coins'),
    ])

    if (String(enabled) !== 'true') {
      return res.status(400).json({ message: 'Coin conversion is currently disabled by admin' })
    }

    const convRate   = Number(rate)     || 200   // coins per 1 Gollar
    const maxPerDay  = Number(dailyMax) || 10    // max Gollars per day
    const minNeeded  = Number(minCoins) || 200   // min coins to start conversion

    const { gollarsWanted = 1 } = req.body
    const amount = Math.max(1, Math.min(Number(gollarsWanted), maxPerDay))
    const coinsNeeded = amount * convRate

    // Check minimum
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { coins: true, gollers: true },
    })

    if (user.coins < minNeeded) {
      return res.status(400).json({
        message:  `You need at least ⬡ ${minNeeded} coins to convert. You have ⬡ ${user.coins}.`,
        have:     user.coins,
        minCoins: minNeeded,
      })
    }

    if (user.coins < coinsNeeded) {
      return res.status(400).json({
        message: `Not enough coins! Need ⬡ ${coinsNeeded} for 🪙 ${amount} Gollar${amount > 1 ? 's' : ''}. You have ⬡ ${user.coins}.`,
        have:    user.coins,
        need:    coinsNeeded,
        rate:    convRate,
      })
    }

    // Check daily limit
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayTx = await prisma.coinTransaction.findMany({
      where: {
        userId,
        label:     { contains: '→ Gollar' },
        createdAt: { gte: todayStart },
      },
    })
    const gollarsConvertedToday = todayTx.reduce((s, t) => s + Math.floor(t.amount / convRate), 0)

    if (gollarsConvertedToday >= maxPerDay) {
      return res.status(400).json({
        message:   `Daily limit reached — max 🪙 ${maxPerDay} Gollars per day. Resets at midnight.`,
        dailyMax:  maxPerDay,
        usedToday: gollarsConvertedToday,
      })
    }

    const canConvert  = Math.min(amount, maxPerDay - gollarsConvertedToday)
    const finalCoins  = canConvert * convRate

    // Atomic transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  {
          coins:       { decrement: finalCoins },
          gollers:     { increment: canConvert },
          totalBought: { increment: canConvert },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type:   'SPEND',
          amount: finalCoins,
          label:  `⬡ ${finalCoins} → Gollar 🪙 ×${canConvert} (rate: ${convRate} coins = 1 Gollar)`,
        },
      }),
    ])

    res.json({
      message:       `✓ Converted ⬡ ${finalCoins.toLocaleString()} → 🪙 ${canConvert} Gollar${canConvert > 1 ? 's' : ''}!`,
      coinsSpent:    finalCoins,
      gollarsGot:    canConvert,
      newCoins:      updatedUser.coins,
      newGollers:    updatedUser.gollers,
      rate:          convRate,
      dailyRemaining: maxPerDay - gollarsConvertedToday - canConvert,
    })
  } catch (error) {
    console.error('ConvertCoins error:', error)
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
        data:  { coins: { increment: Number(amount) }, totalEarned: { increment: Number(amount) } },
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

    res.json({ message: `✓ Granted ${amount} coins to ${username}`, newBalance: updated.coins })
  } catch (error) {
    console.error('AdminGrantCoins error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getBalance, getTransactions, claimDailyBonus, getAchievements, convertCoins, adminGrantCoins }
