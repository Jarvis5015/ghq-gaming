import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ParticleField from './components/ui/ParticleField'
import LiveTicker from './components/ui/LiveTicker'
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

export default function App() {
  const { refreshUser, isLoggedIn } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [])

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
    </div>
  )
}
