// controllers/config.controller.js
const prisma = require('../config/db')

const DEFAULTS = {
  // ── GHQ Coins — earning ───────────────────────────────────────────────────
  daily_bonus_coins:     { value: '25',   label: 'Daily Login Bonus Coins',      category: 'coins',   desc: 'Coins given when player claims daily bonus' },
  welcome_bonus_coins:   { value: '100',  label: 'Welcome Bonus (new users)',     category: 'coins',   desc: 'Coins given to new players on registration' },
  tournament_join_coins: { value: '50',   label: 'Tournament Join Reward',        category: 'coins',   desc: 'Coins given just for joining any tournament' },
  ad_watch_coins:        { value: '10',   label: 'Coins per Ad Watched',          category: 'coins',   desc: 'Coins earned for each ad watched in ad gate' },

  // ── Gollars ───────────────────────────────────────────────────────────────
  min_withdrawal_gollars: { value: '50',    label: 'Minimum Withdrawal (Gollars)', category: 'gollars', desc: 'Minimum Gollars a player can withdraw at once' },
  max_topup_gollars:      { value: '10000', label: 'Maximum Top-up (Gollars)',     category: 'gollars', desc: 'Maximum Gollars a player can buy in one transaction' },

  // ── Coins → Gollars Conversion ────────────────────────────────────────────
  convert_enabled:        { value: 'true', label: 'Coin→Gollar Conversion ON/OFF', category: 'convert', desc: 'Toggle to enable or disable coin conversion for all players' },
  convert_rate:           { value: '200',  label: 'Coins Required per 1 Gollar',   category: 'convert', desc: 'How many GHQ Coins = 1 Gollar (e.g. 200 means 200 coins → 1 Gollar)' },
  convert_daily_limit:    { value: '10',   label: 'Max Gollars Convertible Per Day', category: 'convert', desc: 'Maximum Gollars a player can earn through conversion per day' },
  convert_min_coins:      { value: '200',  label: 'Minimum Coins to Convert',      category: 'convert', desc: 'Player must have at least this many coins to convert' },
}

// ── GET /api/config/public ────────────────────────────────────────────────────
const getPublicConfig = async (req, res) => {
  try {
    const rows = await prisma.platformConfig.findMany()
    const config = {}

    for (const [key, def] of Object.entries(DEFAULTS)) {
      config[key] = isNaN(Number(def.value)) ? def.value : Number(def.value)
    }
    for (const row of rows) {
      config[row.key] = isNaN(Number(row.value)) ? row.value : Number(row.value)
    }

    res.json({ config })
  } catch (err) {
    console.error('getPublicConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/config/admin ─────────────────────────────────────────────────────
const getAdminConfig = async (req, res) => {
  try {
    const rows  = await prisma.platformConfig.findMany()
    const dbMap = {}
    for (const row of rows) dbMap[row.key] = row.value

    const config = Object.entries(DEFAULTS).map(([key, def]) => ({
      key,
      value:    dbMap[key] ?? def.value,
      label:    def.label,
      desc:     def.desc,
      category: def.category,
    }))

    res.json({ config })
  } catch (err) {
    console.error('getAdminConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/config/admin ─────────────────────────────────────────────────────
const saveAdminConfig = async (req, res) => {
  try {
    const { updates } = req.body
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Provide updates array' })
    }

    for (const { key, value } of updates) {
      if (!DEFAULTS[key]) continue
      await prisma.platformConfig.upsert({
        where:  { key },
        update: { value: String(value), label: DEFAULTS[key].label, category: DEFAULTS[key].category },
        create: { key, value: String(value), label: DEFAULTS[key].label, category: DEFAULTS[key].category },
      })
    }

    res.json({ message: `✓ ${updates.length} setting${updates.length !== 1 ? 's' : ''} saved!` })
  } catch (err) {
    console.error('saveAdminConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── Helper: get single config value (used by other controllers) ───────────────
const getConfigValue = async (key) => {
  try {
    const row = await prisma.platformConfig.findUnique({ where: { key } })
    if (row) return isNaN(Number(row.value)) ? row.value : Number(row.value)
    const def = DEFAULTS[key]
    if (!def) return null
    return isNaN(Number(def.value)) ? def.value : Number(def.value)
  } catch {
    return DEFAULTS[key]?.value ?? null
  }
}

module.exports = { getPublicConfig, getAdminConfig, saveAdminConfig, getConfigValue }
