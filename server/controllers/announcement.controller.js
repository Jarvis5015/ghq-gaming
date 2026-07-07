// controllers/announcement.controller.js
const prisma = require('../config/db')

// ── GET /api/announcements — public ──────────────────────────────────────────
// Returns all active, non-expired announcements
// Pinned ones first, then newest first
const getAnnouncements = async (req, res) => {
  try {
    const now = new Date()
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { pinned:    'desc' },   // pinned first
        { createdAt: 'desc' },   // newest first
      ],
    })
    res.json({ announcements })
  } catch (err) {
    console.error('getAnnouncements error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/announcements/admin — admin ──────────────────────────────────────
// Returns ALL announcements including inactive/expired
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    res.json({ announcements })
  } catch (err) {
    console.error('getAllAnnouncements error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/announcements — admin ──────────────────────────────────────────
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'info', icon = '📢', pinned = false, expiresAt } = req.body

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

    const announcement = await prisma.announcement.create({
      data: {
        title:     title.trim(),
        message:   message.trim(),
        type,
        icon,
        pinned:    Boolean(pinned),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    res.status(201).json({ message: 'Announcement created!', announcement })
  } catch (err) {
    console.error('createAnnouncement error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/announcements/:id — admin ───────────────────────────────────────
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const { title, message, type, icon, pinned, isActive, expiresAt } = req.body

    const announcement = await prisma.announcement.update({
      where: { id: Number(id) },
      data:  {
        ...(title     !== undefined && { title:     title.trim()      }),
        ...(message   !== undefined && { message:   message.trim()    }),
        ...(type      !== undefined && { type                         }),
        ...(icon      !== undefined && { icon                         }),
        ...(pinned    !== undefined && { pinned:    Boolean(pinned)   }),
        ...(isActive  !== undefined && { isActive:  Boolean(isActive) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    })

    res.json({ message: 'Announcement updated!', announcement })
  } catch (err) {
    console.error('updateAnnouncement error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── DELETE /api/announcements/:id — admin ────────────────────────────────────
const deleteAnnouncement = async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Announcement deleted' })
  } catch (err) {
    console.error('deleteAnnouncement error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
}
