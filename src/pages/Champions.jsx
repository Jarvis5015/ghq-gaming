import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import TournamentCard from '../components/tournament/TournamentCard'
import BracketView from '../components/bracket/BracketView'

export default function Champions() {
  const { tournaments, bracketData } = useStore()
  const champsTournaments = tournaments.filter(t => t.type === 'champions')

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="relative pt-28 pb-16 overflow-hidden border-b border-[#1a2545]/40">
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)'}} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:'linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)', backgroundSize:'40px 40px'}} />

        {/* Crown watermark */}
        <div className="absolute right-12 top-12 font-display text-[200px] text-[#ffd700]/[0.04] leading-none select-none pointer-events-none">👑</div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-6 border border-[#7c3aed]/30 bg-[#7c3aed]/5 px-5 py-2">
              <span className="text-[#a78bfa] text-sm">👑</span>
              <span className="font-mono text-xs text-[#a78bfa] tracking-[0.4em]">ELITE BRACKET TOURNAMENTS</span>
            </div>
            <h1 className="font-display font-bold text-7xl md:text-8xl tracking-wide text-white leading-none mb-4">
              CHAMPIONS<br/>
              <span className="text-transparent" style={{WebkitTextStroke:'2px rgba(167,139,250,0.6)'}}>CIRCUIT</span>
            </h1>
            <p className="font-body text-[#4a5568] text-lg max-w-xl leading-relaxed">
              Only the elite compete here. Proper bracket-format tournaments with structured elimination rounds, massive prize pools, and GHQ immortality.
            </p>
          </motion.div>

          {/* Key stats */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="flex flex-wrap gap-6 mt-10">
            {[['👑', 'Always Paid', 'Skin in the game'],['⚔️','Bracket Format','Single elimination'],['💰','Massive Prizes','Up to ₹50,000'],['🏅','Exclusive Titles','Champion badge forever']].map(([icon,title,sub]) => (
              <div key={title} className="flex items-center gap-3 px-4 py-3 border border-[#7c3aed]/20 bg-[#0a0f1e]/60">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="font-display font-semibold text-sm text-white">{title}</div>
                  <div className="font-mono text-[10px] text-[#4a5568] tracking-wider">{sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Active Champions Tournaments */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-[#7c3aed] to-transparent" />
          <span className="font-mono text-xs text-[#a78bfa] tracking-[0.4em] uppercase">Active Events</span>
          <div className="h-px flex-1 bg-gradient-to-l from-[#7c3aed] to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {champsTournaments.map((t, i) => (
            <TournamentCard key={t.id} tournament={t} index={i} />
          ))}
        </div>

        {/* Live Bracket Section */}
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="border border-[#7c3aed]/30 bg-[#0a0a12] overflow-hidden">

          {/* Bracket header */}
          <div className="border-b border-[#7c3aed]/30 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[#ffd700]">🏆</span>
              <h2 className="font-display font-bold text-xl tracking-widest text-white">BGMI CHAMPIONS CUP — LIVE BRACKET</h2>
            </div>
            <div className="flex items-center gap-2 bg-[#ff2d55]/10 border border-[#ff2d55]/30 px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-[#ff2d55] animate-ping" />
              <span className="font-mono text-xs text-[#ff2d55] tracking-widest">QUARTER FINALS LIVE</span>
            </div>
          </div>

          {/* Info bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#1a2545]/60 border-b border-[#1a2545]/60">
            {[['FORMAT','Single Elim.'],['PLAYERS','32'],['PRIZE POOL','₹20,000'],['ROUNDS','5']].map(([l,v]) => (
              <div key={l} className="px-5 py-3 text-center">
                <p className="font-mono text-[9px] text-[#4a5568] tracking-widest">{l}</p>
                <p className="font-display text-sm text-white mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          <div className="p-6 overflow-x-auto">
            <BracketView bracketData={bracketData} />
          </div>
        </motion.div>

        {/* How Champions Works */}
        <div className="mt-20">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <div className="font-mono text-xs text-[#a78bfa] tracking-[0.4em] uppercase mb-3">The Format</div>
            <h2 className="font-display font-bold text-4xl text-white">HOW CHAMPIONS <span className="text-[#ffd700]">WORKS</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step:'01', title:'REGISTER & PAY', desc:'Pay the entry fee to lock your slot. Limited seats ensure quality competition. No casuals.', color:'#7c3aed' },
              { step:'02', title:'BRACKET DRAWS', desc:'Automated seeding and bracket generation. Know your opponent path before day one.', color:'#ffd700' },
              { step:'03', title:'COMPETE & WIN', desc:"Win your matches, advance rounds. The last player standing claims the full prize + GHQ Champion title.", color:'#00f5ff' },
            ].map((s, i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.15}}
                className="relative border border-[#1a2545] p-6 bg-[#0a0f1e]/60 group hover:border-[#7c3aed]/30 transition-colors overflow-hidden">
                <span className="font-display text-7xl absolute top-3 right-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity" style={{color:s.color}}>{s.step}</span>
                <div className="w-8 h-1 mb-4" style={{background:s.color,boxShadow:`0 0 8px ${s.color}`}} />
                <h4 className="font-display font-bold text-xl text-white mb-2 tracking-wide">{s.title}</h4>
                <p className="font-body text-sm text-[#4a5568] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
