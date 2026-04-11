import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative border-t border-[#1a2545]/60 bg-[#050810] py-14 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{background:'radial-gradient(ellipse, #00f5ff04, transparent)'}} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#00f5ff]/20 border border-[#00f5ff]/30 flex items-center justify-center">
                <span className="font-display font-bold text-[#00f5ff] text-xs">GHQ</span>
              </div>
              <div>
                <div className="font-display font-bold text-lg text-white tracking-widest leading-none">GAMER<span className="text-[#00f5ff]">HQ</span></div>
                <div className="font-mono text-[8px] text-[#4a5568] tracking-[0.3em]">HEADQUARTER</div>
              </div>
            </div>
            <p className="font-body text-xs text-[#4a5568] leading-relaxed max-w-xs">
              India's premier competitive gaming tournament platform. Mobile & PC. Free & Paid. Champions & Open.
            </p>
            <div className="flex gap-3 mt-5">
              {['Discord', 'Twitter', 'Instagram', 'YouTube'].map(s => (
                <button key={s} className="w-8 h-8 border border-[#1a2545] flex items-center justify-center text-[10px] font-mono text-[#4a5568] hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: [['Tournaments', '/tournaments'], ['Champions', '/champions'], ['Leaderboard', '/leaderboard'], ['Economy', '/economy']] },
            { title: 'Account', links: [['Register', '/register'], ['Login', '/login'], ['Profile', '/profile'], ['Achievements', '/economy']] },
            { title: 'Info', links: [['About GHQ', '/about'], ['Rules', '/rules'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.title}>
              <div className="font-display font-semibold text-xs tracking-widest uppercase text-[#e8eaf6]/40 mb-4">{col.title}</div>
              <div className="space-y-2">
                {col.links.map(([l, href]) => (
                  <div key={l}>
                    <Link to={href} className="font-body text-xs text-[#4a5568] hover:text-[#00f5ff] transition-colors">{l}</Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[#1a2545]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[10px] text-[#4a5568]">© 2026 GamerHeadQuarter · All rights reserved</div>
          <div className="font-mono text-[10px] text-[#4a5568]">Built with 🎮 for Indian Gamers</div>
        </div>
      </div>
    </footer>
  )
}
