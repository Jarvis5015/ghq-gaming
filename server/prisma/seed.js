// prisma/seed.js — GHQ Database seed v5
// Includes fake players auto-registered in tournaments with game IDs
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

// ── Fake players data ─────────────────────────────────────────────────────────
// These are fake "pro" players that make the platform look active
// Each has a realistic game ID and stats
const FAKE_PLAYERS = [
  { username: 'PhantomX',     email: 'phantom@ghq.gg',   coins: 48200, gollers: 500,  wins: 34, losses: 8,  avatar: 'PX', games: { BGMI: 'PhantomX_YT', 'Free Fire': 'PhantomXFF', Valorant: 'Phantom#2109' } },
  { username: 'StormRaider',  email: 'storm@ghq.gg',     coins: 41500, gollers: 300,  wins: 29, losses: 11, avatar: 'SR', games: { BGMI: 'St0rmRaider', 'COD Mobile': 'StormRaider99', CS2: 'StormR#4521' } },
  { username: 'NightFury',    email: 'night@ghq.gg',     coins: 38800, gollers: 1000, wins: 27, losses: 9,  avatar: 'NF', games: { BGMI: 'NightFury_Pro', 'Free Fire': 'NightFuryFF', Valorant: 'NightFury#8832' } },
  { username: 'VortexKing',   email: 'vortex@ghq.gg',    coins: 34200, gollers: 200,  wins: 23, losses: 14, avatar: 'VK', games: { BGMI: 'V0rtexKing', 'COD Mobile': 'VortexKing07', PUBG: 'VortexKing_PC' } },
  { username: 'ShadowByte',   email: 'shadow@ghq.gg',    coins: 31600, gollers: 750,  wins: 21, losses: 7,  avatar: 'SB', games: { BGMI: 'ShadowByte1', CS2: 'ShadowByte#6610', Valorant: 'Shadow#1337' } },
  { username: 'BladeRunner',  email: 'blade@ghq.gg',     coins: 29400, gollers: 400,  wins: 19, losses: 12, avatar: 'BR', games: { Valorant: 'BladeRun#5501', CS2: 'BladeRunner#9900', PUBG: 'BladeRunner_GG' } },
  { username: 'IronWolf',     email: 'iron@ghq.gg',      coins: 27800, gollers: 600,  wins: 18, losses: 10, avatar: 'IW', games: { BGMI: 'IronWolf_IND', 'Free Fire': 'IronWolfFF', 'COD Mobile': 'IronWolf88' } },
  { username: 'GhostSniper',  email: 'ghost@ghq.gg',     coins: 25500, gollers: 350,  wins: 16, losses: 8,  avatar: 'GS', games: { BGMI: 'Gh0stSniper', Valorant: 'Ghost#0420', CS2: 'GhostSniper#7723' } },
  { username: 'CyberNova',    email: 'cyber@ghq.gg',     coins: 23200, gollers: 450,  wins: 14, losses: 13, avatar: 'CN', games: { 'Free Fire': 'CyberNova01', 'COD Mobile': 'CyberN0va', BGMI: 'CyberNova_YT' } },
  { username: 'AceHunter',    email: 'ace@ghq.gg',       coins: 21800, gollers: 280,  wins: 13, losses: 9,  avatar: 'AH', games: { BGMI: 'AceHunterX', 'Free Fire': 'AceHunterFF', Valorant: 'AceHunt#3301' } },
  { username: 'TurboGamer',   email: 'turbo@ghq.gg',     coins: 19500, gollers: 320,  wins: 12, losses: 11, avatar: 'TG', games: { PUBG: 'TurboGamer_PC', CS2: 'Turbo#2244', Valorant: 'TurboG#8891' } },
  { username: 'Deadshot99',   email: 'dead@ghq.gg',      coins: 18200, gollers: 180,  wins: 11, losses: 7,  avatar: 'D9', games: { BGMI: 'Deadsh0t99', 'Free Fire': 'Deadshot99FF', 'COD Mobile': 'Deadshot_COD' } },
  { username: 'NeonKiller',   email: 'neon@ghq.gg',      coins: 16800, gollers: 220,  wins: 10, losses: 12, avatar: 'NK', games: { Valorant: 'NeonKill#4412', CS2: 'NeonKiller#0991', PUBG: 'NeonKiller_GG' } },
  { username: 'ZeroTwo',      email: 'zero@ghq.gg',      coins: 15500, gollers: 150,  wins: 9,  losses: 8,  avatar: 'Z2', games: { BGMI: 'ZeroTwo_IND', 'Free Fire': 'ZeroTwoFF', 'COD Mobile': 'ZeroTwo02' } },
  { username: 'ReaperX',      email: 'reaper@ghq.gg',    coins: 14200, gollers: 290,  wins: 8,  losses: 6,  avatar: 'RX', games: { BGMI: 'ReaperX_Pro', Valorant: 'ReaperX#7712', CS2: 'Reaper#5523' } },
  { username: 'FireStrike',   email: 'fire@ghq.gg',      coins: 12800, gollers: 170,  wins: 7,  losses: 9,  avatar: 'FS', games: { 'Free Fire': 'FireStrikeFF', 'COD Mobile': 'FireStrike07', BGMI: 'FireStrikeX' } },
  { username: 'UltraVisor',   email: 'ultra@ghq.gg',     coins: 11500, gollers: 130,  wins: 6,  losses: 7,  avatar: 'UV', games: { CS2: 'UltraVisor#3341', PUBG: 'UltraVisor_PC', Valorant: 'Ultra#6612' } },
  { username: 'DarkMatter',   email: 'dark@ghq.gg',      coins: 10200, gollers: 200,  wins: 5,  losses: 10, avatar: 'DM', games: { BGMI: 'DarkMatter_IN', 'Free Fire': 'DarkMatterFF', 'COD Mobile': 'DarkM4tter' } },
  { username: 'PixelWarrior', email: 'pixel@ghq.gg',     coins: 9100,  gollers: 100,  wins: 4,  losses: 8,  avatar: 'PW', games: { Valorant: 'Pixel#9901', CS2: 'PixelWarrior#4421', PUBG: 'PixelWarrior_GG' } },
  { username: 'SnipeGod',     email: 'snipe@ghq.gg',     coins: 8400,  gollers: 90,   wins: 3,  losses: 5,  avatar: 'SG', games: { BGMI: 'SnipeGod_YT', 'Free Fire': 'SnipeGodFF', 'COD Mobile': 'SnipeG0d' } },
]

// ── Which fake players join which tournaments ─────────────────────────────────
// Map: tournament name → array of player usernames who "joined"
const TOURNAMENT_REGISTRATIONS = {
  'VALORANT WINTER CLASH':     ['PhantomX', 'ShadowByte', 'BladeRunner', 'NightFury', 'NeonKiller', 'TurboGamer', 'UltraVisor', 'GhostSniper'],
  'BGMI CHAMPIONS CUP':        ['PhantomX', 'StormRaider', 'NightFury', 'IronWolf', 'GhostSniper', 'BladeRunner', 'CyberNova', 'AceHunter', 'ZeroTwo', 'ReaperX'],
  'FREE FIRE FRIDAY FIESTA':   ['NightFury', 'CyberNova', 'AceHunter', 'IronWolf', 'Deadshot99', 'ZeroTwo', 'FireStrike', 'DarkMatter', 'SnipeGod', 'PixelWarrior', 'PhantomX', 'StormRaider'],
  'CS2 MASTERS INVITATIONAL':  ['ShadowByte', 'BladeRunner', 'GhostSniper', 'NeonKiller', 'TurboGamer', 'UltraVisor'],
  'COD MOBILE OPEN':           ['StormRaider', 'VortexKing', 'IronWolf', 'Deadshot99', 'ZeroTwo', 'FireStrike', 'DarkMatter', 'SnipeGod', 'CyberNova', 'AceHunter'],
  'PUBG PC PRO LEAGUE':        ['VortexKing', 'TurboGamer', 'NeonKiller', 'UltraVisor', 'BladeRunner', 'PixelWarrior', 'ReaperX', 'GhostSniper'],
}

async function main() {
  console.log('🌱 Seeding GHQ database v5...')

  // ── Achievements ─────────────────────────────────────────────────────────────
  const achievementData = [
    { key: 'first_blood',        icon: '🏆', label: 'First Blood',        description: 'Win your first tournament',       coinReward: 500   },
    { key: 'ten_tournaments',    icon: '🎯', label: '10 Tournaments',      description: 'Enter 10 tournaments',            coinReward: 1000  },
    { key: 'win_streak_5',       icon: '⚡', label: 'Win Streak x5',       description: 'Win 5 tournaments in a row',      coinReward: 2000  },
    { key: 'top_10_rank',        icon: '👑', label: 'Top 10 Rank',         description: 'Reach global top 10',            coinReward: 3000  },
    { key: 'champions_finalist', icon: '💎', label: 'Champions Finalist',  description: 'Reach a Champions bracket final', coinReward: 5000  },
    { key: 'on_fire',            icon: '🔥', label: 'On Fire',             description: 'Win 3 tournaments in one week',   coinReward: 1500  },
    { key: 'legend',             icon: '🌟', label: 'Legend',              description: 'Earn 50,000 GHQ Coins total',     coinReward: 10000 },
    { key: 'multi_platform',     icon: '🎮', label: 'Multi-Platform',      description: 'Win on both PC & Mobile',         coinReward: 750   },
  ]
  for (const a of achievementData) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a })
  }
  console.log('✅ Achievements seeded')

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where:  { email: 'admin@ghq.gg' },
    update: {},
    create: {
      username: 'GHQAdmin', email: 'admin@ghq.gg',
      passwordHash: adminHash, avatar: 'GA', role: 'ADMIN',
      gollers: 99999, totalBought: 99999, coins: 999999, totalEarned: 999999,
    },
  })
  console.log('✅ Admin seeded  →  admin@ghq.gg / admin123')

  // ── Fake players ──────────────────────────────────────────────────────────────
  const playerHash = await bcrypt.hash('player123', 12)
  const createdPlayers = {}

  for (const p of FAKE_PLAYERS) {
    const user = await prisma.user.upsert({
      where:  { email: p.email },
      update: {
        coins:       p.coins,
        totalEarned: p.coins,
        gollers:     p.gollers,
        totalBought: p.gollers,
        wins:        p.wins,
        losses:      p.losses,
      },
      create: {
        username:     p.username,
        email:        p.email,
        passwordHash: playerHash,
        avatar:       p.avatar,
        gollers:      p.gollers,
        totalBought:  p.gollers,
        coins:        p.coins,
        totalEarned:  p.coins,
        wins:         p.wins,
        losses:       p.losses,
      },
    })
    createdPlayers[p.username] = user

    // Add game profiles for this player
    for (const [game, gameUserId] of Object.entries(p.games)) {
      const platform = ['BGMI', 'Free Fire', 'COD Mobile', 'Clash Royale'].includes(game) ? 'Mobile' : 'PC'
      const ranks    = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ace', 'Conqueror']
      const rank     = ranks[Math.floor(Math.random() * ranks.length)]

      await prisma.userGameProfile.upsert({
        where:  { userId_game: { userId: user.id, game } },
        update: { gameUserId, rank },
        create: {
          userId: user.id,
          game,
          platform,
          gameUserId,
          rank,
          isPrimary: false,
          wins:      Math.floor(p.wins * 0.6),
          losses:    Math.floor(p.losses * 0.6),
          tournamentsPlayed: p.wins + Math.floor(p.losses * 0.5),
          gollersSpent: Math.floor(p.gollers * 0.4),
        },
      }).catch(() => {})
    }
  }
  console.log(`✅ ${FAKE_PLAYERS.length} fake players seeded  →  password: player123`)

  // ── Tournaments ───────────────────────────────────────────────────────────────
  const now    = new Date()
  const future = (days, hours = 18) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    d.setHours(hours, 0, 0, 0)
    return d
  }

  const tournamentsData = [
    {
      name: 'VALORANT WINTER CLASH',
      game: 'Valorant', platform: 'PC',
      type: 'TOURNAMENT', mode: 'PAID', status: 'LIVE',
      entryFee: 50, prizePool: 5000, coinReward: 800, maxPlayers: 64,
      teamSize: '5v5',
      description: 'The premier VALORANT tournament on GHQ. 5v5 competitive format. Prove you\'re the best.',
      rules: ['Teams of 5', 'Standard competitive rules', 'No exploits or bugs', 'Disputes must be raised within 10 minutes'],
      tags: ['5v5', 'Competitive', 'PC'],
      startDate: future(-1),
      prizeTiers: [
        { placement: 1, gollars: 200, coins: 2000 },
        { placement: 2, gollars: 100, coins: 1000 },
        { placement: 3, gollars: 50,  coins: 500  },
      ],
    },
    {
      name: 'BGMI CHAMPIONS CUP',
      game: 'BGMI', platform: 'Mobile',
      type: 'CHAMPIONS', mode: 'PAID', status: 'UPCOMING',
      entryFee: 100, prizePool: 20000, coinReward: 3000, maxPlayers: 32,
      teamSize: 'Squad',
      description: 'Elite bracket tournament for the best BGMI squads in India. ₹20,000 prize pool!',
      rules: ['Squad of 4', 'Custom room format', 'Single elimination bracket', 'All India players welcome'],
      tags: ['Battle Royale', 'Bracket', 'Champions'],
      startDate: future(5),
      prizeTiers: [
        { placement: 1, gollars: 500, coins: 8000 },
        { placement: 2, gollars: 250, coins: 4000 },
        { placement: 3, gollars: 100, coins: 2000 },
      ],
    },
    {
      name: 'FREE FIRE FRIDAY FIESTA',
      game: 'Free Fire', platform: 'Mobile',
      type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING',
      entryFee: 0, prizePool: 1000, coinReward: 400, maxPlayers: 128,
      teamSize: 'Solo',
      adsRequired: 2,
      description: 'Weekly free tournament. Earn GHQ Coins without spending Gollars. Open to everyone!',
      rules: ['Solo format', 'Custom lobby', 'No teaming allowed', 'Top 10 finishes earn coins'],
      tags: ['Battle Royale', 'Free Entry', 'Weekly'],
      startDate: future(2),
      prizeTiers: [
        { placement: 1, gollars: 0, coins: 1000 },
        { placement: 2, gollars: 0, coins: 500  },
        { placement: 3, gollars: 0, coins: 250  },
      ],
    },
    {
      name: 'CS2 MASTERS INVITATIONAL',
      game: 'CS2', platform: 'PC',
      type: 'CHAMPIONS', mode: 'PAID', status: 'UPCOMING',
      entryFee: 200, prizePool: 50000, coinReward: 8000, maxPlayers: 16,
      teamSize: '5v5',
      description: 'The biggest CS2 tournament on GHQ. 16 of India\'s best teams battle for ₹50,000.',
      rules: ['Team of 5', 'MR12 format', 'Double elimination', 'Official valve servers'],
      tags: ['FPS', 'Bracket', 'Elite', 'PC'],
      startDate: future(10),
      prizeTiers: [
        { placement: 1, gollars: 1000, coins: 20000 },
        { placement: 2, gollars: 500,  coins: 10000 },
        { placement: 3, gollars: 200,  coins: 5000  },
      ],
    },
    {
      name: 'COD MOBILE OPEN',
      game: 'COD Mobile', platform: 'Mobile',
      type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING',
      entryFee: 0, prizePool: 2000, coinReward: 500, maxPlayers: 64,
      teamSize: '5v5',
      adsRequired: 3,
      description: 'Free entry COD Mobile tournament. Watch 3 ads to unlock your slot. Great for new players!',
      rules: ['5v5 Multiplayer', 'Standard ranked rules', 'Hardpoint mode'],
      tags: ['FPS', 'Free Entry', 'Mobile'],
      startDate: future(3),
      prizeTiers: [
        { placement: 1, gollars: 0, coins: 1500 },
        { placement: 2, gollars: 0, coins: 750  },
        { placement: 3, gollars: 0, coins: 300  },
      ],
    },
    {
      name: 'PUBG PC PRO LEAGUE',
      game: 'PUBG', platform: 'PC',
      type: 'TOURNAMENT', mode: 'PAID', status: 'LIVE',
      entryFee: 75, prizePool: 8000, coinReward: 1200, maxPlayers: 100,
      teamSize: 'Squad',
      description: 'PUBG PC league format. Multiple rounds with ranking points. Top squads share ₹8,000.',
      rules: ['Squad of 4', '3 matches per session', 'Top 10 squads advance', 'Points based ranking'],
      tags: ['Battle Royale', 'PC', 'League'],
      startDate: future(-1, 15),
      prizeTiers: [
        { placement: 1, gollars: 300, coins: 3000 },
        { placement: 2, gollars: 150, coins: 1500 },
        { placement: 3, gollars: 75,  coins: 750  },
      ],
    },
  ]

  const tournamentMap = {}
  for (let i = 0; i < tournamentsData.length; i++) {
    const t = tournamentsData[i]
    // Delete existing and recreate so data is fresh
    const existing = await prisma.tournament.findFirst({ where: { name: t.name } })
    if (existing) {
      tournamentMap[t.name] = existing
    } else {
      const created = await prisma.tournament.create({ data: { ...t, prizeTiers: t.prizeTiers || [] } })
      tournamentMap[t.name] = created
    }
  }
  console.log('✅ Tournaments seeded')

  // ── Register fake players in tournaments ──────────────────────────────────────
  let regCount = 0
  for (const [tournamentName, playerUsernames] of Object.entries(TOURNAMENT_REGISTRATIONS)) {
    const tournament = tournamentMap[tournamentName]
    if (!tournament) continue

    for (const username of playerUsernames) {
      const user = createdPlayers[username]
      if (!user) continue

      // Check if already registered
      const existing = await prisma.registration.findUnique({
        where: { userId_tournamentId: { userId: user.id, tournamentId: tournament.id } },
      })
      if (existing) continue

      await prisma.registration.create({
        data: {
          userId:      user.id,
          tournamentId: tournament.id,
          gollersPaid:  tournament.mode === 'PAID' ? tournament.entryFee : 0,
          status:       'REGISTERED',
        },
      })
      regCount++

      // Deduct Gollars for paid tournaments (simulate payment)
      if (tournament.mode === 'PAID' && tournament.entryFee > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data:  {
            gollers:    { decrement: tournament.entryFee },
            totalSpent: { increment: tournament.entryFee },
          },
        }).catch(() => {}) // ignore if balance goes negative (it's fake anyway)
      }
    }
  }
  console.log(`✅ ${regCount} tournament registrations created`)

  // ── Bracket for BGMI Champions Cup ───────────────────────────────────────────
  const bgmiT = tournamentMap['BGMI CHAMPIONS CUP']
  if (bgmiT) {
    // Clear old brackets first
    await prisma.bracketMatch.deleteMany({ where: { tournamentId: bgmiT.id } }).catch(() => {})
    const matches = [
      { round: 1, roundName: 'Quarter Finals', matchNumber: 1, player1Name: 'PhantomX',    player2Name: 'CyberNova',   player1Score: 3, player2Score: 1, status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 2, player1Name: 'StormRaider', player2Name: 'AceHunter',   player1Score: 3, player2Score: 2, status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 3, player1Name: 'NightFury',   player2Name: 'ZeroTwo',     player1Score: 3, player2Score: 0, status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 4, player1Name: 'IronWolf',    player2Name: 'GhostSniper', player1Score: 2, player2Score: 3, status: 'DONE'     },
      { round: 2, roundName: 'Semi Finals',    matchNumber: 1, player1Name: 'PhantomX',    player2Name: 'StormRaider', player1Score: null, player2Score: null, status: 'LIVE'     },
      { round: 2, roundName: 'Semi Finals',    matchNumber: 2, player1Name: 'NightFury',   player2Name: 'GhostSniper', player1Score: null, player2Score: null, status: 'UPCOMING' },
      { round: 3, roundName: 'Grand Final',    matchNumber: 1, player1Name: 'TBD',         player2Name: 'TBD',         player1Score: null, player2Score: null, status: 'UPCOMING' },
    ]
    for (const m of matches) {
      await prisma.bracketMatch.create({ data: { ...m, tournamentId: bgmiT.id } }).catch(() => {})
    }
    console.log('✅ Bracket seeded for BGMI Champions Cup')
  }

  console.log('\n🎮 GHQ database ready!\n')
  console.log('─────────────────────────────────────────────────')
  console.log('  Admin   →  admin@ghq.gg     /  admin123')
  console.log('  Players →  phantom@ghq.gg   /  player123')
  console.log('            (all fake players use player123)')
  console.log('─────────────────────────────────────────────────')
  console.log(`  Fake Players: ${FAKE_PLAYERS.length}`)
  console.log(`  Tournaments:  ${tournamentsData.length}`)
  console.log(`  Registrations: ${regCount}`)
  console.log('─────────────────────────────────────────────────\n')
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
