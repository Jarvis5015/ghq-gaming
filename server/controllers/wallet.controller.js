// controllers/wallet.controller.js
const prisma = require('../config/db')

const G = '🪙'  // Gollars icon

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const buildUpiUrl = (amount, code) => {
  const params = new URLSearchParams({
    pa: process.env.UPI_ID   || 'your-upi@bank',
    pn: process.env.UPI_NAME || 'GamerHeadQuarter',
    am: amount.toString(),
    cu: 'INR',
    tn: `GamingHQ Tournament Entry | HQ Code: ${code}`,
  })
  return `upi://pay?${params.toString()}`
}

// ── GET /api/wallet/balance ───────────────────────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { gollers: true, totalBought: true, totalSpent: true },
    })
    // ✅ FIXED: was "gollars" (typo) — must match DB field + frontend key "gollers"
    res.json({ gollers: user.gollers, totalBought: user.totalBought, totalSpent: user.totalSpent })
  } catch (err) {
    console.error('getBalance error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/wallet/history ───────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const [topUps, entries] = await Promise.all([
      prisma.gollerTopUp.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.registration.findMany({
        where:   { userId, gollersPaid: { gt: 0 } },
        include: { tournament: { select: { name: true, game: true } } },
        orderBy: { createdAt: 'desc' }, take: 30,
      }),
    ])

    const history = [
      ...topUps.map(t => ({
        id:        `topup-${t.id}`,
        type:      'TOPUP',
        amount:    t.amount,
        label:     `${G} Bought ${t.amount} Gollars`,
        status:    t.status,
        createdAt: t.createdAt,
        // code intentionally NOT returned
      })),
      ...entries.map(r => ({
        id:        `entry-${r.id}`,
        type:      'SPEND',
        amount:    -r.gollersPaid,
        label:     `Entered: ${r.tournament.name}`,
        game:      r.tournament.game,
        status:    'COMPLETED',
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({ history })
  } catch (err) {
    console.error('getHistory error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/wallet/initiate-topup ──────────────────────────────────────────
// Code is NEVER returned to frontend — embedded in UPI note only
// Player reads it from their payment receipt: "HQ Code: XXXXXX"
const initiateTopUp = async (req, res) => {
  try {
    const userId = req.user.id
    const amount = Number(req.body.amount)

    if (!amount || isNaN(amount))  return res.status(400).json({ message: 'Enter a valid amount' })
    if (amount < 10)               return res.status(400).json({ message: 'Minimum top-up is ₹10 (10 Gollars)' })
    if (amount > 10000)            return res.status(400).json({ message: 'Maximum top-up is ₹10,000 at once' })

    // Block if already submitted and awaiting admin
    const submitted = await prisma.gollerTopUp.findFirst({
      where: { userId, status: 'SUBMITTED', expiresAt: { gt: new Date() } },
    })
    if (submitted) {
      return res.status(400).json({
        message: 'You have a payment submitted and awaiting verification. Wait before buying more Gollars.',
        status:  'SUBMITTED',
      })
    }

    // Cancel old PENDING codes so new amount is always fresh
    await prisma.gollerTopUp.updateMany({
      where: { userId, status: 'PENDING' },
      data:  { status: 'CANCELLED' },
    })

    // Generate unique code
    let code
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      const collision = await prisma.gollerTopUp.findUnique({ where: { code } })
      if (!collision) break
    } while (attempts < 10)

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + Number(process.env.PAYMENT_CODE_EXPIRY_HOURS || 24))

    await prisma.gollerTopUp.create({
      data: { code, userId, amount, expiresAt },
    })

    const upiUrl = buildUpiUrl(amount, code)

    res.status(201).json({
      amount,
      upiUrl,
      upiId:     process.env.UPI_ID,
      upiName:   process.env.UPI_NAME || 'GamerHeadQuarter',
      status:    'PENDING',
      expiresAt,
      // ✅ code NOT in response — player gets it from UPI receipt
    })
  } catch (err) {
    console.error('initiateTopUp error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/wallet/submit-code ──────────────────────────────────────────────
const submitTopUpCode = async (req, res) => {
  try {
    const userId    = req.user.id
    const cleanCode = (req.body.code || '').trim().toUpperCase()

    if (!cleanCode) return res.status(400).json({ message: 'Enter your payment code from the UPI receipt' })

    const topUp = await prisma.gollerTopUp.findUnique({ where: { code: cleanCode } })

    if (!topUp)                       return res.status(404).json({ message: 'Code not found — check your UPI receipt carefully' })
    if (topUp.userId !== userId)      return res.status(403).json({ message: 'This code does not belong to your account' })
    if (topUp.status === 'VERIFIED')  return res.status(400).json({ message: `${G} Gollars already credited to your wallet!` })
    if (topUp.status === 'SUBMITTED') return res.status(400).json({ message: 'Code already submitted — waiting for admin to verify' })
    if (topUp.status === 'CANCELLED') return res.status(400).json({ message: 'This code was cancelled. Generate a new QR.' })
    if (topUp.status === 'EXPIRED' || new Date() > topUp.expiresAt) {
      await prisma.gollerTopUp.update({ where: { code: cleanCode }, data: { status: 'EXPIRED' } })
      return res.status(400).json({ message: 'Code expired — generate a new top-up QR' })
    }

    await prisma.gollerTopUp.update({ where: { code: cleanCode }, data: { status: 'SUBMITTED' } })

    res.json({
      message: `Code submitted! Admin will verify your ₹${topUp.amount} payment and credit ${topUp.amount} ${G} Gollars shortly.`,
      amount:  topUp.amount,
      status:  'SUBMITTED',
    })
  } catch (err) {
    console.error('submitTopUpCode error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/wallet/topup-status ─────────────────────────────────────────────
const getTopUpStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const topUp  = await prisma.gollerTopUp.findFirst({
      where:   { userId, status: { in: ['SUBMITTED', 'VERIFIED'] } },
      orderBy: { createdAt: 'desc' },
    })

    if (!topUp) return res.json({ topUp: null })

    if (topUp.status === 'VERIFIED') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { gollers: true } })
      const { code: _code, ...safeTopUp } = topUp
      return res.json({ topUp: safeTopUp, newBalance: user.gollers })
    }

    const { code: _code, ...safeTopUp } = topUp
    res.json({ topUp: safeTopUp })
  } catch (err) {
    console.error('getTopUpStatus error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/wallet/verify (Admin only) ─────────────────────────────────────
const verifyTopUp = async (req, res) => {
  try {
    const cleanCode = (req.body.code || '').trim().toUpperCase()
    const topUp = await prisma.gollerTopUp.findUnique({
      where:   { code: cleanCode },
      include: { user: { select: { id: true, username: true, email: true } } },
    })

    if (!topUp)                       return res.status(404).json({ message: 'Code not found' })
    if (topUp.status === 'VERIFIED')  return res.status(400).json({ message: 'Already verified — Gollars already credited' })
    if (topUp.status === 'EXPIRED')   return res.status(400).json({ message: 'Code has expired' })
    if (topUp.status === 'CANCELLED') return res.status(400).json({ message: 'Code was cancelled' })
    if (topUp.status === 'PENDING')   return res.status(400).json({ message: 'Player has not paid yet — code not submitted' })

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: topUp.userId },
        data:  { gollers: { increment: topUp.amount }, totalBought: { increment: topUp.amount } },
      }),
      prisma.gollerTopUp.update({
        where: { code: cleanCode },
        data:  { status: 'VERIFIED', verifiedAt: new Date() },
      }),
    ])

    res.json({
      message:    `✓ ${topUp.amount} ${G} Gollars credited to ${topUp.user.username}`,
      username:   topUp.user.username,
      amount:     topUp.amount,
      newBalance: updatedUser.gollers,
    })
  } catch (err) {
    console.error('verifyTopUp error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/wallet/pending (Admin only) ─────────────────────────────────────
const getPendingTopUps = async (req, res) => {
  try {
    const { status = 'SUBMITTED' } = req.query
    const topUps = await prisma.gollerTopUp.findMany({
      where:   { status: status.toUpperCase() },
      include: { user: { select: { id: true, username: true, avatar: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ topUps, count: topUps.length })
  } catch (err) {
    console.error('getPendingTopUps error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/wallet/join-tournament ─────────────────────────────────────────
const joinTournamentWithGollars = async (req, res) => {
  try {
    const userId       = req.user.id
    const tournamentId = Number(req.body.tournamentId)

    if (!tournamentId) return res.status(400).json({ message: 'Tournament ID required' })

    const [tournament, user] = await Promise.all([
      prisma.tournament.findUnique({
        where:   { id: tournamentId },
        include: { _count: { select: { registrations: true } } },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Tournament is no longer accepting registrations' })
    }
    if (tournament._count.registrations >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full — no slots remaining' })
    }

    const existing = await prisma.registration.findUnique({
      where: { userId_tournamentId: { userId, tournamentId } },
    })
    if (existing) return res.status(400).json({ message: 'You are already registered for this tournament' })

    const entryFee           = tournament.entryFee || 0
    const isFree             = tournament.mode === 'FREE' || entryFee === 0
    const participationCoins = 50

    if (isFree) {
      await prisma.$transaction([
        prisma.registration.create({ data: { userId, tournamentId, gollersPaid: 0 } }),
        prisma.user.update({
          where: { id: userId },
          data:  { coins: { increment: participationCoins }, totalEarned: { increment: participationCoins } },
        }),
        prisma.coinTransaction.create({
          data: { userId, type: 'EARN', amount: participationCoins, label: `Joined ${tournament.name}`, game: tournament.game },
        }),
      ])
      return res.status(201).json({
        message:     `✓ Joined ${tournament.name}! +${participationCoins} GHQ Coins added.`,
        gollarsPaid: 0,
        coinsEarned: participationCoins,
        free:        true,
      })
    }

    // PAID — check Gollars balance
    if (user.gollers < entryFee) {
      return res.status(400).json({
        message:   `Not enough Gollars! Need 🪙 ${entryFee}, you have 🪙 ${user.gollers}.`,
        needed:    entryFee,
        have:      user.gollers,
        shortfall: entryFee - user.gollers,
        needTopUp: true,
      })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  {
          gollers:    { decrement: entryFee },
          totalSpent: { increment: entryFee },
          coins:       { increment: participationCoins },
          totalEarned: { increment: participationCoins },
        },
      }),
      prisma.registration.create({ data: { userId, tournamentId, gollersPaid: entryFee } }),
      prisma.coinTransaction.create({
        data: { userId, type: 'EARN', amount: participationCoins, label: `Joined ${tournament.name}`, game: tournament.game },
      }),
    ])

    const updatedUser = await prisma.user.findUnique({ where: { id: userId }, select: { gollers: true } })

    res.status(201).json({
      message:     `✓ Joined ${tournament.name}! 🪙 ${entryFee} Gollars deducted. +${participationCoins} GHQ Coins earned.`,
      gollarsPaid: entryFee,
      newBalance:  updatedUser.gollers,
      coinsEarned: participationCoins,
      free:        false,
    })
  } catch (err) {
    console.error('joinTournamentWithGollars error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getBalance,
  getHistory,
  initiateTopUp,
  submitTopUpCode,
  getTopUpStatus,
  verifyTopUp,
  getPendingTopUps,
  joinTournamentWithGollars,
}
