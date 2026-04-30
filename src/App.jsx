import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ParticleField from './components/ui/ParticleField'
import LiveTicker from './components/ui/LiveTicker'
import GameSelectionModal from './components/ui/GameSelectionModal'
import useAuthStore from './store/useAuthStore'

import Home             from './pages/Home'
import Tournaments      from './pages/Tournaments'
import Champions        from './pages/Champions'
import Leaderboard      from './pages/Leaderboard'
import Economy          from './pages/Economy'
import Wallet           from './pages/Wallet'
import TournamentDetail from './pages/TournamentDetail'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Profile          from './pages/Profile'
import Admin            from './pages/Admin'
import About            from './pages/About'
import PrivacyPolicy    from './pages/PrivacyPolicy'
import NotFound         from './pages/NotFound'

// Key stored in localStorage to track if player has selected their games
const GAMES_SELECTED_KEY = 'ghq_games_selected'

export default function App() {
  const { refreshUser, isLoggedIn, user } = useAuthStore()
  const [showGameModal, setShowGameModal] = useState(false)

  useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [])

  // Show game selection modal after login if:
  // 1. User is logged in
  // 2. Not an admin
  // 3. They haven't selected games yet (flag not in localStorage)
  useEffect(() => {
    if (!isLoggedIn || !user) return
    if (user.role === 'ADMIN') return

    const alreadySelected = localStorage.getItem(`${GAMES_SELECTED_KEY}_${user.id}`)
    if (!alreadySelected) {
      // Small delay so the page loads first before the modal pops up
      const timer = setTimeout(() => setShowGameModal(true), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, user?.id])

  const handleGameModalComplete = () => {
    // Mark as done for this user so it never shows again
    if (user?.id) {
      localStorage.setItem(`${GAMES_SELECTED_KEY}_${user.id}`, 'true')
    }
    setShowGameModal(false)
  }

  return (
    <div className="relative bg-[#050810] min-h-screen">
      <ParticleField />
      <Navbar />
      <LiveTicker />
      <main className="relative z-10">
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/tournaments"     element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/champions"       element={<Champions />} />
          <Route path="/leaderboard"     element={<Leaderboard />} />
          <Route path="/economy"         element={<Economy />} />
          <Route path="/wallet"          element={<Wallet />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/admin"           element={<Admin />} />
          <Route path="/about"           element={<About />} />
          <Route path="/privacy-policy"  element={<PrivacyPolicy />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      {/* Game Selection Modal — shown once after first login */}
      {showGameModal && (
        <GameSelectionModal onComplete={handleGameModalComplete} />
      )}
    </div>
  )
}
