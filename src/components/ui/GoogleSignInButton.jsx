// src/components/ui/GoogleSignInButton.jsx
// Reusable Google Sign In button
// Uses Google Identity Services (GSI) — the modern Google Sign In API
// No npm package needed — loaded via script tag in index.html

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

// Your Google Client ID — safe to be in frontend code
const GOOGLE_CLIENT_ID = '1002134307154-phv4pgmq12gvlcio74tnthmf88sk4tok.apps.googleusercontent.com'

export default function GoogleSignInButton({ redirectTo = '/', label = 'Continue with Google' }) {
  const navigate     = useNavigate()
  const { googleLogin, clearError } = useAuthStore()
  const btnRef       = useRef(null)
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')

  useEffect(() => {
    // Wait for Google SDK to load (it's async in index.html)
    const init = () => {
      if (!window.google) return setTimeout(init, 100)

      window.google.accounts.id.initialize({
        client_id:         GOOGLE_CLIENT_ID,
        callback:          handleCredentialResponse,
        auto_select:       false,
        cancel_on_tap_outside: true,
      })

      // Render the custom-styled button inside our div
      window.google.accounts.id.renderButton(btnRef.current, {
        theme:     'filled_black',   // dark theme to match GHQ style
        size:      'large',
        shape:     'rectangular',
        width:     btnRef.current?.offsetWidth || 400,
        text:      'continue_with',
        logo_alignment: 'left',
      })
    }
    init()
  }, [])

  const handleCredentialResponse = async (response) => {
    setLoading(true)
    setError('')
    clearError()
    try {
      const result = await googleLogin(response.credential)
      if (result.success) {
        navigate(redirectTo)
      } else {
        setError(result.message || 'Google sign in failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#1a2545]" />
        <span className="font-mono text-[10px] text-[#4a5568] tracking-widest">OR</span>
        <div className="flex-1 h-px bg-[#1a2545]" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">
          ⚠ {error}
        </div>
      )}

      {/* Google renders its button inside this div */}
      <div
        ref={btnRef}
        className="w-full overflow-hidden"
        style={{ minHeight: '44px' }}
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-4 h-4 border-2 border-[#00f5ff]/30 border-t-[#00f5ff] rounded-full animate-spin" />
          <span className="font-mono text-xs text-[#4a5568]">Signing in...</span>
        </div>
      )}

      <p className="font-mono text-[9px] text-[#4a5568] text-center mt-3 leading-relaxed">
        By continuing with Google, you agree to our{' '}
        <a href="/privacy-policy" className="text-[#00f5ff] hover:text-white transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
