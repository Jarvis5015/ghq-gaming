// src/store/useStore.js
// App-level state — tournaments, leaderboard, economy data from API
// Auth/user state lives in useAuthStore.js

import { create } from 'zustand'
import { tournamentAPI, userAPI, economyAPI } from '../services/api'

const useStore = create((set) => ({

  // ── Tournaments ─────────────────────────────────────────────────────────────
  tournaments:        [],
  tournamentsLoading: false,
  tournamentsError:   null,

  fetchTournaments: async (filters = {}) => {
    set({ tournamentsLoading: true, tournamentsError: null })
    try {
      const data = await tournamentAPI.getAll(filters)
      set({ tournaments: data.tournaments || [], tournamentsLoading: false })
    } catch (err) {
      set({ tournamentsError: err.message, tournamentsLoading: false })
    }
  },

  // ── Single tournament ───────────────────────────────────────────────────────
  activeTournament:  null,
  bracketData:       null,
  tournamentLoading: false,

  fetchTournamentById: async (id) => {
    set({ tournamentLoading: true, activeTournament: null, bracketData: null })
    try {
      const data = await tournamentAPI.getById(id)
      let bracketData = null
      if (data.tournament.bracketMatches?.length > 0) {
        const grouped = {}
        for (const m of data.tournament.bracketMatches) {
          if (!grouped[m.round]) grouped[m.round] = { name: m.roundName, matches: [] }
          grouped[m.round].matches.push({
            id:      m.id,
            player1: { name: m.player1Name, score: m.player1Score },
            player2: { name: m.player2Name, score: m.player2Score },
            status:  m.status.toLowerCase(),
          })
        }
        bracketData = { rounds: Object.values(grouped) }
      }
      set({ activeTournament: data.tournament, bracketData, tournamentLoading: false })
    } catch {
      set({ tournamentLoading: false })
    }
  },

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  leaderboard:        [],
  leaderboardLoading: false,

  fetchLeaderboard: async (game = 'all') => {
    set({ leaderboardLoading: true })
    try {
      const data = await userAPI.getLeaderboard(game)
      set({ leaderboard: data.leaderboard || [], leaderboardLoading: false })
    } catch {
      set({ leaderboardLoading: false })
    }
  },

  // ── Economy (GHQ Coins) ──────────────────────────────────────────────────────
  transactions:   [],
  achievements:   [],
  economyLoading: false,

  fetchTransactions: async () => {
    set({ economyLoading: true })
    try {
      const data = await economyAPI.getTransactions()
      set({ transactions: data.transactions || [], economyLoading: false })
    } catch {
      set({ economyLoading: false })
    }
  },

  fetchAchievements: async () => {
    try {
      const data = await economyAPI.getAchievements()
      set({ achievements: data.achievements || [] })
    } catch {}
  },

  claimDailyBonus: async () => {
    try {
      const data = await economyAPI.claimDailyBonus()
      return { success: true, message: data.message, coinsEarned: data.coinsEarned }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  // ── UI filters ───────────────────────────────────────────────────────────────
  filterMode:     'all',
  filterType:     'all',
  filterPlatform: 'all',
  filterStatus:   'all',

  setFilterMode:     (v) => set({ filterMode: v }),
  setFilterType:     (v) => set({ filterType: v }),
  setFilterPlatform: (v) => set({ filterPlatform: v }),
  setFilterStatus:   (v) => set({ filterStatus: v }),
}))

export { useStore }
export default useStore
