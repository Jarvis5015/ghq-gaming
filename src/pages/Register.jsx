import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '', email: '', password: '', platform: 'PC',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    clearError()
    setFieldErrors({})
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Basic client-side validation for step 1
  const validateStep1 = () => {
    const errs = {}
    if (form.username.length < 3) errs.username = 'At least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers, underscores only'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email'
    if (form.password.length < 6) errs.password = 'At least 6 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async () => {
    const result = await register(form.username, form.email, form.password, form.platform)
    if (result.success) {
      navigate('/')
    }
  }

  const inputCls = "w-full px-4 py-3 bg-[#050810] border text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(#7c3aed06, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="border border-[#1a2545] bg-[#0a0f1e] overflow-hidden"
          style={{ clipPath: 'polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-[#00f5ff]/20 border border-[#00f5ff]/40 flex items-center justify-center">
                  <span className="font-display font-bold text-[#00f5ff] text-xs">GHQ</span>
                </div>
                <span className="font-display font-bold text-lg text-white tracking-widest">
                  GAMER<span className="text-[#00f5ff]">HQ</span>
                </span>
              </Link>
              <h1 className="font-display font-bold text-3xl text-white">JOIN THE ARENA</h1>
              <p className="font-body text-sm text-[#4a5568] mt-1">Create your GHQ account</p>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex-1 h-0.5 bg-[#00f5ff] transition-all duration-500" />
              <div className={`flex-1 h-0.5 transition-all duration-500 ${step >= 2 ? 'bg-[#00f5ff]' : 'bg-[#1a2545]'}`} />
            </div>

            {/* Server error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 flex items-center gap-2">
                <span className="text-[#ff2d55] text-sm">⚠</span>
                <span className="font-body text-sm text-[#ff2d55]">{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleNext}
                  className="space-y-4"
                >
                  {/* Username */}
                  <div>
                    <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Username</label>
                    <input
                      type="text" name="username" value={form.username}
                      onChange={handleChange} placeholder="YourGamerTag" required
                      className={`${inputCls} ${fieldErrors.username ? 'border-[#ff2d55]/50' : 'border-[#1a2545] focus:border-[#00f5ff]/50'}`}
                    />
                    {fieldErrors.username && (
                      <p className="font-mono text-[10px] text-[#ff2d55] mt-1">{fieldErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Email</label>
                    <input
                      type="email" name="email" value={form.email}
                      onChange={handleChange} placeholder="player@ghq.gg" required
                      className={`${inputCls} ${fieldErrors.email ? 'border-[#ff2d55]/50' : 'border-[#1a2545] focus:border-[#00f5ff]/50'}`}
                    />
                    {fieldErrors.email && (
                      <p className="font-mono text-[10px] text-[#ff2d55] mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Password</label>
                    <input
                      type="password" name="password" value={form.password}
                      onChange={handleChange} placeholder="Min 6 characters" required
                      className={`${inputCls} ${fieldErrors.password ? 'border-[#ff2d55]/50' : 'border-[#1a2545] focus:border-[#00f5ff]/50'}`}
                    />
                    {fieldErrors.password && (
                      <p className="font-mono text-[10px] text-[#ff2d55] mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <button type="submit"
                    className="relative w-full py-3.5 overflow-hidden group mt-2"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
                    <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                    <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                      Continue →
                    </span>
                  </button>
                </motion.form>

              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* Platform selection */}
                  <div>
                    <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-3">
                      Primary Platform
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[['PC', '🖥️'], ['Mobile', '📱'], ['Both', '🎮']].map(([p, icon]) => (
                        <button key={p} type="button"
                          onClick={() => setForm({ ...form, platform: p })}
                          className={`py-4 border font-display font-semibold text-xs tracking-wider uppercase transition-all ${
                            form.platform === p
                              ? 'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10'
                              : 'border-[#1a2545] text-[#4a5568] hover:border-[#1a2545]/80 hover:text-white'
                          }`}>
                          <div className="text-2xl mb-1">{icon}</div>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Welcome bonus */}
                  <div className="p-4 border border-[#ffd700]/20 bg-[#ffd700]/5">
                    <div className="font-mono text-[9px] text-[#ffd700] tracking-widest mb-1">🎁 WELCOME BONUS</div>
                    <div className="font-display font-bold text-2xl text-[#ffd700]">+500 ⬡</div>
                    <div className="font-mono text-[10px] text-[#4a5568] mt-0.5">GHQ Coins credited instantly on signup</div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 border border-[#1a2545] bg-[#050810]/60 space-y-1">
                    <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-2">ACCOUNT SUMMARY</div>
                    {[['Username', form.username], ['Email', form.email], ['Platform', form.platform]].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="font-mono text-[10px] text-[#4a5568]">{l}</span>
                        <span className="font-mono text-[10px] text-white">{v}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="relative w-full py-3.5 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
                    <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                    <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                      {isLoading ? 'Creating Account...' : '🎮 Create Account'}
                    </span>
                  </button>

                  <button type="button" onClick={() => setStep(1)}
                    className="w-full font-mono text-xs text-[#4a5568] hover:text-white transition-colors tracking-wider pt-1">
                    ← Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <span className="font-body text-sm text-[#4a5568]">Already a player? </span>
              <Link to="/login" className="font-display text-sm text-[#00f5ff] hover:text-white transition-colors tracking-wider uppercase">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
