// controllers/spin.controller.js
// Daily spin wheel + platform config + coin-to-Gollar conversion

const prisma = require('../config/db')

// ── Default platform config values ───────────────────────────────────────────
// These are seeded once. Admin can change from admin panel.
const DEFAULT_CONFIG = [
  // Spin wheel
  { key: 'spin_enabled',       value: 'true',  label: 'Daily Spin Enabled',           category: 'spin'    },
  { key: 'spin_min_coins',     value: '10',    label: 'Spin Min Coins Prize',          category: 'spin'    },
  { key: 'spin_max_coins',     value: '100',   label: 'Spin Max Coins Prize',          category: 'spin'    },
  // Wheel segments — JSON array of { label, coins, weight, color }
  // weight = relative probability (higher = more likely)
  { key: 'spin_segments', value: JSON.stringify([
    { label: 'Try Again',  coins: 0,   weight: 20, color: '#1a2545' },
    { label: '10 Coins',   coins: 10,  weight: 25, color: '#4a5568' },
    { label: '20 Coins',   coins: 20,  weight: 20, color: '#7c3aed' },
    { label: '30 Coins',   coins: 30,  weight: 15, color: '#00f5ff' },
    { label: '50 Coins',   coins: 50,  weight: 10, color: '#00ff88' },
    { label: '75 Coins',   coins: 75,  weight: 6,  color: '#f5a623' },
    { label: '100 Coins!', coins: 100, weight: 4,  color: '#ffd700' },
  ]), label: 'Spin Wheel Segments', category: 'spin' },

  // Coin → Gollar conversion
  { key: 'convert_enabled',       value: 'true',  label: 'Coin→Gollar Conversion Enabled', category: 'economy' },
  { key: 'convert_rate',          value: '200',   label: 'Coins needed per 1 Gollar',       category: 'economy' },
  { key: 'convert_min_coins',     value: '200',   label: 'Min Coins to Convert',             category: 'economy' },
  { key: 'convert_daily_limit',   value: '5',     label: 'Max Conversions per Day',          category: 'economy' },

  // Arcade games
  { key: 'arcade_enabled',        value: 'true',  label: 'Arcade Games Enabled',             category: 'arcade'  },
  { key: 'arcade_coins_per_play', value: '20',    label: 'Coins Earned per Game Play',        category: 'arcade'  },
  { key: 'arcade_plays_per_2h',   value: '5',     label: 'Max Plays per 2 Hours',            category: 'arcade'  },
]

// ── Helper: get all config as a key→value map ─────────────────────────────────
const getConfigMap = async () => {
  const rows = await prisma.platformConfig.findMany()
  const map  = {}
  for (const r of rows) map[r.key] = r.value
  return map
}

// ── POST /api/spin/daily ──────────────────────────────────────────────────────
// Player claims their daily spin
const dailySpin = async (req, res) => {
  try {
    const userId = req.user.id
    const config = await getConfigMap()

    if (config.spin_enabled !== 'true') {
      return res.status(400).json({ message: 'Daily spin is currently disabled' })
    }

    // Check if already spun today (midnight-to-midnight IST)
    const now   = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const alreadySpun = await prisma.dailySpin.findFirst({
      where: { userId, spinDate: { gte: todayStart } },
    })

    if (alreadySpun) {
      // Calculate time until next spin (midnight)
      const tomorrow = new Date(todayStart)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const msLeft = tomorrow - now
      const hLeft  = Math.floor(msLeft / 3600000)
      const mLeft  = Math.floor((msLeft % 3600000) / 60000)

      return res.status(400).json({
        message:        `Already spun today! Come back in ${hLeft}h ${mLeft}m`,
        alreadySpun:    true,
        nextSpinAt:     tomorrow.toISOString(),
        lastWon:        alreadySpun.coinsWon,
        lastSegment:    alreadySpun.segment,
      })
    }

    // Parse segments and pick a winner using weighted random
    let segments = []
    try { segments = JSON.parse(config.spin_segments || '[]') } catch {}
    if (!segments.length) {
      return res.status(500).json({ message: 'Spin wheel not configured' })
    }

    // Weighted random selection
    const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0)
    let rand = Math.random() * totalWeight
    let chosen = segments[segments.length - 1] // fallback
    for (const seg of segments) {
      rand -= seg.weight
      if (rand <= 0) { chosen = seg; break }
    }

    // Find segment index (for frontend animation)
    const segmentIndex = segments.findIndex(s => s.label === chosen.label)

    // Save spin record
    await prisma.dailySpin.create({
      data: { userId, coinsWon: chosen.coins, segment: chosen.label },
    })

    // Award coins if any
    if (chosen.coins > 0) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data:  { coins: { increment: chosen.coins }, totalEarned: { increment: chosen.coins } },
        }),
        prisma.coinTransaction.create({
          data: { userId, type: 'EARN', amount: chosen.coins, label: `🎰 Daily Spin — ${chosen.label}` },
        }),
      ])
    }

    res.json({
      message:       chosen.coins > 0 ? `🎉 You won ${chosen.coins} GHQ Coins!` : 'Better luck tomorrow!',
      segment:       chosen.label,
      segmentIndex,
      coinsWon:      chosen.coins,
      segments,      // full list for frontend wheel rendering
      nextSpinAt:    (() => { const t = new Date(); t.setDate(t.getDate()+1); t.setHours(0,0,0,0); return t.toISOString() })(),
    })
  } catch (err) {
    console.error('dailySpin error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/spin/status ──────────────────────────────────────────────────────
// Check if player can spin today + full segment list for wheel rendering
const getSpinStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const config = await getConfigMap()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const lastSpin = await prisma.dailySpin.findFirst({
      where:   { userId, spinDate: { gte: todayStart } },
      orderBy: { spinDate: 'desc' },
    })

    let segments = []
    try { segments = JSON.parse(config.spin_segments || '[]') } catch {}

    const tomorrow = new Date(todayStart)
    tomorrow.setDate(tomorrow.getDate() + 1)

    res.json({
      canSpin:     !lastSpin,
      spinEnabled: config.spin_enabled === 'true',
      segments,
      lastSpin:    lastSpin ? {
        coinsWon:  lastSpin.coinsWon,
        segment:   lastSpin.segment,
        spunAt:    lastSpin.spinDate,
      } : null,
      nextSpinAt: tomorrow.toISOString(),
    })
  } catch (err) {
    console.error('getSpinStatus error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/spin/convert ────────────────────────────────────────────────────
// Convert GHQ Coins → Gollars at admin-set rate
const convertCoinsToGollars = async (req, res) => {
  try {
    const userId = req.user.id
    const { times = 1 } = req.body   // how many conversions at once
    const config = await getConfigMap()

    if (config.convert_enabled !== 'true') {
      return res.status(400).json({ message: 'Coin conversion is currently disabled' })
    }

    const rate      = Number(config.convert_rate      || 200)  // coins per 1 Gollar
    const minCoins  = Number(config.convert_min_coins || 200)
    const dailyLimit= Number(config.convert_daily_limit || 5)
    const count     = Math.min(Number(times), dailyLimit)

    // Check daily conversions used today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayConversions = await prisma.coinTransaction.count({
      where: { userId, label: { contains: 'Converted to Gollar' }, createdAt: { gte: todayStart } },
    })

    const remaining = dailyLimit - todayConversions
    if (remaining <= 0) {
      return res.status(400).json({
        message: `Daily conversion limit reached (${dailyLimit}/day). Try again tomorrow.`,
        dailyLimit,
        used: todayConversions,
      })
    }

    const actualCount = Math.min(count, remaining)
    const coinsNeeded = rate * actualCount
    const gollarsGet  = actualCount   // 1 conversion = 1 Gollar

    // Check user balance
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } })
    if (user.coins < coinsNeeded) {
      return res.status(400).json({
        message:    `Not enough coins! Need ${coinsNeeded} ⬡ for ${actualCount} Gollar${actualCount>1?'s':''}, you have ${user.coins} ⬡`,
        need:       coinsNeeded,
        have:       user.coins,
        rate,
      })
    }

    // Deduct coins + add Gollars atomically
    const ops = []
    for (let i = 0; i < actualCount; i++) {
      ops.push(
        prisma.coinTransaction.create({
          data: { userId, type: 'SPEND', amount: rate, label: `Converted to Gollar (${rate} ⬡ = 1 🪙)` },
        })
      )
    }
    ops.push(
      prisma.user.update({
        where: { id: userId },
        data:  {
          coins:       { decrement: coinsNeeded },
          gollers:     { increment: gollarsGet  },
          totalBought: { increment: gollarsGet  },  // counts as "bought" for totalBought tracking
        },
      })
    )

    const results = await prisma.$transaction(ops)
    const updatedUser = results[results.length - 1]

    res.json({
      message:    `✓ Converted ${coinsNeeded} ⬡ → 🪙 ${gollarsGet} Gollar${gollarsGet>1?'s':''}!`,
      coinsSpent: coinsNeeded,
      gollarsGot: gollarsGet,
      newCoins:   updatedUser.coins,
      newGollers: updatedUser.gollers,
      rate,
      dailyRemaining: remaining - actualCount,
    })
  } catch (err) {
    console.error('convertCoinsToGollars error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/spin/config (public) ─────────────────────────────────────────────
// Returns platform config for frontend display
const getPublicConfig = async (req, res) => {
  try {
    const config = await getConfigMap()
    let segments = []
    try { segments = JSON.parse(config.spin_segments || '[]') } catch {}
    res.json({
      spin: {
        enabled: config.spin_enabled === 'true',
        minCoins: Number(config.spin_min_coins || 10),
        maxCoins: Number(config.spin_max_coins || 100),
        segments,
      },
      convert: {
        enabled:    config.convert_enabled === 'true',
        rate:       Number(config.convert_rate || 200),
        minCoins:   Number(config.convert_min_coins || 200),
        dailyLimit: Number(config.convert_daily_limit || 5),
      },
      arcade: {
        enabled:      config.arcade_enabled === 'true',
        coinsPerPlay: Number(config.arcade_coins_per_play || 20),
        playsPer2h:   Number(config.arcade_plays_per_2h || 5),
      },
    })
  } catch (err) {
    console.error('getPublicConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/spin/admin-config (admin only) ────────────────────────────────────
const getAdminConfig = async (req, res) => {
  try {
    const rows = await prisma.platformConfig.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] })
    res.json({ config: rows })
  } catch (err) {
    console.error('getAdminConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/spin/admin-config (admin only) ───────────────────────────────────
// Bulk update config keys
const updateAdminConfig = async (req, res) => {
  try {
    const { updates } = req.body  // [ { key, value }, ... ]
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Provide updates array' })
    }

    for (const { key, value } of updates) {
      await prisma.platformConfig.update({
        where: { key },
        data:  { value: String(value) },
      })
    }

    res.json({ message: `✓ Updated ${updates.length} config values` })
  } catch (err) {
    console.error('updateAdminConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── Seed default config (called from server startup) ─────────────────────────
const seedDefaultConfig = async () => {
  for (const item of DEFAULT_CONFIG) {
    await prisma.platformConfig.upsert({
      where:  { key: item.key },
      update: {},   // don't overwrite admin changes
      create: item,
    })
  }
  console.log('✅ Platform config seeded')
}

module.exports = {
  dailySpin,
  getSpinStatus,
  convertCoinsToGollars,
  getPublicConfig,
  getAdminConfig,
  updateAdminConfig,
  seedDefaultConfig,
}
