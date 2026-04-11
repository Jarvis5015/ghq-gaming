// scheduler.js — Auto-manages tournament status based on set dates
// Runs every 60 seconds. No external library needed — pure setInterval.
//
// Rules:
//   registrationStart  → status stays UPCOMING but registrationOpen becomes true
//   registrationEnd    → registration closed (players can no longer join)
//   startDate          → status becomes LIVE
//   tournamentEnd      → status becomes COMPLETED (only if not already manually completed)

const prisma = require('./config/db')

const log = (msg) => console.log(`[Scheduler ${new Date().toLocaleTimeString('en-IN')}] ${msg}`)

async function runScheduler() {
  try {
    const now = new Date()

    // ── 1. Open registration (registrationStart has passed, still UPCOMING) ──
    // Nothing to change in DB for this — the API/frontend checks registrationStart
    // to decide if "Join" button is enabled. No status change needed.

    // ── 2. Start tournaments (startDate passed, still UPCOMING) ──────────────
    const toStart = await prisma.tournament.findMany({
      where: {
        status:    'UPCOMING',
        startDate: { lte: now },
      },
      select: { id: true, name: true },
    })
    for (const t of toStart) {
      await prisma.tournament.update({
        where: { id: t.id },
        data:  { status: 'LIVE' },
      })
      log(`▶ LIVE: "${t.name}" (id ${t.id})`)
    }

    // ── 3. End tournaments (tournamentEnd has passed, still LIVE) ────────────
    const toEnd = await prisma.tournament.findMany({
      where: {
        status:        'LIVE',
        tournamentEnd: { lte: now, not: null },
      },
      select: { id: true, name: true },
    })
    for (const t of toEnd) {
      await prisma.tournament.update({
        where: { id: t.id },
        data:  { status: 'COMPLETED' },
      })
      log(`🏁 COMPLETED: "${t.name}" (id ${t.id})`)
    }

  } catch (err) {
    console.error('[Scheduler] Error:', err.message)
  }
}

function startScheduler() {
  log('Started — checking every 60s')
  runScheduler() // run immediately on boot
  setInterval(runScheduler, 60 * 1000) // then every minute
}

module.exports = { startScheduler }
