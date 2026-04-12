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
// Allow all origins that end in vercel.app, or match our CLIENT_URL exactly
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true)

    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_2,
    ].filter(Boolean)

    // Allow any vercel.app subdomain (covers preview deployments too)
    const isVercel = origin.endsWith('.vercel.app')
    const isAllowed = allowed.includes(origin) || isVercel

    if (isAllowed) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,   // some older browsers need 200 not 204
}))

// Handle preflight OPTIONS requests explicitly
app.options('*', cors())

// ── Security headers ──────────────────────────────────────────────────────────
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
app.get('/',          (req, res) => res.json({ status: 'ok', service: 'GHQ API' }))
app.get('/api/health',(req, res) => res.json({
  status:  'ok',
  service: 'GHQ API 🎮',
  env:     process.env.NODE_ENV,
  time:    new Date().toISOString(),
}))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/users',       userRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/economy',     economyRoutes)
app.use('/api/games',       gameRoutes)
app.use('/api/wallet',      walletRoutes)
app.use('/api/withdraw',    withdrawRoutes)
app.use('/api/ads',         adRoutes)

// ── 404 + Error handler ───────────────────────────────────────────────────────
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
