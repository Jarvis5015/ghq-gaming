// src/pages/AdminCoinSettings.jsx
// Admin panel for configuring GHQ Coin values
// Tournament Prize Coins removed — those are set per-tournament in prize tiers + result announcement

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { configAPI, economyAPI } from '../services/api'

const CATEGORY_META = {
  coins:   { label: 'Earning Settings', icon: '⬡', color: '#ffd700', desc: 'How many GHQ Coins players earn from various actions' },
  gollars: { label: 'Gollar Limits',    icon: '🪙', color: '#f5a623', desc: 'Min/max Gollar transaction amounts' },
}

export default function AdminCoinSettings() {
  const [config,   setConfig]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [error,    setError]    = useState('')
  const [edited,   setEdited]   = useState({})

  const [grantForm, setGrantForm] = useState({ username: '', amount: '', reason: '' })
  const [grantMsg,  setGrantMsg]  = useState('')

  useEffect(() => {
    configAPI.getAdmin()
      .then(res => {
        // ✅ Filter out prizes + tournament categories
        // Tournament rewards are configured per-tournament via Prize Tiers + Result Announcement
        const filtered = (res.config || []).filter(
          item => item.category !== 'prizes' && item.category !== 'tournament'
        )
        setConfig(filtered)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key, value) => setEdited(prev => ({ ...prev, [key]: value }))
  const getValue     = (item) => edited[item.key] !== undefined ? edited[item.key] : item.value

  const handleSave = async () => {
    const updates = Object.entries(edited).map(([key, value]) => ({ key, value }))
    if (!updates.length) return setMsg('No changes to save')
    setSaving(true); setMsg(''); setError('')
    try {
      const res = await configAPI.save(updates)
      setMsg(res.message)
      setConfig(prev => prev.map(item => {
        const u = updates.find(u => u.key === item.key)
        return u ? { ...item, value: u.value } : item
      }))
      setEdited({})
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGrant = async (e) => {
    e.preventDefault()
    try {
      await economyAPI.adminGrant({ username: grantForm.username, amount: Number(grantForm.amount), reason: grantForm.reason })
      setGrantMsg(`✓ ${grantForm.amount} ⬡ coins granted to ${grantForm.username}`)
      setGrantForm({ username: '', amount: '', reason: '' })
      setTimeout(() => setGrantMsg(''), 4000)
    } catch (err) {
      setGrantMsg(`✗ ${err.message}`)
    }
  }

  const grouped    = {}
  for (const item of config) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const hasChanges = Object.keys(edited).length > 0
  const inputCls   = "w-full px-3 py-2 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm focus:outline-none focus:border-[#ffd700]/50 transition-colors"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
          <h2 className="font-display font-bold text-3xl text-white">⬡ COIN SETTINGS</h2>
          <p className="font-mono text-xs text-[#4a5568] mt-1">Changes take effect immediately for all players</p>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.button initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              onClick={handleSave} disabled={saving}
              className="relative px-8 py-3 overflow-hidden group disabled:opacity-50"
              style={{clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'}}>
              <div className="absolute inset-0 bg-[#ffd700] group-hover:bg-[#ffd700]/85 transition-colors" />
              <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                {saving ? 'Saving...' : `💾 Save ${Object.keys(edited).length} Change${Object.keys(edited).length!==1?'s':''}`}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_,i) => <div key={i} className="h-40 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
      ) : (
        <>
          {/* Note about tournament prizes */}
          <div className="p-4 border border-[#00f5ff]/20 bg-[#00f5ff]/5 font-mono text-xs text-[#4a5568]">
            💡 <strong className="text-white">Tournament prize coins/Gollars</strong> are configured per-tournament in{' '}
            <span className="text-[#00f5ff]">Tournaments → Manage → Prize Tiers</span>, and assigned per player in{' '}
            <span className="text-[#ffd700]">Announce Results</span>.
          </div>

          {Object.entries(CATEGORY_META).map(([cat, meta]) => {
            const items = grouped[cat] || []
            if (!items.length) return null
            return (
              <div key={cat} className="border border-[#1a2545] overflow-hidden"
                style={{clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
                <div className="px-5 py-4 border-b border-[#1a2545] bg-[#0a0f1e]"
                  style={{borderTop:`2px solid ${meta.color}33`}}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <div className="font-display font-bold text-base" style={{color:meta.color}}>{meta.label}</div>
                      <div className="font-mono text-[10px] text-[#4a5568]">{meta.desc}</div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-[#1a2545]">
                  {items.map(item => {
                    const currentVal = getValue(item)
                    const isChanged  = edited[item.key] !== undefined && String(edited[item.key]) !== String(item.value)
                    return (
                      <div key={item.key} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors ${isChanged?'bg-[#ffd700]/3':'hover:bg-[#0a0f1e]/40'}`}>
                        <div className="col-span-6">
                          <div className="font-display text-sm text-white flex items-center gap-2">
                            {item.label}
                            {isChanged && <span className="font-mono text-[9px] text-[#ffd700] border border-[#ffd700]/30 px-1.5 py-0.5">UNSAVED</span>}
                          </div>
                          <div className="font-mono text-[10px] text-[#4a5568] mt-0.5">{item.desc}</div>
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style={{color:meta.color}}>{meta.icon}</span>
                            <input type="number" min="0" value={currentVal}
                              onChange={e => handleChange(item.key, e.target.value)}
                              className={inputCls + ' pl-8'} style={{color:meta.color}} />
                          </div>
                        </div>
                        <div className="col-span-3 font-mono text-[10px]">
                          {isChanged
                            ? <span className="text-[#ffd700]">{item.value} → <strong className="text-white">{currentVal}</strong></span>
                            : <span className="text-[#4a5568]">Current: {item.value}</span>
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {hasChanges && (
            <div className="flex items-center justify-between p-4 border border-[#ffd700]/30 bg-[#ffd700]/5">
              <div className="font-mono text-xs text-[#ffd700]">⚠ {Object.keys(edited).length} unsaved change{Object.keys(edited).length!==1?'s':''}</div>
              <div className="flex gap-3">
                <button onClick={() => setEdited({})} className="px-4 py-2 font-mono text-xs border border-[#1a2545] text-[#4a5568] hover:text-white transition-all">Discard</button>
                <button onClick={handleSave} disabled={saving}
                  className="relative px-6 py-2 overflow-hidden group disabled:opacity-50"
                  style={{clipPath:'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                  <div className="absolute inset-0 bg-[#ffd700] group-hover:bg-[#ffd700]/85" />
                  <span className="relative font-display font-bold text-xs tracking-widest uppercase text-[#050810]">{saving ? 'Saving...' : 'Save All'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Grant Coins */}
          <div className="border border-[#1a2545] bg-[#0a0f1e] p-6"
            style={{clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
            <h3 className="font-display font-bold text-lg text-white mb-1">MANUALLY GRANT COINS</h3>
            <p className="font-mono text-[10px] text-[#4a5568] mb-5">Give GHQ Coins to a specific player — for event rewards, compensation, etc.</p>
            <AnimatePresence>
              {grantMsg && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className={`mb-4 p-3 border font-mono text-xs ${grantMsg.startsWith('✓')?'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]':'border-[#ff2d55]/30 bg-[#ff2d55]/10 text-[#ff2d55]'}`}>
                  {grantMsg}
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleGrant} className="grid md:grid-cols-3 gap-4">
              {[['Player Username','username','e.g. PhantomX','text'],['Amount (⬡ Coins)','amount','e.g. 500','number'],['Reason','reason','e.g. Event winner','text']].map(([l,k,ph,t])=>(
                <div key={k}>
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">{l}</label>
                  <input type={t} required={k!=='reason'} min={t==='number'?'1':undefined}
                    value={grantForm[k]} onChange={e=>setGrantForm({...grantForm,[k]:e.target.value})}
                    placeholder={ph} className={inputCls+(k==='amount'?' text-[#ffd700]':'')} />
                </div>
              ))}
              <div className="md:col-span-3">
                <button type="submit" className="px-6 py-2.5 font-display font-bold text-xs tracking-widest uppercase border border-[#ffd700]/40 text-[#ffd700] hover:bg-[#ffd700]/10 transition-all">
                  ⬡ Grant Coins to Player
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
