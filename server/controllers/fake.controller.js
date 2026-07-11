// controllers/fake.controller.js
// Admin-only: populate tournaments with realistic fake Indian player accounts
// Fake players are real DB users so they show in registered list, leaderboard etc.

const prisma = require('../config/db')
const bcrypt = require('bcryptjs')

// ── Pool of realistic Indian gaming usernames ─────────────────────────────────
const FAKE_PLAYERS = [
  // BGMI / Free Fire style names
  { username: 'PhantomKiller',  avatar: 'PK', wins: 12, coins: 8400,  gollers: 200 },
  { username: 'StormBreakerX',  avatar: 'SB', wins: 8,  coins: 5200,  gollers: 150 },
  { username: 'NightHunter99',  avatar: 'NH', wins: 15, coins: 11000, gollers: 300 },
  { username: 'ViperElite',     avatar: 'VE', wins: 6,  coins: 3800,  gollers: 100 },
  { username: 'BloodRaiderXX',  avatar: 'BR', wins: 20, coins: 16500, gollers: 500 },
  { username: 'ShadowSniper',   avatar: 'SS', wins: 9,  coins: 6200,  gollers: 180 },
  { username: 'CrazyGunner47',  avatar: 'CG', wins: 4,  coins: 2900,  gollers: 80  },
  { username: 'RapidFireOG',    avatar: 'RF', wins: 17, coins: 13400, gollers: 400 },
  { username: 'DeadEyeKing',    avatar: 'DK', wins: 11, coins: 7800,  gollers: 220 },
  { username: 'ToxicProXD',     avatar: 'TP', wins: 3,  coins: 1800,  gollers: 50  },
  { username: 'GhostSlayer',    avatar: 'GS', wins: 22, coins: 18900, gollers: 600 },
  { username: 'AceKillerOP',    avatar: 'AK', wins: 7,  coins: 4600,  gollers: 130 },
  { username: 'IronWolf007',    avatar: 'IW', wins: 13, coins: 9200,  gollers: 260 },
  { username: 'FireStormYT',    avatar: 'FS', wins: 5,  coins: 3200,  gollers: 90  },
  { username: 'LegendKillerR',  avatar: 'LK', wins: 28, coins: 24000, gollers: 800 },
  { username: 'ProHeadshotX',   avatar: 'PH', wins: 10, coins: 7100,  gollers: 200 },
  { username: 'DarkAssassin',   avatar: 'DA', wins: 16, coins: 12600, gollers: 350 },
  { username: 'UltimateRaider', avatar: 'UR', wins: 2,  coins: 1200,  gollers: 40  },
  { username: 'EliteWarrior69', avatar: 'EW', wins: 19, coins: 15800, gollers: 480 },
  { username: 'SpeedDemon01',   avatar: 'SD', wins: 8,  coins: 5600,  gollers: 160 },
  { username: 'XxProGamerxX',   avatar: 'XP', wins: 14, coins: 10400, gollers: 290 },
  { username: 'MythicHunter',   avatar: 'MH', wins: 6,  coins: 4100,  gollers: 110 },
  { username: 'ClutchKingOG',   avatar: 'CK', wins: 25, coins: 21000, gollers: 700 },
  { username: 'NoScopeGod',     avatar: 'NS', wins: 3,  coins: 2100,  gollers: 60  },
  { username: 'PubgLegendary',  avatar: 'PL', wins: 18, coins: 14200, gollers: 420 },
  { username: 'FreeFire_Beast', avatar: 'FF', wins: 11, coins: 7900,  gollers: 230 },
  { username: 'ValorantPro99',  avatar: 'VP', wins: 9,  coins: 6500,  gollers: 190 },
  { username: 'BattleKingXYZ',  avatar: 'BK', wins: 7,  coins: 4900,  gollers: 140 },
  { username: 'OneShot_OP',     avatar: 'OS', wins: 21, coins: 17600, gollers: 560 },
  { username: 'HeadshotMaster', avatar: 'HM', wins: 13, coins: 9800,  gollers: 280 },
  { username: 'AlphaWolff',     avatar: 'AW', wins: 5,  coins: 3500,  gollers: 100 },
  { username: 'BetaKillerz',    avatar: 'BK', wins: 16, coins: 12100, gollers: 340 },
  { username: 'GammaSniper',    avatar: 'GM', wins: 4,  coins: 2600,  gollers: 70  },
  { username: 'DeltaForceXX',   avatar: 'DF', wins: 23, coins: 19500, gollers: 640 },
  { username: 'CobaltRushOP',   avatar: 'CR', wins: 8,  coins: 5900,  gollers: 170 },
  { username: 'QuantumBeast',   avatar: 'QB', wins: 12, coins: 8800,  gollers: 240 },
  { username: 'NeonKillerYT',   avatar: 'NK', wins: 6,  coins: 4300,  gollers: 120 },
  { username: 'ZeroGravityX',   avatar: 'ZG', wins: 19, coins: 15200, gollers: 460 },
  { username: 'HyperSlasher',   avatar: 'HS', wins: 10, coins: 7300,  gollers: 210 },
  { username: 'SuperNovaGG',    avatar: 'SN', wins: 27, coins: 23100, gollers: 760 },
]

// Game-specific fake in-game IDs
const GAME_IDS = {
  'BGMI':         () => `BGM${Math.floor(10000000 + Math.random()*90000000)}`,
  'Free Fire':    () => `FF${Math.floor(100000000 + Math.random()*900000000)}`,
  'COD Mobile':   () => `COD_${Math.floor(1000000 + Math.random()*9000000)}`,
  'Valorant':     () => `VAL#${Math.floor(1000 + Math.random()*9000)}`,
  'PUBG':         () => `PUBG${Math.floor(10000000 + Math.random()*90000000)}`,
  'CS2':          () => `STEAM_${Math.floor(100000 + Math.random()*900000)}`,
  'Fortnite':     () => `FN_${Math.floor(10000 + Math.random()*90000)}`,
  'Clash Royale': () => `#${Math.random().toString(36).substr(2,8).toUpperCase()}`,
}

// ── POST /api/fake/fill-tournament ────────────────────────────────────────────
// Registers N fake players into a tournament
// body: { tournamentId, count }
const fillTournamentWithFakePlayers = async (req, res) => {
  try {
    const { tournamentId, count = 10 } = req.body
    const fillCount = Math.min(Number(count) || 10, 40) // max 40 fake per request

    const tournament = await prisma.tournament.findUnique({
      where:   { id: Number(tournamentId) },
      include: { _count: { select: { registrations: true } } },
    })

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })

    const slotsLeft   = tournament.maxPlayers - tournament._count.registrations
    const actualFill  = Math.min(fillCount, slotsLeft)
    if (actualFill <= 0) return res.status(400).json({ message: 'Tournament is full' })

    const fakeHash = await bcrypt.hash('fake_player_ghq_2026', 10)
    const getGameId = GAME_IDS[tournament.game] || (() => `GHQ${Math.floor(100000 + Math.random()*900000)}`)

    // Shuffle the pool so we get different players each time
    const shuffled   = [...FAKE_PLAYERS].sort(() => Math.random() - 0.5)
    const toRegister = shuffled.slice(0, actualFill)

    let registered = 0
    const createdUsernames = []

    for (const p of toRegister) {
      // Make username unique by appending a random suffix if needed
      let username   = p.username
      let suffix     = 0
      while (await prisma.user.findUnique({ where: { username } })) {
        suffix++
        username = `${p.username}${suffix}`
      }

      const email = `fake_${username.toLowerCase()}_${Date.now()}@ghq.internal`

      // Create fake user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: fakeHash,
          avatar:       p.avatar,
          wins:         p.wins,
          coins:        p.coins,
          totalEarned:  p.coins,
          gollers:      p.gollers,
          totalBought:  p.gollers,
          isActive:     true,
        },
      })

      // Add game profile with fake in-game ID
      await prisma.userGameProfile.create({
        data: {
          userId:    user.id,
          game:      tournament.game,
          platform:  tournament.platform,
          gameUserId: getGameId(),
          isPrimary: true,
        },
      })

      // Register into tournament (free OR deduct gollars for paid)
      const gollersPaid = tournament.mode === 'PAID' ? (tournament.entryFee || 0) : 0

      await prisma.registration.create({
        data: { userId: user.id, tournamentId: tournament.id, gollersPaid },
      })

      createdUsernames.push(username)
      registered++
    }

    res.json({
      success: true,
      message: `✓ ${registered} fake player${registered !== 1 ? 's' : ''} added to "${tournament.name}"`,
      players: createdUsernames,
      registered,
    })
  } catch (err) {
    console.error('fillTournament error:', err)
    res.status(500).json({ message: err.message })
  }
}

// ── DELETE /api/fake/clean-tournament ─────────────────────────────────────────
// Remove all fake players (emails ending in @ghq.internal) from a tournament
const cleanFakePlayers = async (req, res) => {
  try {
    const { tournamentId } = req.body

    // Find all registrations for this tournament where user is fake
    const fakeRegs = await prisma.registration.findMany({
      where: { tournamentId: Number(tournamentId) },
      include: { user: { select: { id: true, email: true } } },
    })

    const fakeOnes = fakeRegs.filter(r => r.user.email.endsWith('@ghq.internal'))

    for (const reg of fakeOnes) {
      await prisma.registration.delete({ where: { id: reg.id } })
      // Also delete the fake user entirely
      await prisma.userGameProfile.deleteMany({ where: { userId: reg.user.id } })
      await prisma.user.delete({ where: { id: reg.user.id } })
    }

    res.json({
      success: true,
      message: `✓ Removed ${fakeOnes.length} fake player${fakeOnes.length !== 1 ? 's' : ''}`,
      removed: fakeOnes.length,
    })
  } catch (err) {
    console.error('cleanFakePlayers error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { fillTournamentWithFakePlayers, cleanFakePlayers }
