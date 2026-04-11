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

const app  = express()
const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// ── Trust proxy (needed for Railway / Render / Heroku) ────────────────────────
app.set('trust proxy', 1)

// ── CORS — allow both local dev and production frontend ───────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,         // set in Railway env vars
  process.env.CLIENT_URL_2,       // optional second domain
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,  // needed for QR code images from external API
  contentSecurityPolicy: false,      // handled by frontend
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isProd ? 150 : 500,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: 'Too many requests, please slow down' },
}))

app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 10 }))
app.use('/api/auth/register', rateLimit({ windowMs: 15*60*1000, max: 10 }))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
if (!isProd) app.use(morgan('dev'))

// ── Health check (Railway uses this to confirm server is up) ──────────────────
app.get('/',         (req, res) => res.json({ status: 'ok', service: 'GHQ API' }))
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

// ── 404 + Global error ────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }))
app.use((err, req, res, next) => {
  // Don't log CORS errors in production (too noisy)
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
  console.log(`  🎮 GHQ API      →  http://0.0.0.0:${PORT}`)
  console.log(`  🌍 Environment  →  ${process.env.NODE_ENV}`)
  console.log(`  🪙 UPI ID       →  ${process.env.UPI_ID || 'NOT SET'}`)
  console.log(`  🔗 CORS origins →  ${allowedOrigins.join(', ')}`)
  console.log('')
  startScheduler()
})

module.exports = app
