// src/store/useAuthStore.js
import { create } from 'zustand'
import { authAPI } from '../services/api'

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('ghq_user')
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

const useAuthStore = create((set, get) => ({
  user:       getSavedUser(),
  token:      localStorage.getItem('ghq_token') || null,
  isLoading:  false,
  error:      null,
  isLoggedIn: !!localStorage.getItem('ghq_token'),

  register: async (username, email, password, platform) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authAPI.register({ username, email, password, platform })
      localStorage.setItem('ghq_token', data.token)
      localStorage.setItem('ghq_user',  JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoggedIn: true, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, message: err.message }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authAPI.login({ email, password })
      localStorage.setItem('ghq_token', data.token)
      localStorage.setItem('ghq_user',  JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoggedIn: true, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, message: err.message }
    }
  },

  logout: () => {
    localStorage.removeItem('ghq_token')
    localStorage.removeItem('ghq_user')
    set({ user: null, token: null, isLoggedIn: false, error: null })
  },

  refreshUser: async () => {
    const token = localStorage.getItem('ghq_token')
    if (!token) return
    try {
      const data = await authAPI.getMe()
      localStorage.setItem('ghq_user', JSON.stringify(data.user))
      set({ user: data.user, isLoggedIn: true })
    } catch {
      get().logout()
    }
  },

  // Update any user fields in store (e.g. after Gollers change)
  updateUser: (updates) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, ...updates }
    localStorage.setItem('ghq_user', JSON.stringify(updated))
    set({ user: updated })
  },

  // Quickly update Gollers balance without full refresh
  updateGollers: (newBalance) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, gollers: newBalance }
    localStorage.setItem('ghq_user', JSON.stringify(updated))
    set({ user: updated })
  },

  clearError: () => set({ error: null }),
}))

if (typeof window !== 'undefined') {
  window.addEventListener('ghq_logout', () => {
    localStorage.removeItem('ghq_token')
    localStorage.removeItem('ghq_user')
    useAuthStore.setState({ user: null, token: null, isLoggedIn: false })
  })
}

export default useAuthStore
