// controllers/ad.controller.js
const prisma = require('../config/db')

// ── GET /api/ads (public) ─────────────────────────────────────────────────────
// Returns active ads — players see these in banners & sidebar
const getActiveAds = async (req, res) => {
  try {
    const { placement } = req.query
    const ads = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        ...(placement ? { placement } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ ads })
  } catch (err) {
    console.error('getActiveAds error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/ads/gate/:tournamentId (public) ──────────────────────────────────
// Returns N random active ads for a tournament's ad gate
// N = tournament.adsRequired
const getGateAds = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId)
    const tournament = await prisma.tournament.findUnique({
      where:  { id: tournamentId },
      select: { adsRequired: true, mode: true, name: true },
    })

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
    if (tournament.mode !== 'FREE') return res.status(400).json({ message: 'Paid tournaments do not have ad gates' })

    const count = tournament.adsRequired || 0
    if (count === 0) return res.json({ ads: [], adsRequired: 0 })

    // Get all active gate ads
    const allAds = await prisma.advertisement.findMany({
      where:   { isActive: true, placement: { in: ['tournament_gate', 'general'] } },
      orderBy: { createdAt: 'desc' },
    })

    // If not enough ads, cycle/repeat them
    const gateAds = []
    for (let i = 0; i < count; i++) {
      if (allAds.length === 0) break
      gateAds.push(allAds[i % allAds.length])
    }

    res.json({ ads: gateAds, adsRequired: count, tournamentName: tournament.name })
  } catch (err) {
    console.error('getGateAds error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/ads/admin/all (Admin) ────────────────────────────────────────────
const getAllAds = async (req, res) => {
  try {
    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ ads })
  } catch (err) {
    console.error('getAllAds error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/ads/admin (Admin) ───────────────────────────────────────────────
const createAd = async (req, res) => {
  try {
    const { title, description = '', imageUrl, linkUrl = '', placement = 'general', viewSeconds = 5 } = req.body
    if (!title || !imageUrl) return res.status(400).json({ message: 'Title and image URL are required' })

    const ad = await prisma.advertisement.create({
      data: {
        title, description, imageUrl, linkUrl,
        placement,
        viewSeconds: Number(viewSeconds) || 5,
      },
    })
    res.status(201).json({ message: 'Ad created!', ad })
  } catch (err) {
    console.error('createAd error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/ads/admin/:id (Admin) ────────────────────────────────────────────
const updateAd = async (req, res) => {
  try {
    const { id } = req.params
    const { viewSeconds, ...rest } = req.body
    const ad = await prisma.advertisement.update({
      where: { id: Number(id) },
      data:  { ...rest, ...(viewSeconds !== undefined && { viewSeconds: Number(viewSeconds) }) },
    })
    res.json({ message: 'Ad updated', ad })
  } catch (err) {
    console.error('updateAd error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── DELETE /api/ads/admin/:id (Admin) ─────────────────────────────────────────
const deleteAd = async (req, res) => {
  try {
    await prisma.advertisement.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Ad deleted' })
  } catch (err) {
    console.error('deleteAd error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getActiveAds, getGateAds, getAllAds, createAd, updateAd, deleteAd }
