import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/useAuthStore'

const navLinks = [
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Champions',   href: '/champions'   },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Economy',     href: '/economy'     },
  { label: 'About',       href: '/about'       },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const { user, isLoggedIn, logout } = useAuthStore()
  const location = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShowUserMenu(false)
  }, [location.pathname])

  const isActive = (href) =>
    location.pathname === href || (href !== '/' && location.pathname.startsWith(href))

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-3'}`}
      >
        <div className={`absolute inset-0 transition-all duration-500 ${
          scrolled ? 'bg-[#050810]/96 backdrop-blur-xl border-b border-[#1a2545]/60' : 'bg-transparent'
        }`} />

        <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-[#00f5ff]/20 rounded-lg rotate-45 group-hover:rotate-[60deg] transition-transform duration-500" />
              <div className="absolute inset-1 bg-[#00f5ff]/40 rounded-md rotate-12 group-hover:rotate-[30deg] transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-[#00f5ff] text-xs tracking-wider">GHQ</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-lg text-white tracking-widest leading-none">
                GAMER<span className="text-[#00f5ff]">HQ</span>
              </div>
              <div className="font-mono text-[8px] text-[#4a5568] tracking-[0.3em] leading-none">HEADQUARTER</div>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href}
                className={`relative px-3.5 py-2 font-display font-medium text-xs tracking-widest uppercase transition-all duration-200 group ${
                  isActive(link.href) ? 'text-[#00f5ff]' : 'text-[#e8eaf6]/60 hover:text-white'
                }`}>
                {link.label}
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-px bg-[#00f5ff] transition-all duration-300 ${
                  isActive(link.href) ? 'w-4/5' : 'w-0 group-hover:w-3/5'
                }`} />
              </Link>
            ))}
          </div>

          {/* ── Right side ── */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {isLoggedIn && user ? (
              <>
                {/* 🪙 Gollers balance — links to wallet */}
                <Link to="/wallet"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/40 hover:border-[#f5a623]/70 transition-colors group">
                  <span className="text-sm leading-none">🪙</span>
                  <span className="font-mono text-xs text-[#f5a623] font-bold group-hover:text-[#f5a623]/80 transition-colors">
                    {(user.gollers || 0).toLocaleString()}
                  </span>
                  <span className="font-mono text-[9px] text-[#f5a623]/60 tracking-wider">GOLLERS</span>
                </Link>

                {/* GHQ Coins — links to economy */}
                <Link to="/economy"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/30 hover:border-[#ffd700]/60 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-[#ffd700] flex items-center justify-center text-[6px] font-bold text-black">G</div>
                  <span className="font-mono text-xs text-[#ffd700] font-semibold">
                    {(user.coins || 0).toLocaleString()}
                  </span>
                </Link>

                {/* Admin pill */}
                {user.role === 'ADMIN' && (
                  <Link to="/admin"
                    className="px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border border-[#7c3aed]/40 text-[#a78bfa] hover:bg-[#7c3aed]/10 transition-all">
                    Admin
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#1a2545] hover:border-[#00f5ff]/30 transition-colors">
                    <div className="w-5 h-5 bg-[#00f5ff]/20 flex items-center justify-center font-mono text-[9px] text-[#00f5ff] font-bold">
                      {user.avatar || user.username?.slice(0,2).toUpperCase()}
                    </div>
                    <span className="font-display text-xs text-[#e8eaf6]/80 tracking-wider">{user.username}</span>
                    <span className="text-[#4a5568] text-xs">▾</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                        className="absolute right-0 top-full mt-2 w-48 border border-[#1a2545] bg-[#0a0f1e] overflow-hidden z-50">
                        {[
                          { label: '🎮 My Profile',   href: '/profile'  },
                          { label: '🪙 Wallet',        href: '/wallet'   },
                          { label: '⬡ Economy',        href: '/economy'  },
                        ].map(item => (
                          <Link key={item.label} to={item.href}
                            className="block px-4 py-2.5 font-display text-xs tracking-widest uppercase text-[#e8eaf6]/70 hover:text-[#00f5ff] hover:bg-[#00f5ff]/5 transition-colors">
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-[#1a2545]" />
                        <button onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 font-display text-xs tracking-widest uppercase text-[#ff2d55]/70 hover:text-[#ff2d55] hover:bg-[#ff2d55]/5 transition-colors">
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-3.5 py-1.5 text-xs font-display font-semibold tracking-wider text-[#e8eaf6]/60 hover:text-white transition-colors uppercase">
                  Login
                </Link>
                <Link to="/register"
                  className="relative px-4 py-1.5 overflow-hidden group"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                  <span className="relative font-display font-bold text-xs tracking-widest uppercase text-[#050810]">Join GHQ</span>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#e8eaf6] p-2" aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="lg:hidden overflow-hidden border-t border-[#1a2545]/40 bg-[#050810]/98 backdrop-blur-xl">
              <div className="px-6 py-4 space-y-1">
                {/* Wallet balances */}
                {isLoggedIn && user && (
                  <div className="flex gap-3 py-3 border-b border-[#1a2545]/40 mb-2">
                    <Link to="/wallet" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/40">
                      <span className="text-sm">🪙</span>
                      <span className="font-mono text-sm text-[#f5a623] font-bold">{(user.gollers||0).toLocaleString()}</span>
                    </Link>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/30">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#ffd700] flex items-center justify-center text-[6px] font-bold text-black">G</div>
                      <span className="font-mono text-sm text-[#ffd700] font-semibold">{(user.coins||0).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link key={link.label} to={link.href}
                    className={`block py-2.5 font-display font-semibold tracking-widest uppercase text-sm border-b border-[#1a2545]/20 transition-colors ${
                      isActive(link.href) ? 'text-[#00f5ff]' : 'text-[#e8eaf6]/70 hover:text-[#00f5ff]'
                    }`}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/wallet" className="block py-2.5 font-display font-semibold tracking-widest uppercase text-sm text-[#f5a623] border-b border-[#1a2545]/20">
                  🪙 Wallet
                </Link>
                {isLoggedIn && user?.role === 'ADMIN' && (
                  <Link to="/admin" className="block py-2.5 font-display font-semibold tracking-widest uppercase text-sm text-[#a78bfa] border-b border-[#1a2545]/20">
                    Admin Panel
                  </Link>
                )}

                <div className="pt-4 flex gap-3">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="flex-1 text-center py-2.5 border border-[#00f5ff]/30 font-display font-bold text-sm tracking-wider uppercase text-[#00f5ff]">Profile</Link>
                      <button onClick={handleLogout} className="flex-1 py-2.5 border border-[#ff2d55]/30 font-display font-bold text-sm tracking-wider uppercase text-[#ff2d55]">Log Out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1 text-center py-2.5 border border-[#1a2545] font-display text-sm tracking-wider uppercase text-[#e8eaf6]/60">Login</Link>
                      <Link to="/register" className="flex-1 text-center py-2.5 bg-[#00f5ff] text-[#050810] font-display font-bold text-sm tracking-wider uppercase">Join GHQ</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <div className="h-[60px]" />
    </>
  )
}
