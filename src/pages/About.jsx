import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-about" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,17 58,47 30,62 2,47 2,17" fill="none" stroke="#00f5ff" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-about)"/>
      </svg>
    </div>
  )
}

const values = [
  { icon: '⚔️', title: 'Fair Competition', desc: 'Every tournament runs on transparent rules. No pay-to-win, no rigged brackets. Pure skill decides the winner.' },
  { icon: '💰', title: 'Real Rewards', desc: 'We distribute actual prize money and GHQ Coins that have platform value. Every rupee promised is delivered.' },
  { icon: '🎮', title: 'Mobile & PC Unified', desc: 'The only platform that runs serious tournaments for both mobile and PC players under one roof.' },
  { icon: '🇮🇳', title: 'Built for India', desc: 'Low entry fees, INR prizes, Indian games, and servers built for Indian internet speeds.' },
]

const team = [
  { name: 'Arjun Mehta', role: 'Founder & CEO', avatar: 'AM', bio: 'Ex-professional BGMI player, 6 years in competitive gaming.' },
  { name: 'Priya Sharma', role: 'Head of Operations', avatar: 'PS', bio: 'Tournament director with 200+ events organized.' },
  { name: 'Rahul Dev', role: 'Lead Developer', avatar: 'RD', bio: 'Full-stack engineer and lifelong gamer.' },
  { name: 'Neha Kulkarni', role: 'Community Manager', avatar: 'NK', bio: 'Managing 100K+ player community across platforms.' },
]

const milestones = [
  { year: '2025', label: 'GHQ Founded', desc: 'Started with 3 tournaments and 200 players' },
  { year: 'Q2 2025', label: 'Mobile Launch', desc: 'Added BGMI, Free Fire, COD Mobile support' },
  { year: 'Q3 2025', label: 'Champions Circuit', desc: 'Launched bracket-format elite tournaments' },
  { year: 'Q4 2025', label: '100K Players', desc: 'Crossed 100,000 registered players' },
  { year: '2026', label: 'Coin Economy', desc: 'Full GHQ Coins economy system launched' },
]

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden border-b border-[#1a2545]/60">
        <HexGrid />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, #00f5ff08, transparent)' }} />

        <div className="max-w-5xl mx-auto px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-4">Our Story</div>
            <h1 className="font-display font-bold text-7xl md:text-8xl text-white leading-none mb-6">
              ABOUT <span className="text-[#00f5ff]" style={{ textShadow: '0 0 60px #00f5ff55' }}>GHQ</span>
            </h1>
            <p className="font-body text-lg text-[#4a5568] max-w-2xl mx-auto leading-relaxed">
              GamerHeadQuarter was built by gamers who were tired of broken tournaments, fake prizes, and platforms that didn't care about Indian players. We built the arena we always wanted.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-3">Mission</div>
            <h2 className="font-display font-bold text-4xl text-white mb-5">WE EXIST TO MAKE EVERY GAMER <span className="text-[#00f5ff]">MATTER</span></h2>
            <p className="font-body text-[#4a5568] leading-relaxed mb-4">
              Whether you're a casual player looking for your first tournament or a veteran chasing the Champions title — GHQ has a place for you.
            </p>
            <p className="font-body text-[#4a5568] leading-relaxed">
              We run free tournaments to welcome newcomers, and paid Champions brackets for those ready to put real stakes on the line. Every format, every game, every platform.
            </p>
          </div>

          {/* Stats visual */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: '124K+', l: 'Registered Players', c: '#00f5ff' },
              { v: '8,400+', l: 'Tournaments Run', c: '#ffd700' },
              { v: '₹2.4Cr+', l: 'Prizes Paid', c: '#00ff88' },
              { v: '180M+', l: 'GHQ Coins Earned', c: '#7c3aed' },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="border border-[#1a2545] bg-[#0a0f1e] p-5 text-center"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                <div className="font-display font-bold text-2xl mb-1" style={{ color: s.c }}>{s.v}</div>
                <div className="font-mono text-[9px] text-[#4a5568] tracking-wider uppercase">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-16 border-y border-[#1a2545]/40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">What We Stand For</div>
            <h2 className="font-display font-bold text-4xl text-white">OUR <span className="text-[#ffd700]">VALUES</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 border border-[#1a2545] bg-[#0a0f1e]/60 hover:border-[#00f5ff]/20 transition-colors group">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-base text-white mb-2 group-hover:text-[#00f5ff] transition-colors">{v.title}</h3>
                <p className="font-body text-xs text-[#4a5568] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Our Journey</div>
          <h2 className="font-display font-bold text-4xl text-white">MILESTONES</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#1a2545]" />
          <div className="space-y-10">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="font-mono text-xs text-[#00f5ff] tracking-wider mb-1">{m.year}</div>
                  <div className="font-display font-bold text-lg text-white">{m.label}</div>
                  <div className="font-body text-sm text-[#4a5568]">{m.desc}</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-[#00f5ff] border-2 border-[#050810] flex-shrink-0 z-10"
                  style={{ boxShadow: '0 0 10px #00f5ff66' }} />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 border-t border-[#1a2545]/40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">The People</div>
            <h2 className="font-display font-bold text-4xl text-white">MEET THE <span className="text-[#00f5ff]">TEAM</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 border border-[#1a2545] bg-[#0a0f1e]/60 hover:border-[#00f5ff]/20 transition-all group">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-[#1a2545] group-hover:border-[#00f5ff]/40 flex items-center justify-center transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <span className="font-display font-bold text-xl text-[#00f5ff]">{member.avatar}</span>
                </div>
                <div className="font-display font-bold text-sm text-white mb-1">{member.name}</div>
                <div className="font-mono text-[9px] text-[#00f5ff] tracking-widest mb-2 uppercase">{member.role}</div>
                <div className="font-body text-xs text-[#4a5568]">{member.bio}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden border-t border-[#1a2545]/40">
        <HexGrid />
        <div className="max-w-2xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-5xl text-white mb-4">READY TO <span className="text-[#00f5ff]">JOIN US?</span></h2>
            <p className="font-body text-[#4a5568] mb-8">Become part of India's fastest-growing gaming tournament community.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register"
                className="relative px-8 py-3 overflow-hidden group"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
                <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">Create Account</span>
              </Link>
              <Link to="/tournaments"
                className="px-8 py-3 border border-[#1a2545] font-display font-bold text-sm tracking-widest uppercase text-[#4a5568] hover:text-white hover:border-[#1a2545]/80 transition-all">
                Browse Tournaments
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
