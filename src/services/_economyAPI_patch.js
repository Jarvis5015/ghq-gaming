export const economyAPI = {
  getBalance:      ()              => request('/economy/balance'),
  getTransactions: ()              => request('/economy/transactions'),
  claimDailyBonus: ()              => request('/economy/daily-bonus', { method: 'POST' }),
  getAchievements: ()              => request('/economy/achievements'),
  convertCoins:    (gollarsWanted) => request('/economy/convert', { method: 'POST', body: JSON.stringify({ gollarsWanted }) }),
  adminGrant:      (body)          => request('/economy/grant',   { method: 'POST', body: JSON.stringify(body) }),
}
