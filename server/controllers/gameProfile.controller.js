// controllers/gameProfile.controller.js
// Handles per-game profile management for players
// Each player can add multiple games with separate IDs, ranks, and stats

const prisma = require('../config/db')

// Supported games catalogue — single source of truth
const SUPPORTED_GAMES = [
  { name: 'BGMI',       platform: 'Mobile', icon: '🔫' },
  { name: 'Free Fire',  platform: 'Mobile', icon: '🔥' },
  { name: 'COD Mobile', platform: 'Mobile', icon: '💥' },
  { name: 'Clash Royale',platform:'Mobile', icon: '👑' },
  { name: 'Valorant',   platform: 'PC',     icon: '🎯' },
  { name: 'CS2',        platform: 'PC',     icon: '🔵' },
  { name: 'PUBG',       platform: 'PC',     icon: '🪖' },
  { name: 'Fortnite',   platform: 'PC',     icon: '🏗️' },
]

// ── GET /api/games/supported ──────────────────────────────────────────────────
// Returns list of all games GHQ supports
const getSupportedGames = (req, res) => {
  res.json({ games: SUPPORTED_GAMES })
}

// ── GET /api/games/my-profiles ───────────────────────────────────────────────
// Returns all game profiles for the logged-in player
const getMyGameProfiles = async (req, res) => {
  try {
    const profiles = await prisma.userGameProfile.findMany({
      where:   { userId: req.user.id },
      orderBy: [
        { isPrimary: 'desc' }, // primary game comes first
        { createdAt: 'asc'  },
      ],
    })
    res.json({ profiles })
  } catch (err) {
    console.error('getMyGameProfiles error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/games/profiles/:userId ──────────────────────────────────────────
// Returns all game profiles for ANY player (public — for viewing other profiles)
const getUserGameProfiles = async (req, res) => {
  try {
    const profiles = await prisma.userGameProfile.findMany({
      where:   { userId: Number(req.params.userId) },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })
    res.json({ profiles })
  } catch (err) {
    console.error('getUserGameProfiles error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── POST /api/games/my-profiles ───────────────────────────────────────────────
// Add a new game to the player's profile
const addGameProfile = async (req, res) => {
  try {
    const { game, platform, gameUserId = '', rank = '', isPrimary = false } = req.body
    const userId = req.user.id

    // Validate game is supported
    const supported = SUPPORTED_GAMES.find(g => g.name === game)
    if (!supported) {
      return res.status(400).json({
        message: `"${game}" is not a supported game`,
        supported: SUPPORTED_GAMES.map(g => g.name),
      })
    }

    // Check if player already added this game
    const existing = await prisma.userGameProfile.findUnique({
      where: { userId_game: { userId, game } },
    })
    if (existing) {
      return res.status(400).json({ message: `You already have ${game} in your profile` })
    }

    // If this is set as primary, unset all other primaries first
    if (isPrimary) {
      await prisma.userGameProfile.updateMany({
        where: { userId },
        data:  { isPrimary: false },
      })
    }

    // If this is the player's first game, make it primary automatically
    const existingCount = await prisma.userGameProfile.count({ where: { userId } })
    const shouldBePrimary = isPrimary || existingCount === 0

    const profile = await prisma.userGameProfile.create({
      data: {
        userId,
        game,
        platform: platform || supported.platform,
        gameUserId,
        rank,
        isPrimary: shouldBePrimary,
      },
    })

    res.status(201).json({
      message: `${game} added to your profile!`,
      profile,
    })
  } catch (err) {
    console.error('addGameProfile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── PUT /api/games/my-profiles/:game ─────────────────────────────────────────
// Update a game profile (in-game ID, rank, set as primary)
const updateGameProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const game   = req.params.game  // game name in URL e.g. /my-profiles/BGMI
    const { gameUserId, rank, isPrimary } = req.body

    const profile = await prisma.userGameProfile.findUnique({
      where: { userId_game: { userId, game } },
    })
    if (!profile) {
      return res.status(404).json({ message: `${game} not found in your profile` })
    }

    // If setting as primary, unset others first
    if (isPrimary) {
      await prisma.userGameProfile.updateMany({
        where: { userId },
        data:  { isPrimary: false },
      })
    }

    const updated = await prisma.userGameProfile.update({
      where: { userId_game: { userId, game } },
      data: {
        ...(gameUserId !== undefined && { gameUserId }),
        ...(rank       !== undefined && { rank       }),
        ...(isPrimary  !== undefined && { isPrimary  }),
      },
    })

    res.json({ message: `${game} profile updated`, profile: updated })
  } catch (err) {
    console.error('updateGameProfile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── DELETE /api/games/my-profiles/:game ──────────────────────────────────────
// Remove a game from the player's profile
const removeGameProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const game   = req.params.game

    const profile = await prisma.userGameProfile.findUnique({
      where: { userId_game: { userId, game } },
    })
    if (!profile) {
      return res.status(404).json({ message: `${game} not found in your profile` })
    }

    await prisma.userGameProfile.delete({
      where: { userId_game: { userId, game } },
    })

    // If we deleted the primary game, promote the next one
    if (profile.isPrimary) {
      const next = await prisma.userGameProfile.findFirst({
        where:   { userId },
        orderBy: { createdAt: 'asc' },
      })
      if (next) {
        await prisma.userGameProfile.update({
          where: { id: next.id },
          data:  { isPrimary: true },
        })
      }
    }

    res.json({ message: `${game} removed from your profile` })
  } catch (err) {
    console.error('removeGameProfile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/games/leaderboard/:game ─────────────────────────────────────────
// Per-game leaderboard — ranked by wins in that specific game
const getGameLeaderboard = async (req, res) => {
  try {
    const { game } = req.params
    const { limit = 50 } = req.query

    const profiles = await prisma.userGameProfile.findMany({
      where:   { game },
      orderBy: { wins: 'desc' },
      take:    Number(limit),
      include: {
        user: {
          select: { id: true, username: true, avatar: true, coins: true },
        },
      },
    })

    const ranked = profiles.map((p, i) => ({
      rank:         i + 1,
      username:     p.user.username,
      avatar:       p.user.avatar,
      userId:       p.user.id,
      game:         p.game,
      gameUserId:   p.gameUserId,
      inGameRank:   p.rank,
      wins:         p.wins,
      losses:       p.losses,
      tournamentsPlayed: p.tournamentsPlayed,
      coinsEarned:  p.coinsEarned,
      totalCoins:   p.user.coins,
    }))

    res.json({ game, leaderboard: ranked })
  } catch (err) {
    console.error('getGameLeaderboard error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ── GET /api/games/stats/summary ─────────────────────────────────────────────
// Returns per-game stats summary for the logged-in player
const getMyStatsSummary = async (req, res) => {
  try {
    const profiles = await prisma.userGameProfile.findMany({
      where: { userId: req.user.id },
    })

    const summary = profiles.map(p => ({
      game:             p.game,
      platform:         p.platform,
      gameUserId:       p.gameUserId,
      inGameRank:       p.rank,
      isPrimary:        p.isPrimary,
      wins:             p.wins,
      losses:           p.losses,
      winRate:          p.wins + p.losses > 0
                          ? Math.round((p.wins / (p.wins + p.losses)) * 100)
                          : 0,
      tournamentsPlayed: p.tournamentsPlayed,
      coinsEarned:      p.coinsEarned,
    }))

    // Overall totals across all games
    const totals = {
      totalWins:             summary.reduce((s, p) => s + p.wins, 0),
      totalLosses:           summary.reduce((s, p) => s + p.losses, 0),
      totalTournamentsPlayed:summary.reduce((s, p) => s + p.tournamentsPlayed, 0),
      totalCoinsFromGames:   summary.reduce((s, p) => s + p.coinsEarned, 0),
      gamesPlayed:           summary.length,
    }

    res.json({ games: summary, totals })
  } catch (err) {
    console.error('getMyStatsSummary error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getSupportedGames,
  getMyGameProfiles,
  getUserGameProfiles,
  addGameProfile,
  updateGameProfile,
  removeGameProfile,
  getGameLeaderboard,
  getMyStatsSummary,
}
