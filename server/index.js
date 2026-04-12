// index.js — GHQ Backend Server (Production-ready)
require('dotenv').config()

const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes       = require('./routes/auth.routes')
const userRoutes       = require('./routes/user.routes')
const tournamentRoutes = require('./routes/tournament.routes')
const economyRoutes    = require('./routes/economy.routes')
const gameRoutes       = require('./routes/game.routes')
const walletRoutes     = require('./routes/wallet.routes')
const withdrawRoutes   = require('./routes/withdraw.routes')
const adRoutes         = require('./routes/ad.routes')

const { startScheduler } = require('./scheduler')

const app    = express()
const PORT   = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// ── Trust proxy (required for Railway) ───────────────────────────────────────
app.set('trust proxy', 1)

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_2,
    ].filter(Boolean)
    const isVercel  = origin.endsWith('.vercel.app')
    const isAllowed = allowed.includes(origin) || isVercel
    if (isAllowed) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials:          true,
  methods:              ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders:       ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}))

app.options('*', cors())

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy:     false,
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             isProd ? 200 : 500,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { message: 'Too many requests, please slow down' },
}))
app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 20 }))
app.use('/api/auth/register', rateLimit({ windowMs: 15*60*1000, max: 10 }))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
if (!isProd) app.use(morgan('dev'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/',           (req, res) => res.json({ status: 'ok', service: 'GHQ API' }))
app.get('/api/health', (req, res) => res.json({
  status:  'ok',
  service: 'GHQ API 🎮',
  env:     process.env.NODE_ENV,
  time:    new Date().toISOString(),
}))

// ── ONE-TIME SEED ENDPOINT ────────────────────────────────────────────────────
// Open in browser: https://YOUR-RAILWAY-URL.up.railway.app/api/ghq-seed-2026
// Delete this after seeding is confirmed working
app.get('/api/ghq-seed-2026', async (req, res) => {
  try {
    const prisma = require('./config/db')
    const bcrypt = require('bcryptjs')

    // Achievements
    const achievements = [
      { key: 'first_blood',        icon: '🏆', label: 'First Blood',       description: 'Win your first tournament',     coinReward: 500   },
      { key: 'ten_tournaments',    icon: '🎯', label: '10 Tournaments',     description: 'Enter 10 tournaments',          coinReward: 1000  },
      { key: 'win_streak_5',       icon: '⚡', label: 'Win Streak x5',      description: 'Win 5 tournaments in a row',    coinReward: 2000  },
      { key: 'top_10_rank',        icon: '👑', label: 'Top 10 Rank',        description: 'Reach global top 10',           coinReward: 3000  },
      { key: 'champions_finalist', icon: '💎', label: 'Champions Finalist', description: 'Reach a Champions final',       coinReward: 5000  },
      { key: 'on_fire',            icon: '🔥', label: 'On Fire',            description: 'Win 3 in one week',             coinReward: 1500  },
      { key: 'legend',             icon: '🌟', label: 'Legend',             description: 'Earn 50,000 GHQ Coins total',   coinReward: 10000 },
      { key: 'multi_platform',     icon: '🎮', label: 'Multi-Platform',     description: 'Win on both PC & Mobile',       coinReward: 750   },
    ]
    for (const a of achievements) {
      await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a })
    }

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 12)
    await prisma.user.upsert({
      where:  { email: 'admin@ghq.gg' },
      update: {},
      create: {
        username: 'GHQAdmin', email: 'admin@ghq.gg',
        passwordHash: adminHash, avatar: 'GA', role: 'ADMIN',
        gollers: 99999, totalBought: 99999, coins: 999999, totalEarned: 999999,
      },
    })

    // Sample players
    const ph = await bcrypt.hash('player123', 12)
    const players = [
      { username: 'PhantomX',    email: 'phantom@ghq.gg', coins: 48200, gollers: 500,  wins: 34, avatar: 'PX' },
      { username: 'StormRaider', email: 'storm@ghq.gg',   coins: 41500, gollers: 300,  wins: 29, avatar: 'SR' },
      { username: 'NightFury',   email: 'night@ghq.gg',   coins: 38800, gollers: 1000, wins: 27, avatar: 'NF' },
      { username: 'VortexKing',  email: 'vortex@ghq.gg',  coins: 34200, gollers: 200,  wins: 23, avatar: 'VK' },
      { username: 'ShadowByte',  email: 'shadow@ghq.gg',  coins: 31600, gollers: 750,  wins: 21, avatar: 'SB' },
    ]
    for (const p of players) {
      await prisma.user.upsert({
        where:  { email: p.email },
        update: {},
        create: {
          username: p.username, email: p.email, passwordHash: ph,
          avatar: p.avatar, gollers: p.gollers, totalBought: p.gollers,
          coins: p.coins, totalEarned: p.coins, wins: p.wins,
        },
      })
    }

    // Sample tournaments
    const now    = new Date()
    const future = (days) => {
      const d = new Date(now)
      d.setDate(d.getDate() + days)
      d.setHours(18, 0, 0, 0)
      return d
    }
    const tours = [
      { name: 'VALORANT WINTER CLASH',   game: 'Valorant',   platform: 'PC',     type: 'TOURNAMENT', mode: 'PAID', status: 'LIVE',     entryFee: 50,  prizePool: 5000,  coinReward: 800,  maxPlayers: 64,  startDate: future(-1), adsRequired: 0 },
      { name: 'BGMI CHAMPIONS CUP',      game: 'BGMI',       platform: 'Mobile', type: 'CHAMPIONS',  mode: 'PAID', status: 'UPCOMING', entryFee: 100, prizePool: 20000, coinReward: 3000, maxPlayers: 32,  startDate: future(5),  adsRequired: 0 },
      { name: 'FREE FIRE FRIDAY FIESTA', game: 'Free Fire',  platform: 'Mobile', type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING', entryFee: 0,   prizePool: 1000,  coinReward: 400,  maxPlayers: 128, startDate: future(2),  adsRequired: 2 },
      { name: 'CS2 MASTERS',             game: 'CS2',        platform: 'PC',     type: 'CHAMPIONS',  mode: 'PAID', status: 'UPCOMING', entryFee: 200, prizePool: 50000, coinReward: 8000, maxPlayers: 16,  startDate: future(10), adsRequired: 0 },
      { name: 'COD MOBILE OPEN',         game: 'COD Mobile', platform: 'Mobile', type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING', entryFee: 0,   prizePool: 2000,  coinReward: 500,  maxPlayers: 64,  startDate: future(3),  adsRequired: 3 },
      { name: 'PUBG PC PRO LEAGUE',      game: 'PUBG',       platform: 'PC',     type: 'TOURNAMENT', mode: 'PAID', status: 'LIVE',     entryFee: 75,  prizePool: 8000,  coinReward: 1200, maxPlayers: 100, startDate: future(-1), adsRequired: 0 },
    ]
    for (const t of tours) {
      const exists = await prisma.tournament.findFirst({ where: { name: t.name } })
      if (!exists) await prisma.tournament.create({ data: { ...t, rules: [], tags: [], prizeTiers: [] } })
    }

    res.json({
      success: true,
      message: '✅ GHQ database seeded!',
      login: { admin: 'admin@ghq.gg / admin123', player: 'phantom@ghq.gg / player123' },
    })
  } catch (err) {
    console.error('Seed error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/users',       userRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/economy',     economyRoutes)
app.use('/api/games',       gameRoutes)
app.use('/api/wallet',      walletRoutes)
app.use('/api/withdraw',    withdrawRoutes)
app.use('/api/ads',         adRoutes)

// ── 404 + Error ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }))
app.use((err, req, res, next) => {
  if (!err.message?.includes('CORS')) console.error('Server error:', err.message)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('  ██████╗ ██╗  ██╗ ██████╗')
  console.log('  ██╔════╝ ██║  ██║██╔═══██╗')
  console.log('  ██║  ███╗███████║██║   ██║')
  console.log('  ██║   ██║██╔══██║██║▄▄ ██║')
  console.log('  ╚██████╔╝██║  ██║╚██████╔╝')
  console.log('')
  console.log(`  🎮 GHQ API  →  port ${PORT}`)
  console.log(`  🌍 Env      →  ${process.env.NODE_ENV}`)
  console.log(`  🔗 CORS     →  *.vercel.app + ${process.env.CLIENT_URL || 'CLIENT_URL not set'}`)
  console.log('')
  startScheduler()
})

module.exports = app
