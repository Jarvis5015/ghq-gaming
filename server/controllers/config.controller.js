// controllers/config.controller.js
// Admin-controlled platform settings stored in DB
// These replace hardcoded values throughout the app

const prisma = require('../config/db')

// ── Default values — used if nothing is in DB yet ─────────────────────────────
const DEFAULTS = {
  // GHQ Coins — earning
  daily_bonus_coins:        { value: '25',   label: 'Daily Login Bonus',             category: 'coins', desc: 'Coins given when player claims daily bonus' },
  welcome_bonus_coins:      { value: '100',  label: 'Welcome Bonus (new users)',      category: 'coins', desc: 'Coins given to new players on registration' },
  tournament_join_coins:    { value: '50',   label: 'Tournament Join Reward',         category: 'coins', desc: 'Coins given just for joining any tournament' },
  ad_watch_coins:           { value: '10',   label: 'Coins per Ad Watched',           category: 'coins', desc: 'Coins earned for each ad watched in ad gate' },

  // GHQ Coins — tournament prizes (defaults, overridden by prize tiers)
  win_1st_coins:            { value: '2000', label: '1st Place Coins (Open)',         category: 'prizes', desc: 'Default coins for 1st place in open tournament' },
  win_2nd_coins:            { value: '1000', label: '2nd Place Coins (Open)',         category: 'prizes', desc: 'Default coins for 2nd place' },
  win_3rd_coins:            { value: '500',  label: '3rd Place Coins (Open)',         category: 'prizes', desc: 'Default coins for 3rd place' },
  win_1st_coins_champions:  { value: '5000', label: '1st Place Coins (Champions)',    category: 'prizes', desc: 'Default coins for 1st in Champions tournament' },
  win_2nd_coins_champions:  { value: '2500', label: '2nd Place Coins (Champions)',    category: 'prizes', desc: 'Default coins for 2nd in Champions tournament' },
  win_3rd_coins_champions:  { value: '1500', label: '3rd Place Coins (Champions)',    category: 'prizes', desc: 'Default coins for 3rd in Champions tournament' },

  // Gollars
  min_withdrawal_gollars:   { value: '50',   label: 'Minimum Withdrawal (Gollars)',   category: 'gollars', desc: 'Minimum Gollars a player can withdraw at once' },
  max_topup_gollars:        { value: '10000',label: 'Maximum Top-up (Gollars)',       category: 'gollars', desc: 'Maximum Gollars a player can buy in one transaction' },
}

// ── GET /api/config/public ────────────────────────────────────────────────────
// Public — used by frontend to know current values
const getPublicConfig = async (req, res) => {
  try {
    const rows = await prisma.platformConfig.findMany()
    const config = {}

    // Start with defaults
    for (const [key, def] of Object.entries(DEFAULTS)) {
      config[key] = Number(def.value)
    }

    // Override with DB values
    for (const row of rows) {
      config[row.key] = isNaN(Number(row.value)) ? row.value : Number(row.value)
    }

    res.json({ config })
  } catch (err) {
    console.error('getPublicConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/config/admin (Admin) ─────────────────────────────────────────────
// Full list with labels, descriptions, categories for the admin panel
const getAdminConfig = async (req, res) => {
  try {
    const rows = await prisma.platformConfig.findMany()
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

// ── PUT /api/config/admin (Admin) ─────────────────────────────────────────────
// Save one or many config values
// Body: { updates: [{ key: 'daily_bonus_coins', value: '30' }, ...] }
const saveAdminConfig = async (req, res) => {
  try {
    const { updates } = req.body
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Provide updates array' })
    }

    for (const { key, value } of updates) {
      if (!DEFAULTS[key]) continue // ignore unknown keys

      await prisma.platformConfig.upsert({
        where:  { key },
        update: { value: String(value), label: DEFAULTS[key].label, category: DEFAULTS[key].category },
        create: { key, value: String(value), label: DEFAULTS[key].label, category: DEFAULTS[key].category },
      })
    }

    res.json({ message: `✓ ${updates.length} setting${updates.length !== 1 ? 's' : ''} saved successfully!` })
  } catch (err) {
    console.error('saveAdminConfig error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── Helper: get a single config value (used internally by other controllers) ──
const getConfigValue = async (key) => {
  try {
    const row = await prisma.platformConfig.findUnique({ where: { key } })
    if (row) return Number(row.value) || row.value
    return Number(DEFAULTS[key]?.value) || DEFAULTS[key]?.value || null
  } catch {
    return Number(DEFAULTS[key]?.value) || null
  }
}

module.exports = { getPublicConfig, getAdminConfig, saveAdminConfig, getConfigValue }
