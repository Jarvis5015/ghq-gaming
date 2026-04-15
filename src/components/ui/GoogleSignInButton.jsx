// src/components/ui/GoogleSignInButton.jsx
// Google Sign In with two-step flow for new users:
// Step 1 — Google verifies identity
// Step 2 — New users must choose a unique GHQ username before account is created

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/useAuthStore'
import { authAPI } from '../../services/api'

const GOOGLE_CLIENT_ID = '1002134307154-phv4pgmq12gvlcio74tnthmf88sk4tok.apps.googleusercontent.com'

export default function GoogleSignInButton({ redirectTo = '/' }) {
  const navigate                    = useNavigate()
  const { googleLogin, googleComplete } = useAuthStore()
  const btnRef                      = useRef(null)

  const [step,         setStep]        = useState('button')  // 'button' | 'username'
  const [loading,      setLoading]     = useState(false)
  const [error,        setError]       = useState('')

  // Username step state
  const [googleToken,  setGoogleToken] = useState('')
  const [username,     setUsername]    = useState('')
  const [checking,     setChecking]    = useState(false)
  const [available,    setAvailable]   = useState(null)  // null | true | false
  const [usernameMsg,  setUsernameMsg] = useState('')
  const [submitting,   setSubmitting]  = useState(false)

  // Render Google button
  useEffect(() => {
    if (step !== 'button') return
    const init = () => {
      if (!window.google || !btnRef.current) return setTimeout(init, 100)
      window.google.accounts.id.initialize({
        client_id:          GOOGLE_CLIENT_ID,
        callback:           handleCredentialResponse,
        auto_select:        false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(btnRef.current, {
        theme:          'filled_black',
        size:           'large',
        shape:          'rectangular',
        width:          btnRef.current?.offsetWidth || 400,
        text:           'continue_with',
        logo_alignment: 'left',
      })
    }
    init()
  }, [step])

  // Step 1 — Google returns credential
  const handleCredentialResponse = async (response) => {
    setLoading(true); setError('')
    try {
      const result = await googleLogin(response.credential)

      if (result.success) {
        // Existing user — logged in directly
        navigate(redirectTo)
        return
      }

      if (result.needsUsername) {
        // New user — show username setup screen
        setGoogleToken(result.googleToken)
        setStep('username')
        return
      }

      // Error
      setError(result.message || 'Google sign in failed')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Live username availability check (debounced)
  const checkUsername = useCallback(async (value) => {
    if (!value || value.length < 3) {
      setAvailable(null); setUsernameMsg('')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setAvailable(false); setUsernameMsg('Only letters, numbers and underscores')
      return
    }
    setChecking(true)
    try {
      const res = await authAPI.checkUsername(value)
      setAvailable(res.available)
      setUsernameMsg(res.message)
    } catch {
      setAvailable(null)
    } finally {
      setChecking(false)
    }
  }, [])

  // Debounce username input
  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 500)
    return () => clearTimeout(timer)
  }, [username])

  // Step 2 — Submit chosen username
  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    if (!available || !username) return
    setSubmitting(true); setError('')
    try {
      const result = await googleComplete(googleToken, username)
      if (result.success) {
        navigate(redirectTo)
      } else {
        setError(result.message || 'Failed to create account')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Username setup screen ─────────────────────────────────────────────────
  if (step === 'username') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#1a2545]" />
          <span className="font-mono text-[10px] text-[#00ff88] tracking-widest">ALMOST THERE</span>
          <div className="flex-1 h-px bg-[#1a2545]" />
        </div>

        <div className="border border-[#00f5ff]/20 bg-[#0a0f1e] p-5"
          style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center text-sm">🎮</div>
            <div>
              <div className="font-display font-bold text-sm text-white">Choose your GHQ Username</div>
              <div className="font-mono text-[10px] text-[#4a5568]">This is how other players will see you</div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mb-3 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleUsernameSubmit} className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setAvailable(null) }}
                  placeholder="e.g. PhantomX, NightFury99"
                  maxLength={20}
                  autoFocus
                  className={`w-full px-4 py-3 bg-[#050810] border text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none transition-colors pr-10 ${
                    available === true  ? 'border-[#00ff88]/60' :
                    available === false ? 'border-[#ff2d55]/60' :
                    'border-[#1a2545] focus:border-[#00f5ff]/50'
                  }`}
                />
                {/* Status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <div className="w-4 h-4 border-2 border-[#00f5ff]/30 border-t-[#00f5ff] rounded-full animate-spin" />}
                  {!checking && available === true  && <span className="text-[#00ff88] text-sm">✓</span>}
                  {!checking && available === false && <span className="text-[#ff2d55] text-sm">✗</span>}
                </div>
              </div>

              {/* Live feedback */}
              <AnimatePresence>
                {usernameMsg && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-1.5 font-mono text-[10px] ${available ? 'text-[#00ff88]' : 'text-[#ff2d55]'}`}>
                    {available ? '✓' : '✗'} {usernameMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-1 font-mono text-[9px] text-[#4a5568]">
                3–20 characters · letters, numbers, underscores only
              </div>
            </div>

            <button
              type="submit"
              disabled={!available || submitting || username.length < 3}
              className="relative w-full py-3 overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
            >
              <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
              <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                {submitting ? 'Creating Account...' : '🎮 Join GHQ'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setStep('button'); setUsername(''); setGoogleToken(''); setError('') }}
              className="w-full font-mono text-[10px] text-[#4a5568] hover:text-white transition-colors py-1"
            >
              ← Use a different Google account
            </button>
          </form>
        </div>
      </motion.div>
    )
  }

  // ── Default Google button ─────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#1a2545]" />
        <span className="font-mono text-[10px] text-[#4a5568] tracking-widest">OR</span>
        <div className="flex-1 h-px bg-[#1a2545]" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-3 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google button rendered here */}
      <div ref={btnRef} className="w-full overflow-hidden" style={{ minHeight: '44px' }} />

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-4 h-4 border-2 border-[#00f5ff]/30 border-t-[#00f5ff] rounded-full animate-spin" />
          <span className="font-mono text-xs text-[#4a5568]">Signing in...</span>
        </div>
      )}

      <p className="font-mono text-[9px] text-[#4a5568] text-center mt-3">
        By continuing, you agree to our{' '}
        <a href="/privacy-policy" className="text-[#00f5ff] hover:text-white transition-colors">Privacy Policy</a>
      </p>
    </div>
  )
}
