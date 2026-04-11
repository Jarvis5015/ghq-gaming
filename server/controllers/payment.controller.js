// controllers/payment.controller.js
// UPI-based payment system for GHQ tournament entry fees
//
// Flow:
// 1. Player clicks "Join" on a paid tournament
// 2. Server generates a unique 6-char code  e.g. "4X9K2M"
// 3. Server returns a UPI payment URL + the code
// 4. Frontend generates QR from the URL and shows it
// 5. Player scans QR, pays, writes code in UPI note/remark
// 6. Player submits the code back on the site
// 7. Admin sees submitted codes in admin panel → verifies → confirms
// 8. On verification → registration is created + coins awarded

const prisma = require('../config/db')
const crypto = require('crypto')

// ── Helpers ───────────────────────────────────────────────────────────────────

// Generate a unique 6-character alphanumeric code  e.g. "4X9K2M"
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I,O,0,1 to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Build a UPI deep-link URL
// When scanned, Google Pay / PhonePe / Paytm auto-fills:
//   - Recipient UPI ID
//   - Amount
//   - Note (pre-filled with the code so player doesn't have to type)
const buildUpiUrl = (amount, code, tournamentName) => {
  const upiId   = process.env.UPI_ID   || 'your-upi@bank'
  const upiName = process.env.UPI_NAME || 'GamerHeadQuarter'
  const note    = `GHQ-${code}` // what shows in payment note

  // Standard UPI intent URL (works with all UPI apps)
  const params = new URLSearchParams({
    pa:  upiId,               // payee address (UPI ID)
    pn:  upiName,             // payee name
    am:  amount.toString(),   // amount in rupees
    cu:  'INR',               // currency
    tn:  note,                // transaction note / remark
  })

  return `upi://pay?${params.toString()}`
}

// ── POST /api/payments/initiate ───────────────────────────────────────────────
// Step 1 & 2: Player wants to join a paid tournament
// Returns: unique code + UPI URL to show as QR
const initiatePayment = async (req, res) => {
  try {
    const { tournamentId } = req.body
    const userId = req.user.id

    // Validate tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: Number(tournamentId) },
      include: { _count: { select: { registrations: true } } },
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    if (tournament.mode === 'FREE') {
      return res.status(400).json({ message: 'This is a free tournament — use the join button directly' })
    }

    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Tournament is no longer accepting registrations' })
    }

    if (tournament._count.registrations >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full' })
    }

    // Check not already registered
    const alreadyRegistered = await prisma.registration.findUnique({
      where: { userId_tournamentId: { userId, tournamentId: Number(tournamentId) } },
    })
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this tournament' })
    }

    // Check if a pending code already exists for this user+tournament
    const existingCode = await prisma.paymentCode.findUnique({
      where: { userId_tournamentId: { userId, tournamentId: Number(tournamentId) } },
    })

    if (existingCode) {
      // If it's still valid (not expired/cancelled), return it again
      if (
        existingCode.status === 'PENDING' ||
        existingCode.status === 'SUBMITTED'
      ) {
        const upiUrl = buildUpiUrl(tournament.entryFee, existingCode.code, tournament.name)
        return res.json({
          code:    existingCode.code,
          amount:  tournament.entryFee,
          upiUrl,
          upiId:   process.env.UPI_ID,
          upiName: process.env.UPI_NAME,
          status:  existingCode.status,
          message: 'Your payment code is still active',
          expiresAt: existingCode.expiresAt,
        })
      }
    }

    // Generate a unique code (retry if collision)
    let code
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      const collision = await prisma.paymentCode.findUnique({ where: { code } })
      if (!collision) break
    } while (attempts < 10)

    // Set expiry
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + Number(process.env.PAYMENT_CODE_EXPIRY_HOURS || 24))

    // Save code to DB (upsert in case old expired one exists)
    const paymentCode = await prisma.paymentCode.upsert({
      where: { userId_tournamentId: { userId, tournamentId: Number(tournamentId) } },
      update: {
        code,
        status:    'PENDING',
        expiresAt,
        verifiedAt: null,
      },
      create: {
        code,
        userId,
        tournamentId: Number(tournamentId),
        amount:       tournament.entryFee,
        status:       'PENDING',
        expiresAt,
      },
    })

    // Build UPI URL
    const upiUrl = buildUpiUrl(tournament.entryFee, code, tournament.name)

    res.status(201).json({
      code,
      amount:  tournament.entryFee,
      upiUrl,
      upiId:   process.env.UPI_ID,
      upiName: process.env.UPI_NAME || 'GamerHeadQuarter',
      status:  'PENDING',
      expiresAt,
      message: 'Payment initiated — scan QR and pay, then submit your code below',
    })

  } catch (error) {
    console.error('InitiatePayment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/payments/submit-code ────────────────────────────────────────────
// Step 6: Player says "I've paid, here's my code"
// Marks the code as SUBMITTED — admin still needs to verify
const submitCode = async (req, res) => {
  try {
    const { code } = req.body
    const userId   = req.user.id

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: 'Please enter your payment code' })
    }

    const cleanCode = code.trim().toUpperCase()

    // Find the code
    const paymentCode = await prisma.paymentCode.findUnique({
      where: { code: cleanCode },
      include: {
        tournament: { select: { id: true, name: true, entryFee: true } },
        user:       { select: { id: true, username: true } },
      },
    })

    if (!paymentCode) {
      return res.status(404).json({ message: 'Invalid code — please check and try again' })
    }

    // Must belong to this user
    if (paymentCode.userId !== userId) {
      return res.status(403).json({ message: 'This code does not belong to your account' })
    }

    // Must be in PENDING status
    if (paymentCode.status === 'VERIFIED') {
      return res.status(400).json({ message: 'This code has already been verified — you are registered!' })
    }
    if (paymentCode.status === 'SUBMITTED') {
      return res.status(400).json({ message: 'Code already submitted — waiting for admin verification' })
    }
    if (paymentCode.status === 'EXPIRED') {
      return res.status(400).json({ message: 'This code has expired — please generate a new one' })
    }
    if (paymentCode.status === 'CANCELLED') {
      return res.status(400).json({ message: 'This code was cancelled' })
    }

    // Check expiry
    if (new Date() > paymentCode.expiresAt) {
      await prisma.paymentCode.update({
        where: { code: cleanCode },
        data:  { status: 'EXPIRED' },
      })
      return res.status(400).json({ message: 'Code has expired — please generate a new one' })
    }

    // Mark as SUBMITTED
    await prisma.paymentCode.update({
      where: { code: cleanCode },
      data:  { status: 'SUBMITTED' },
    })

    res.json({
      message: `Code submitted! ✓ Our team will verify your payment of ₹${paymentCode.amount} and confirm your spot in ${paymentCode.tournament.name} shortly.`,
      code:    cleanCode,
      status:  'SUBMITTED',
      tournament: paymentCode.tournament.name,
    })

  } catch (error) {
    console.error('SubmitCode error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Admin only — Step 7: Admin confirms they received the payment
// This creates the actual registration and awards participation coins
const verifyPayment = async (req, res) => {
  try {
    const { code } = req.body

    const cleanCode  = code.trim().toUpperCase()
    const paymentCode = await prisma.paymentCode.findUnique({
      where: { code: cleanCode },
      include: {
        tournament: true,
        user:       true,
      },
    })

    if (!paymentCode) {
      return res.status(404).json({ message: 'Code not found' })
    }

    if (paymentCode.status === 'VERIFIED') {
      return res.status(400).json({ message: 'Already verified' })
    }

    if (paymentCode.status === 'EXPIRED') {
      return res.status(400).json({ message: 'Code has expired' })
    }

    // Check tournament isn't full already (someone else might have taken the slot)
    const regCount = await prisma.registration.count({
      where: { tournamentId: paymentCode.tournamentId },
    })
    if (regCount >= paymentCode.tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is now full — cannot register this player' })
    }

    // Check not already registered somehow
    const alreadyReg = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId:       paymentCode.userId,
          tournamentId: paymentCode.tournamentId,
        },
      },
    })
    if (alreadyReg) {
      return res.status(400).json({ message: 'Player is already registered' })
    }

    const participationCoins = 50

    // All in one transaction: verify code + create registration + award coins
    await prisma.$transaction([
      // Mark code verified
      prisma.paymentCode.update({
        where: { code: cleanCode },
        data:  { status: 'VERIFIED', verifiedAt: new Date() },
      }),
      // Create registration
      prisma.registration.create({
        data: {
          userId:       paymentCode.userId,
          tournamentId: paymentCode.tournamentId,
          paymentCode:  cleanCode,
        },
      }),
      // Award coins
      prisma.user.update({
        where: { id: paymentCode.userId },
        data: {
          coins:       { increment: participationCoins },
          totalEarned: { increment: participationCoins },
        },
      }),
      // Log coin transaction
      prisma.coinTransaction.create({
        data: {
          userId: paymentCode.userId,
          type:   'EARN',
          amount: participationCoins,
          label:  `Registered for ${paymentCode.tournament.name}`,
          game:   paymentCode.tournament.game,
        },
      }),
    ])

    res.json({
      message:  `✓ Payment verified! ${paymentCode.user.username} is now registered for ${paymentCode.tournament.name}`,
      code:     cleanCode,
      username: paymentCode.user.username,
      tournament: paymentCode.tournament.name,
    })

  } catch (error) {
    console.error('VerifyPayment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/payments/my-code/:tournamentId ───────────────────────────────────
// Player checks the status of their payment code for a tournament
const getMyCode = async (req, res) => {
  try {
    const userId       = req.user.id
    const tournamentId = Number(req.params.tournamentId)

    const code = await prisma.paymentCode.findUnique({
      where: { userId_tournamentId: { userId, tournamentId } },
    })

    if (!code) {
      return res.json({ code: null })
    }

    // Auto-expire if past time
    if (code.status === 'PENDING' && new Date() > code.expiresAt) {
      await prisma.paymentCode.update({
        where: { id: code.id },
        data:  { status: 'EXPIRED' },
      })
      return res.json({ code: { ...code, status: 'EXPIRED' } })
    }

    res.json({ code })
  } catch (error) {
    console.error('GetMyCode error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/payments/pending (Admin only) ────────────────────────────────────
// Admin sees all SUBMITTED codes waiting for verification
const getPendingPayments = async (req, res) => {
  try {
    const { status = 'SUBMITTED' } = req.query

    const codes = await prisma.paymentCode.findMany({
      where:   { status: status.toUpperCase() },
      include: {
        user:       { select: { id: true, username: true, avatar: true, email: true } },
        tournament: { select: { id: true, name: true, game: true, entryFee: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ payments: codes, count: codes.length })
  } catch (error) {
    console.error('GetPendingPayments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── DELETE /api/payments/cancel ───────────────────────────────────────────────
// Player cancels their own pending payment
const cancelPayment = async (req, res) => {
  try {
    const { tournamentId } = req.body
    const userId = req.user.id

    const code = await prisma.paymentCode.findUnique({
      where: { userId_tournamentId: { userId, tournamentId: Number(tournamentId) } },
    })

    if (!code) {
      return res.status(404).json({ message: 'No payment found' })
    }

    if (code.status === 'VERIFIED') {
      return res.status(400).json({ message: 'Payment already verified — contact admin to cancel' })
    }

    await prisma.paymentCode.update({
      where: { id: code.id },
      data:  { status: 'CANCELLED' },
    })

    res.json({ message: 'Payment cancelled' })
  } catch (error) {
    console.error('CancelPayment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  initiatePayment,
  submitCode,
  verifyPayment,
  getMyCode,
  getPendingPayments,
  cancelPayment,
}
