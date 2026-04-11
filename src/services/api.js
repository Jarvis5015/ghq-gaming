// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('ghq_token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  const data     = await response.json()
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('ghq_token')
      localStorage.removeItem('ghq_user')
      window.dispatchEvent(new Event('ghq_logout'))
    }
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  getMe:    ()     => request('/auth/me'),
}

export const userAPI = {
  getProfile:     ()     => request('/users/me'),
  updateProfile:  (body) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  getLeaderboard: (game) => request(`/users/leaderboard${game && game !== 'all' ? `?game=${game}` : ''}`),
  getUserById:    (id)   => request(`/users/${id}`),
}

export const tournamentAPI = {
  getAll: (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v && v !== 'all'))
    const qs    = new URLSearchParams(clean).toString()
    return request(`/tournaments${qs ? `?${qs}` : ''}`)
  },
  getById:          (id)       => request(`/tournaments/${id}`),
  getBracket:       (id)       => request(`/tournaments/${id}/bracket`),
  create:           (body)     => request('/tournaments', { method: 'POST', body: JSON.stringify(body) }),
  update:           (id, body) => request(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  announceResults:  (id, body) => request(`/tournaments/${id}/announce-results`, { method: 'POST', body: JSON.stringify(body) }),
}

export const economyAPI = {
  getBalance:      ()     => request('/economy/balance'),
  getTransactions: ()     => request('/economy/transactions'),
  claimDailyBonus: ()     => request('/economy/daily-bonus', { method: 'POST' }),
  getAchievements: ()     => request('/economy/achievements'),
  adminGrant:      (body) => request('/economy/grant', { method: 'POST', body: JSON.stringify(body) }),
}

export const gameAPI = {
  getSupportedGames:  ()           => request('/games/supported'),
  getMyProfiles:      ()           => request('/games/my-profiles'),
  getMyStats:         ()           => request('/games/stats/summary'),
  addGame:            (body)       => request('/games/my-profiles', { method: 'POST', body: JSON.stringify(body) }),
  updateGame:         (game, body) => request(`/games/my-profiles/${encodeURIComponent(game)}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeGame:         (game)       => request(`/games/my-profiles/${encodeURIComponent(game)}`, { method: 'DELETE' }),
  getUserProfiles:    (userId)     => request(`/games/profiles/${userId}`),
  getGameLeaderboard: (game)       => request(`/games/leaderboard/${encodeURIComponent(game)}`),
}

export const walletAPI = {
  getBalance:      ()       => request('/wallet/balance'),
  getHistory:      ()       => request('/wallet/history'),
  initiateTopUp:   (amount) => request('/wallet/initiate-topup', { method: 'POST', body: JSON.stringify({ amount }) }),
  submitCode:      (code)   => request('/wallet/submit-code',    { method: 'POST', body: JSON.stringify({ code }) }),
  getTopUpStatus:  ()       => request('/wallet/topup-status'),
  joinTournament:  (tournamentId) => request('/wallet/join-tournament', { method: 'POST', body: JSON.stringify({ tournamentId }) }),
  getPending:      (status = 'SUBMITTED') => request(`/wallet/pending?status=${status}`),
  verify:          (code)   => request('/wallet/verify', { method: 'POST', body: JSON.stringify({ code }) }),
}

export const withdrawAPI = {
  request:       (body)      => request('/withdraw/request', { method: 'POST', body: JSON.stringify(body) }),
  getMyRequests: ()          => request('/withdraw/my-requests'),
  getAll:        (status)    => request(`/withdraw/admin/all${status ? `?status=${status}` : ''}`),
  markPaid:      (id)        => request(`/withdraw/admin/${id}/pay`,    { method: 'POST' }),
  reject:        (id, note)  => request(`/withdraw/admin/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
}

export const adAPI = {
  // Public
  getActive:   (placement) => request(`/ads${placement ? `?placement=${placement}` : ''}`),
  getGateAds:  (tournamentId) => request(`/ads/gate/${tournamentId}`),
  // Admin
  getAll:      ()     => request('/ads/admin/all'),
  create:      (body) => request('/ads/admin', { method: 'POST', body: JSON.stringify(body) }),
  update:      (id, body) => request(`/ads/admin/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:      (id)   => request(`/ads/admin/${id}`,     { method: 'DELETE' }),
}

export default request
