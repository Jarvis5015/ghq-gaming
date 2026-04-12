import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    clearError()
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(#00f5ff06, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="border border-[#1a2545] bg-[#0a0f1e] overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-[#00f5ff]/20 border border-[#00f5ff]/40 flex items-center justify-center">
                  <span className="font-display font-bold text-[#00f5ff] text-xs">GHQ</span>
                </div>
                <span className="font-display font-bold text-lg text-white tracking-widest">
                  GAMER<span className="text-[#00f5ff]">HQ</span>
                </span>
              </Link>
              <h1 className="font-display font-bold text-3xl text-white">WELCOME BACK</h1>
              <p className="font-body text-sm text-[#4a5568] mt-1">Sign in to your GHQ account</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 flex items-center gap-2"
              >
                <span className="text-[#ff2d55] text-sm">⚠</span>
                <span className="font-body text-sm text-[#ff2d55]">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="player@ghq.gg"
                  required
                  className="w-full px-4 py-3 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/50 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/50 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#4a5568] hover:text-[#00f5ff] transition-colors tracking-wider"
                  >
                    {showPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 overflow-hidden group mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
              >
                <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="font-body text-sm text-[#4a5568]">New to GHQ? </span>
              <Link to="/register" className="font-display text-sm text-[#00f5ff] hover:text-white transition-colors tracking-wider uppercase">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
