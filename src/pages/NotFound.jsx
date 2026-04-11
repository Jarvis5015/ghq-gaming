import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* BG grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #ff2d5508, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative text-center px-6">
        {/* Glitch 404 */}
        <div className="relative inline-block mb-6">
          <div className="font-display font-bold text-[12rem] leading-none text-[#1a2545] select-none">404</div>
          <div className="absolute inset-0 font-display font-bold text-[12rem] leading-none text-[#00f5ff] select-none"
            style={{ clipPath: 'inset(30% 0 50% 0)', transform: 'translateX(-4px)', opacity: 0.6 }}>404</div>
          <div className="absolute inset-0 font-display font-bold text-[12rem] leading-none text-[#ff2d55] select-none"
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translateX(4px)', opacity: 0.6 }}>404</div>
        </div>

        <div className="font-mono text-xs text-[#4a5568] tracking-[0.4em] uppercase mb-3">Page Not Found</div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">YOU'RE OFF THE MAP</h1>
        <p className="font-body text-[#4a5568] mb-10 max-w-sm mx-auto">This zone doesn't exist. Maybe the tournament ended, the page moved, or you typed something wrong.</p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/"
            className="relative px-8 py-3 overflow-hidden group"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
            <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">← Back to Home</span>
          </Link>
          <Link to="/tournaments"
            className="px-8 py-3 border border-[#1a2545] font-display font-bold text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
            View Tournaments
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
