// controllers/withdraw.controller.js
const prisma = require('../config/db')

const MIN_WITHDRAW = 50   // minimum 50 Gollars = ₹50

// ── POST /api/withdraw/request ────────────────────────────────────────────────
// Player submits a withdrawal request
const requestWithdraw = async (req, res) => {
  try {
    const userId  = req.user.id
    const amount  = Number(req.body.amount)
    const upiId   = (req.body.upiId   || '').trim()
    const upiName = (req.body.upiName || '').trim()

    if (!amount || amount < MIN_WITHDRAW) {
      return res.status(400).json({ message: `Minimum withdrawal is 🪙 ${MIN_WITHDRAW} Gollars (₹${MIN_WITHDRAW})` })
    }
    if (!upiId) {
      return res.status(400).json({ message: 'Enter your UPI ID (e.g. name@paytm)' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user.gollers < amount) {
      return res.status(400).json({
        message: `Not enough Gollars. You have 🪙 ${user.gollers}, requested 🪙 ${amount}.`,
      })
    }

    // Check no pending withdrawal already exists
    const existing = await prisma.withdrawRequest.findFirst({
      where: { userId, status: 'PENDING' },
    })
    if (existing) {
      return res.status(400).json({
        message: 'You already have a pending withdrawal. Wait for it to be processed before requesting again.',
      })
    }

    // Deduct Gollars immediately — held until paid or rejected
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  { gollers: { decrement: amount }, totalSpent: { increment: amount } },
      }),
      prisma.withdrawRequest.create({
        data: { userId, amount, upiId, upiName },
      }),
    ])

    const updatedUser = await prisma.user.findUnique({ where: { id: userId }, select: { gollers: true } })

    res.status(201).json({
      message: `Withdrawal request of 🪙 ${amount} (₹${amount}) submitted. Admin will pay within 24 hours.`,
      newBalance: updatedUser.gollers,
    })
  } catch (err) {
    console.error('requestWithdraw error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/withdraw/my-requests ────────────────────────────────────────────
// Player views their own withdrawal history
const getMyRequests = async (req, res) => {
  try {
    const requests = await prisma.withdrawRequest.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })
    res.json({ requests })
  } catch (err) {
    console.error('getMyRequests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/withdraw/admin/all (Admin) ───────────────────────────────────────
// Admin sees all withdrawal requests, filterable by status
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query
    const requests = await prisma.withdrawRequest.findMany({
      where:   status ? { status: status.toUpperCase() } : {},
      include: { user: { select: { id: true, username: true, avatar: true, email: true, gollers: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ requests, count: requests.length })
  } catch (err) {
    console.error('getAllRequests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/withdraw/admin/pay (Admin) ─────────────────────────────────────
// Admin marks a withdrawal as PAID (money was sent)
const markPaid = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const request = await prisma.withdrawRequest.findUnique({
      where:   { id },
      include: { user: { select: { username: true } } },
    })
    if (!request)                    return res.status(404).json({ message: 'Request not found' })
    if (request.status === 'PAID')   return res.status(400).json({ message: 'Already marked as paid' })
    if (request.status === 'REJECTED') return res.status(400).json({ message: 'Cannot pay a rejected request' })

    await prisma.withdrawRequest.update({
      where: { id },
      data:  { status: 'PAID' },
    })

    res.json({ message: `✓ ₹${request.amount} withdrawal marked as paid for ${request.user.username}` })
  } catch (err) {
    console.error('markPaid error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/withdraw/admin/reject (Admin) ──────────────────────────────────
// Admin rejects withdrawal — Gollars refunded to player
const rejectRequest = async (req, res) => {
  try {
    const id   = Number(req.params.id)
    const note = (req.body.note || 'Rejected by admin').trim()

    const request = await prisma.withdrawRequest.findUnique({
      where:   { id },
      include: { user: { select: { username: true } } },
    })
    if (!request)                       return res.status(404).json({ message: 'Request not found' })
    if (request.status !== 'PENDING')   return res.status(400).json({ message: 'Can only reject pending requests' })

    // Refund Gollars back to player
    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.userId },
        data:  { gollers: { increment: request.amount }, totalSpent: { decrement: request.amount } },
      }),
      prisma.withdrawRequest.update({
        where: { id },
        data:  { status: 'REJECTED', note },
      }),
    ])

    res.json({ message: `Rejected. 🪙 ${request.amount} Gollars refunded to ${request.user.username}.` })
  } catch (err) {
    console.error('rejectRequest error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { requestWithdraw, getMyRequests, getAllRequests, markPaid, rejectRequest }
