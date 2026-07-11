// index.js — GHQ Backend Server
require('dotenv').config()

const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes         = require('./routes/auth.routes')
const userRoutes         = require('./routes/user.routes')
const tournamentRoutes   = require('./routes/tournament.routes')
const economyRoutes      = require('./routes/economy.routes')
const gameRoutes         = require('./routes/game.routes')
const walletRoutes       = require('./routes/wallet.routes')
const withdrawRoutes     = require('./routes/withdraw.routes')
const adRoutes           = require('./routes/ad.routes')
const configRoutes       = require('./routes/config.routes')
const announcementRoutes = require('./routes/announcement.routes')
const fakeRoutes         = require('./routes/fake.routes')

const { startScheduler } = require('./scheduler')

const app    = express()
const PORT   = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const isVercel  = origin.endsWith('.vercel.app')
    const isAllowed = allowedOrigins.includes(origin) || isVercel
    if (isAllowed) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}))
app.options('*', cors())

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false, crossOriginOpenerPolicy: false }))

app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: isProd ? 200 : 500, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests' } }))
app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 20 }))
app.use('/api/auth/register', rateLimit({ windowMs: 15*60*1000, max: 10 }))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
if (!isProd) app.use(morgan('dev'))

app.get('/',           (req, res) => res.json({ status: 'ok', service: 'GHQ API' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'GHQ API 🎮', env: process.env.NODE_ENV, time: new Date().toISOString() }))

// ── Seed endpoint ─────────────────────────────────────────────────────────────
app.get('/api/ghq-seed-2026', async (req, res) => {
  try {
    const prisma = require('./config/db')
    const bcrypt = require('bcryptjs')
    const achievements = [
      { key: 'first_blood',        icon: '🏆', label: 'First Blood',       description: 'Win your first tournament',   coinReward: 500   },
      { key: 'ten_tournaments',    icon: '🎯', label: '10 Tournaments',     description: 'Enter 10 tournaments',        coinReward: 1000  },
      { key: 'win_streak_5',       icon: '⚡', label: 'Win Streak x5',      description: 'Win 5 in a row',              coinReward: 2000  },
      { key: 'top_10_rank',        icon: '👑', label: 'Top 10 Rank',        description: 'Reach global top 10',         coinReward: 3000  },
      { key: 'champions_finalist', icon: '💎', label: 'Champions Finalist', description: 'Reach a Champions final',     coinReward: 5000  },
      { key: 'on_fire',            icon: '🔥', label: 'On Fire',            description: 'Win 3 in one week',           coinReward: 1500  },
      { key: 'legend',             icon: '🌟', label: 'Legend',             description: 'Earn 50,000 GHQ Coins total', coinReward: 10000 },
      { key: 'multi_platform',     icon: '🎮', label: 'Multi-Platform',     description: 'Win on both PC & Mobile',     coinReward: 750   },
    ]
    for (const a of achievements) await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a })
    const adminHash = await bcrypt.hash('admin123', 12)
    await prisma.user.upsert({ where: { email: 'admin@ghq.gg' }, update: {}, create: { username: 'GHQAdmin', email: 'admin@ghq.gg', passwordHash: adminHash, avatar: 'GA', role: 'ADMIN', gollers: 99999, coins: 999999, totalEarned: 999999, totalBought: 99999 } })
    const ph = await bcrypt.hash('player123', 12)
    for (const p of [
      { username: 'PhantomX', email: 'phantom@ghq.gg', coins: 48200, gollers: 500, wins: 34, avatar: 'PX' },
      { username: 'StormRaider', email: 'storm@ghq.gg', coins: 41500, gollers: 300, wins: 29, avatar: 'SR' },
    ]) await prisma.user.upsert({ where: { email: p.email }, update: {}, create: { ...p, passwordHash: ph, totalBought: p.gollers, totalEarned: p.coins } })
    res.json({ success: true, message: '✅ GHQ seeded!' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/tournaments',   tournamentRoutes)
app.use('/api/economy',       economyRoutes)
app.use('/api/games',         gameRoutes)
app.use('/api/wallet',        walletRoutes)
app.use('/api/withdraw',      withdrawRoutes)
app.use('/api/ads',           adRoutes)
app.use('/api/config',        configRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/fake',          fakeRoutes)

app.use('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }))
app.use((err, req, res, next) => {
  if (!err.message?.includes('CORS')) console.error('Server error:', err.message)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🎮 GHQ API  →  port ${PORT} | env: ${process.env.NODE_ENV}\n`)
  startScheduler()
})

module.exports = app
