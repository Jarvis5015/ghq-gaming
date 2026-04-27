// scheduler.js — Auto-manages tournament status + cleanup
// Runs every 60 seconds. Pure setInterval, no external library.
//
// Rules:
//   startDate passed + UPCOMING    → set LIVE
//   tournamentEnd passed + LIVE    → set COMPLETED
//   COMPLETED/CANCELLED > 24 hours → delete permanently

const prisma = require('./config/db')

const log = (msg) => console.log(`[Scheduler ${new Date().toLocaleTimeString('en-IN')}] ${msg}`)

async function runScheduler() {
  try {
    const now = new Date()

    // ── 1. Start tournaments (startDate passed, still UPCOMING) ──────────────
    const toStart = await prisma.tournament.findMany({
      where: { status: 'UPCOMING', startDate: { lte: now } },
      select: { id: true, name: true },
    })
    for (const t of toStart) {
      await prisma.tournament.update({ where: { id: t.id }, data: { status: 'LIVE' } })
      log(`▶ LIVE: "${t.name}" (id ${t.id})`)
    }

    // ── 2. End tournaments (tournamentEnd passed, still LIVE) ─────────────────
    const toEnd = await prisma.tournament.findMany({
      where: { status: 'LIVE', tournamentEnd: { lte: now, not: null } },
      select: { id: true, name: true },
    })
    for (const t of toEnd) {
      await prisma.tournament.update({
        where: { id: t.id },
        data:  { status: 'COMPLETED', roomId: null, roomPassword: null },
      })
      log(`🏁 COMPLETED: "${t.name}" (id ${t.id})`)
    }

    // ── 3. Delete ended tournaments older than 24 hours ───────────────────────
    // Deletes COMPLETED and CANCELLED tournaments whose updatedAt is > 24h ago
    // Also deletes all related registrations, bracket matches (cascades)
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

    const toDelete = await prisma.tournament.findMany({
      where: {
        status:    { in: ['COMPLETED', 'CANCELLED'] },
        updatedAt: { lte: cutoff },
      },
      select: { id: true, name: true, status: true },
    })

    for (const t of toDelete) {
      // Delete related records first (in case DB doesn't cascade)
      await prisma.registration.deleteMany({   where: { tournamentId: t.id } })
      await prisma.bracketMatch.deleteMany({   where: { tournamentId: t.id } })
      await prisma.tournament.delete({         where: { id: t.id } })
      log(`🗑️  DELETED (${t.status} > 24h): "${t.name}" (id ${t.id})`)
    }

    if (toDelete.length > 0) {
      log(`🧹 Cleaned up ${toDelete.length} ended tournament${toDelete.length !== 1 ? 's' : ''}`)
    }

  } catch (err) {
    console.error('[Scheduler] Error:', err.message)
  }
}

function startScheduler() {
  log('Started — checking every 60s')
  runScheduler() // run immediately on boot
  setInterval(runScheduler, 60 * 1000)
}

module.exports = { startScheduler }
