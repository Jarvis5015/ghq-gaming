// prisma/seed.js — GHQ Database seed v4 (Gollers system)
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding GHQ database...')

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
    await prisma.achievement.upsert({
      where:  { key: a.key },
      update: {},
      create: a,
    })
  }
  console.log('✅ Achievements seeded')

  // ── Admin user ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where:  { email: 'admin@ghq.gg' },
    update: {},
    create: {
      username:     'GHQAdmin',
      email:        'admin@ghq.gg',
      passwordHash: adminHash,
      avatar:       'GA',
      role:         'ADMIN',
      gollers:      99999,
      totalBought:  99999,
      coins:        999999,
      totalEarned:  999999,
    },
  })
  console.log('✅ Admin seeded  →  admin@ghq.gg / admin123')

  // ── Sample players ────────────────────────────────────────────────────────────
  const players = [
    { username: 'PhantomX',    email: 'phantom@ghq.gg',  coins: 48200, gollers: 500,  wins: 34, avatar: 'PX' },
    { username: 'StormRaider', email: 'storm@ghq.gg',    coins: 41500, gollers: 300,  wins: 29, avatar: 'SR' },
    { username: 'NightFury',   email: 'night@ghq.gg',    coins: 38800, gollers: 1000, wins: 27, avatar: 'NF' },
    { username: 'VortexKing',  email: 'vortex@ghq.gg',   coins: 34200, gollers: 200,  wins: 23, avatar: 'VK' },
    { username: 'ShadowByte',  email: 'shadow@ghq.gg',   coins: 31600, gollers: 750,  wins: 21, avatar: 'SB' },
  ]
  for (const p of players) {
    const hash = await bcrypt.hash('player123', 12)
    await prisma.user.upsert({
      where:  { email: p.email },
      update: {},
      create: {
        username:     p.username,
        email:        p.email,
        passwordHash: hash,
        avatar:       p.avatar,
        gollers:      p.gollers,
        totalBought:  p.gollers,
        coins:        p.coins,
        totalEarned:  p.coins,
        wins:         p.wins,
      },
    })
  }
  console.log('✅ Players seeded  →  password: player123')

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
      entryFee: 50,   // 50 Gollers entry
      prizePool: 5000, coinReward: 800, maxPlayers: 64,
      description: 'The premier VALORANT tournament on GHQ. 5v5 competitive format.',
      rules: ['Teams of 5', 'Standard competitive rules', 'No exploits', 'Disputes within 10 min'],
      tags: ['5v5', 'Competitive'],
      startDate: future(-1),
    },
    {
      name: 'BGMI CHAMPIONS CUP',
      game: 'BGMI', platform: 'Mobile',
      type: 'CHAMPIONS', mode: 'PAID', status: 'UPCOMING',
      entryFee: 100,  // 100 Gollers entry
      prizePool: 20000, coinReward: 3000, maxPlayers: 32,
      description: 'Elite bracket tournament for the best BGMI squads in India.',
      rules: ['Squad of 4', 'Custom room format', 'Single elimination bracket'],
      tags: ['Battle Royale', 'Bracket'],
      startDate: future(5),
    },
    {
      name: 'FREE FIRE FRIDAY FIESTA',
      game: 'Free Fire', platform: 'Mobile',
      type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING',
      entryFee: 0,    // free!
      prizePool: 1000, coinReward: 400, maxPlayers: 128,
      description: 'Weekly free tournament. Earn GHQ Coins without spending Gollers.',
      rules: ['Solo format', 'Custom lobby', 'No teaming'],
      tags: ['Battle Royale', 'Free Entry'],
      startDate: future(2),
    },
    {
      name: 'CS2 MASTERS INVITATIONAL',
      game: 'CS2', platform: 'PC',
      type: 'CHAMPIONS', mode: 'PAID', status: 'UPCOMING',
      entryFee: 200,  // 200 Gollers
      prizePool: 50000, coinReward: 8000, maxPlayers: 16,
      description: 'The biggest CS2 tournament on GHQ. 16-team bracket.',
      rules: ['Team of 5', 'MR12 format', 'Double elimination'],
      tags: ['FPS', 'Bracket', 'Elite'],
      startDate: future(10),
    },
    {
      name: 'COD MOBILE OPEN',
      game: 'COD Mobile', platform: 'Mobile',
      type: 'TOURNAMENT', mode: 'FREE', status: 'UPCOMING',
      entryFee: 0,
      prizePool: 2000, coinReward: 500, maxPlayers: 64,
      description: 'Free entry COD Mobile tournament. Earn Coins and prove your skills.',
      rules: ['5v5 Multiplayer', 'Standard ranked rules'],
      tags: ['FPS', 'Free Entry'],
      startDate: future(3),
    },
    {
      name: 'PUBG PC PRO LEAGUE',
      game: 'PUBG', platform: 'PC',
      type: 'TOURNAMENT', mode: 'PAID', status: 'LIVE',
      entryFee: 75,   // 75 Gollers
      prizePool: 8000, coinReward: 1200, maxPlayers: 100,
      description: 'PUBG PC league format. Multiple rounds with ranking points.',
      rules: ['Squad of 4', '3 matches per session', 'Top 10 advance'],
      tags: ['Battle Royale'],
      startDate: future(-1, 15),
    },
  ]

  for (let i = 0; i < tournamentsData.length; i++) {
    const t = tournamentsData[i]
    await prisma.tournament.upsert({
      where:  { id: i + 1 },
      update: {},
      create: t,
    })
  }
  console.log('✅ Tournaments seeded  (entry fees now in Gollers 🪙)')

  // ── Bracket for BGMI Champions Cup ───────────────────────────────────────────
  const bgmiT = await prisma.tournament.findFirst({ where: { name: 'BGMI CHAMPIONS CUP' } })
  if (bgmiT) {
    const matches = [
      { round: 1, roundName: 'Quarter Finals', matchNumber: 1, player1Name: 'PhantomX',    player1Score: 2,    player2Name: 'StormRaider', player2Score: 1,    status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 2, player1Name: 'NightFury',   player1Score: 2,    player2Name: 'VortexKing',  player2Score: 0,    status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 3, player1Name: 'ShadowByte',  player1Score: 1,    player2Name: 'IronWolf',    player2Score: 2,    status: 'DONE'     },
      { round: 1, roundName: 'Quarter Finals', matchNumber: 4, player1Name: 'BladeRunner', player1Score: null, player2Name: 'GhostSniper', player2Score: null, status: 'LIVE'     },
      { round: 2, roundName: 'Semi Finals',    matchNumber: 1, player1Name: 'PhantomX',    player1Score: null, player2Name: 'NightFury',   player2Score: null, status: 'UPCOMING' },
      { round: 2, roundName: 'Semi Finals',    matchNumber: 2, player1Name: 'IronWolf',    player1Score: null, player2Name: 'TBD',         player2Score: null, status: 'UPCOMING' },
      { round: 3, roundName: 'Grand Final',    matchNumber: 1, player1Name: 'TBD',         player1Score: null, player2Name: 'TBD',         player2Score: null, status: 'UPCOMING' },
    ]
    for (const m of matches) {
      await prisma.bracketMatch.create({ data: { ...m, tournamentId: bgmiT.id } }).catch(() => {})
    }
    console.log('✅ Bracket seeded')
  }

  console.log('\n🎮 GHQ database ready!\n')
  console.log('─────────────────────────────────────────────')
  console.log('Admin   →  admin@ghq.gg      /  admin123')
  console.log('Player  →  phantom@ghq.gg    /  player123')
  console.log('─────────────────────────────────────────────')
  console.log('🪙  Gollers: PhantomX=500, NightFury=1000')
  console.log('🎯  Entry fees in Gollers (50–200 Gollers)')
  console.log('─────────────────────────────────────────────\n')
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
