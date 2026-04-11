// controllers/tournament.controller.js
const prisma = require('../config/db')

// ── GET /api/tournaments ──────────────────────────────────────────────────────
const getTournaments = async (req, res) => {
  try {
    const { type, mode, platform, status, game } = req.query

    const tournaments = await prisma.tournament.findMany({
      where: {
        // Hide DRAFT tournaments from players (show to admins via separate query)
        ...(req.user?.role !== 'ADMIN' ? { status: { not: 'DRAFT' } } : {}),
        ...(type     ? { type:     type.toUpperCase()   } : {}),
        ...(mode     ? { mode:     mode.toUpperCase()   } : {}),
        ...(status   ? { status:   status.toUpperCase() } : {}),
        ...(platform ? { platform: { contains: platform, mode: 'insensitive' } } : {}),
        ...(game     ? { game:     { contains: game,     mode: 'insensitive' } } : {}),
      },
      include: { _count: { select: { registrations: true } } },
      orderBy: [{ startDate: 'asc' }],
    })

    const formatted = tournaments.map(t => ({
      ...t,
      registeredPlayers: t._count.registrations,
      _count: undefined,
    }))

    res.json({ tournaments: formatted })
  } catch (error) {
    console.error('GetTournaments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/tournaments/:id ──────────────────────────────────────────────────
const getTournamentById = async (req, res) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where:   { id: Number(req.params.id) },
      include: {
        _count:         { select: { registrations: true } },
        bracketMatches: { orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }] },
        registrations:  {
          include: {
            user: {
              select: {
                id: true, username: true, avatar: true,
                gameProfiles: { select: { game: true, gameUserId: true, rank: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })

    const enrichedRegistrations = tournament.registrations.map(r => {
      const gameProfile = r.user.gameProfiles?.find(gp => gp.game === tournament.game)
      return {
        ...r,
        user: {
          id:         r.user.id,
          username:   r.user.username,
          avatar:     r.user.avatar,
          gameUserId: gameProfile?.gameUserId || null,
          inGameRank: gameProfile?.rank       || null,
        },
      }
    })

    res.json({
      tournament: {
        ...tournament,
        registeredPlayers: tournament._count.registrations,
        registrations:     enrichedRegistrations,
        _count: undefined,
      },
    })
  } catch (error) {
    console.error('GetTournamentById error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/tournaments ─────────────────────────────────────────────────────
const createTournament = async (req, res) => {
  try {
    const {
      name, game, platform, type, mode,
      entryFee = 0, prizePool = 0, coinReward = 100,
      maxPlayers = 64, description = '', rules = [],
      tags = [], organizer = 'GHQ Staff', region = 'India',
      startDate,
      registrationStart = null,
      registrationEnd   = null,
      tournamentEnd     = null,
      prizeTiers        = [],   // [{ placement: 1, gollars: 500 }, ...]
    } = req.body

    if (!name || !game || !platform || !type || !mode || !startDate) {
      return res.status(400).json({ message: 'Missing required fields: name, game, platform, type, mode, startDate' })
    }
    if (type.toUpperCase() === 'CHAMPIONS' && mode.toUpperCase() === 'FREE') {
      return res.status(400).json({ message: 'Champions tournaments must be Paid' })
    }

    const tournament = await prisma.tournament.create({
      data: {
        name, game, platform,
        type:       type.toUpperCase(),
        mode:       mode.toUpperCase(),
        entryFee:   Number(entryFee),
        prizePool:  Number(prizePool),
        coinReward: Number(coinReward),
        maxPlayers: Number(maxPlayers),
        description,
        rules:      Array.isArray(rules) ? rules : rules.split('\n').filter(Boolean),
        tags:       Array.isArray(tags)  ? tags  : tags.split(',').map(t => t.trim()).filter(Boolean),
        organizer,
        region,
        startDate:         new Date(startDate),
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd:   registrationEnd   ? new Date(registrationEnd)   : null,
        tournamentEnd:     tournamentEnd      ? new Date(tournamentEnd)     : null,
        prizeTiers:        Array.isArray(prizeTiers) ? prizeTiers : [],
      },
    })

    res.status(201).json({ message: 'Tournament created!', tournament })
  } catch (error) {
    console.error('CreateTournament error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/tournaments/:id ──────────────────────────────────────────────────
const updateTournament = async (req, res) => {
  try {
    const { id } = req.params
    const {
      status, registrationStart, registrationEnd,
      tournamentEnd, prizeTiers, startDate, ...rest
    } = req.body

    const tournament = await prisma.tournament.update({
      where: { id: Number(id) },
      data:  {
        ...(status            && { status: status.toUpperCase() }),
        ...(startDate         && { startDate: new Date(startDate) }),
        ...(registrationStart !== undefined && { registrationStart: registrationStart ? new Date(registrationStart) : null }),
        ...(registrationEnd   !== undefined && { registrationEnd:   registrationEnd   ? new Date(registrationEnd)   : null }),
        ...(tournamentEnd     !== undefined && { tournamentEnd:      tournamentEnd      ? new Date(tournamentEnd)     : null }),
        ...(prizeTiers        !== undefined && { prizeTiers }),
        ...rest,
      },
    })

    res.json({ message: 'Tournament updated', tournament })
  } catch (error) {
    console.error('UpdateTournament error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/tournaments/:id/announce-results ───────────────────────────────
// results: [{ userId, placement, coinsAwarded, gollarsAwarded }]
// Prize Gollars are credited directly to the winner's wallet (real spendable Gollars)
const announceResults = async (req, res) => {
  try {
    const tournamentId = Number(req.params.id)
    const { results }  = req.body

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'Provide results array' })
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
    if (tournament.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Results already announced' })
    }

    const ops = []

    for (const r of results) {
      const { userId, placement, coinsAwarded = 0, gollarsAwarded = 0 } = r

      ops.push(
        prisma.registration.updateMany({
          where: { userId: Number(userId), tournamentId },
          data:  { placement, coinsEarned: coinsAwarded, gollarsWon: gollarsAwarded, status: 'COMPLETED' },
        })
      )

      if (coinsAwarded > 0) {
        ops.push(
          prisma.user.update({
            where: { id: Number(userId) },
            data:  {
              coins:       { increment: coinsAwarded },
              totalEarned: { increment: coinsAwarded },
              ...(placement === 1 ? { wins: { increment: 1 } } : { losses: { increment: 1 } }),
            },
          })
        )
        ops.push(
          prisma.coinTransaction.create({
            data: {
              userId: Number(userId), type: 'EARN', amount: coinsAwarded,
              label: `${placement === 1 ? '🏆 Won' : placement === 2 ? '🥈 2nd' : placement === 3 ? '🥉 3rd' : `#${placement}`} — ${tournament.name}`,
              game: tournament.game,
            },
          })
        )
      }

      // Credit Gollars prize directly to wallet
      if (gollarsAwarded > 0) {
        ops.push(
          prisma.user.update({
            where: { id: Number(userId) },
            data:  {
              gollers:     { increment: gollarsAwarded },
              totalBought: { increment: gollarsAwarded }, // counts as "received"
            },
          })
        )
      }
    }

    ops.push(
      prisma.tournament.update({
        where: { id: tournamentId },
        data:  { status: 'COMPLETED' },
      })
    )

    await prisma.$transaction(ops)

    res.json({ message: `Results announced for ${tournament.name}!`, resultsCount: results.length })
  } catch (error) {
    console.error('AnnounceResults error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/tournaments/:id/bracket ─────────────────────────────────────────
const getBracket = async (req, res) => {
  try {
    const matches = await prisma.bracketMatch.findMany({
      where:   { tournamentId: Number(req.params.id) },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
    })
    const grouped = {}
    for (const m of matches) {
      if (!grouped[m.round]) grouped[m.round] = { name: m.roundName, matches: [] }
      grouped[m.round].matches.push({
        id: m.id,
        player1: { name: m.player1Name, score: m.player1Score },
        player2: { name: m.player2Name, score: m.player2Score },
        status:  m.status.toLowerCase(),
      })
    }
    res.json({ bracketData: { rounds: Object.values(grouped) } })
  } catch (error) {
    console.error('GetBracket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  announceResults,
  getBracket,
}
