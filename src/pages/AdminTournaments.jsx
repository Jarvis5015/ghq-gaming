// src/pages/AdminTournaments.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tournamentAPI } from '../services/api'

const GAME_COLORS = {
  Valorant: '#ff4655', BGMI: '#f5a623', 'Free Fire': '#ff6b35',
  'COD Mobile': '#00c853', PUBG: '#f0c040', CS2: '#de9b35',
  Fortnite: '#00bcd4', 'Clash Royale': '#7c3aed',
}

const toLocal   = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : ''
const fromLocal = (val) => val ? new Date(val).toISOString() : null

// ── Prize Tier Builder ────────────────────────────────────────────────────────
function PrizeTierBuilder({ tiers, onChange }) {
  const addTier    = () => onChange([...tiers, { placement: tiers.length + 1, gollars: 0, coins: 0 }])
  const removeTier = (i) => onChange(tiers.filter((_, idx) => idx !== i))
  const updateTier = (i, f, val) => onChange(tiers.map((t, idx) => idx === i ? { ...t, [f]: Number(val) || 0 } : t))
  const MEDALS = { 1: '🏆', 2: '🥈', 3: '🥉' }
  const PLACE  = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th' }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase">PRIZE TIERS</label>
        <button type="button" onClick={addTier} className="px-3 py-1 font-mono text-[9px] tracking-widest uppercase border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/10">+ Add Tier</button>
      </div>
      {tiers.length === 0 ? (
        <div className="border border-dashed border-[#1a2545] p-4 text-center font-mono text-xs text-[#4a5568]">No prize tiers — winners get GHQ Coins only.</div>
      ) : (
        <div className="border border-[#1a2545]">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-[#1a2545] bg-[#050810]">
            <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">PLACEMENT</span>
            <span className="col-span-4 font-mono text-[9px] text-[#4a5568] tracking-widest">🪙 GOLLARS</span>
            <span className="col-span-4 font-mono text-[9px] text-[#4a5568] tracking-widest">⬡ COINS</span>
            <span className="col-span-1" />
          </div>
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-[#1a2545] last:border-0 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <span>{MEDALS[tier.placement] || `#${tier.placement}`}</span>
                <span className="font-display text-sm text-white">{PLACE[tier.placement] || `#${tier.placement}`}</span>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f5a623]">🪙</span>
                  <input type="number" min="0" value={tier.gollars || ''} onChange={e => updateTier(i, 'gollars', e.target.value)} placeholder="0"
                    className="w-full pl-8 pr-3 py-2 bg-[#050810] border border-[#1a2545] text-[#f5a623] font-mono text-sm focus:outline-none focus:border-[#f5a623]/40" />
                </div>
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffd700]">⬡</span>
                  <input type="number" min="0" value={tier.coins || ''} onChange={e => updateTier(i, 'coins', e.target.value)} placeholder="0"
                    className="w-full pl-8 pr-3 py-2 bg-[#050810] border border-[#1a2545] text-[#ffd700] font-mono text-sm focus:outline-none focus:border-[#ffd700]/40" />
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeTier(i)} className="font-mono text-xs text-[#ff2d55]/50 hover:text-[#ff2d55]">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Set Room Credentials Form ─────────────────────────────────────────────────
function SetRoomForm({ tournament, onSaved }) {
  const [roomId,   setRoomId]   = useState(tournament?.roomId       || '')
  const [roomPass, setRoomPass] = useState(tournament?.roomPassword || '')
  const [saving,   setSaving]   = useState(false)
  const [clearing, setClearing] = useState(false)
  const [msg,      setMsg]      = useState('')
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)
  const hasRoom  = tournament?.roomId && tournament?.roomPassword
  const inputCls = "w-full px-3 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm focus:outline-none focus:border-[#00ff88]/40 transition-colors"

  const handleSave = async (e) => {
    e.preventDefault()
    if (!roomId.trim() || !roomPass.trim()) return setError('Both Room ID and Password are required')
    setSaving(true); setMsg(''); setError('')
    try {
      const res = await tournamentAPI.setRoom(tournament.id, { roomId: roomId.trim(), roomPassword: roomPass.trim() })
      setMsg(res.message); if (onSaved) onSaved(); setTimeout(() => setMsg(''), 5000)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const handleClear = async () => {
    if (!window.confirm('Clear room credentials?')) return
    setClearing(true)
    try {
      await tournamentAPI.clearRoom(tournament.id)
      setRoomId(''); setRoomPass(''); setMsg('Room credentials cleared')
      if (onSaved) onSaved(); setTimeout(() => setMsg(''), 3000)
    } catch (err) { setError(err.message) } finally { setClearing(false) }
  }

  return (
    <div className="border border-[#00ff88]/30 bg-[#0a0f1e] overflow-hidden mb-5 relative"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent" />
      <div className="px-5 py-4 border-b border-[#00ff88]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎮</span>
          <div>
            <div className="font-display font-bold text-sm text-[#00ff88]">ROOM CREDENTIALS</div>
            <div className="font-mono text-[10px] text-[#4a5568]">Set before LIVE — only registered players see these</div>
          </div>
        </div>
        {hasRoom && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00ff88]" /><span className="font-mono text-[9px] text-[#00ff88]">SET</span></div>}
      </div>
      <div className="p-5">
        {hasRoom && (
          <div className="mb-4 p-4 border border-[#00ff88]/20 bg-[#00ff88]/5 grid grid-cols-2 gap-4">
            <div><div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">ROOM ID</div><div className="font-display font-bold text-xl text-white">{tournament.roomId}</div></div>
            <div><div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">PASSWORD</div><div className="font-display font-bold text-xl text-[#ffd700]">{showPass ? tournament.roomPassword : '••••••••'}</div></div>
          </div>
        )}
        <AnimatePresence>
          {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-3 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">{msg}</motion.div>}
          {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-3 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">⚠ {error}</motion.div>}
        </AnimatePresence>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Room ID *</label>
              <input type="text" value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="e.g. GHQ2026" className={inputCls} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Room Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={roomPass} onChange={e => setRoomPass(e.target.value)} placeholder="e.g. ghq@1234" className={inputCls + ' pr-16'} />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#4a5568] hover:text-white">{showPass ? 'HIDE' : 'SHOW'}</button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="relative px-6 py-2.5 overflow-hidden group disabled:opacity-50" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
              <div className="absolute inset-0 bg-[#00ff88] group-hover:bg-[#00ff88]/85" />
              <span className="relative font-display font-bold text-xs tracking-widest uppercase text-[#050810]">{saving ? 'Saving...' : hasRoom ? '🔄 Update Room' : '🎮 Set Room Credentials'}</span>
            </button>
            {hasRoom && (
              <button type="button" onClick={handleClear} disabled={clearing} className="px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase border border-[#ff2d55]/30 text-[#ff2d55]/70 hover:text-[#ff2d55] disabled:opacity-40">
                {clearing ? 'Clearing...' : '✕ Clear'}
              </button>
            )}
          </div>
          <div className="font-mono text-[9px] text-[#4a5568]">💡 Only visible to <strong className="text-white">registered players</strong> when LIVE.</div>
        </form>
      </div>
    </div>
  )
}

// ── Create Tournament Form ────────────────────────────────────────────────────
function CreateForm({ onCreated }) {
  const EMPTY = {
    name: '', game: '', platform: 'PC', type: 'TOURNAMENT', mode: 'FREE',
    teamSize: 'Solo',
    entryFee: '', prizePool: '', maxPlayers: '64', coinReward: '100',
    description: '', rules: '',
    registrationStart: '', registrationEnd: '', startDate: '', startTime: '18:00', tournamentEnd: '',
    prizeTiers:  [],
    adsRequired: 0,
  }
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')

  const games    = ['Valorant', 'BGMI', 'Free Fire', 'COD Mobile', 'PUBG', 'CS2', 'Fortnite', 'Clash Royale']
  const inputCls = "w-full px-3 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors"
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg(''); setError('')
    try {
      const startDT = new Date(`${form.startDate}T${form.startTime || '18:00'}`)
      const res = await tournamentAPI.create({
        name:        form.name,
        game:        form.game,
        platform:    form.platform,
        type:        form.type,
        mode:        form.mode,
        teamSize:    form.teamSize,
        entryFee:    Number(form.entryFee)   || 0,
        prizePool:   Number(form.prizePool)  || 0,
        coinReward:  Number(form.coinReward) || 100,
        maxPlayers:  Number(form.maxPlayers) || 64,
        description: form.description,
        rules:       form.rules.split('\n').filter(Boolean),
        startDate:         startDT.toISOString(),
        registrationStart: fromLocal(form.registrationStart),
        registrationEnd:   fromLocal(form.registrationEnd),
        tournamentEnd:     fromLocal(form.tournamentEnd),
        prizeTiers:  form.prizeTiers,
        adsRequired: Number(form.adsRequired) || 0,
      })
      setMsg(`✓ "${res.tournament.name}" created!`)
      setForm(EMPTY)
      if (onCreated) onCreated(res.tournament)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h3 className="font-display font-bold text-2xl text-white mb-6">CREATE NEW TOURNAMENT</h3>
      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Tournament Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. BGMI Champions Season 1" className={inputCls} />
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Game *</label>
            <select required value={form.game} onChange={e => set('game', e.target.value)} className={inputCls + ' cursor-pointer'}>
              <option value="">Select game...</option>
              {games.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Platform + Type */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Platform *</label>
            <div className="flex gap-2">
              {['PC', 'Mobile', 'Both'].map(p => (
                <button key={p} type="button" onClick={() => set('platform', p)}
                  className={`flex-1 py-2.5 font-display text-xs tracking-wider uppercase border transition-all ${form.platform===p?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {p === 'PC' ? '🖥️' : p === 'Mobile' ? '📱' : '🎮'} {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Type *</label>
            <div className="flex gap-2">
              {[['TOURNAMENT', '🏆 Open'], ['CHAMPIONS', '👑 Champions']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('type', v)}
                  className={`flex-1 py-2.5 font-display text-xs tracking-wider uppercase border transition-all ${form.type===v?(v==='CHAMPIONS'?'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10':'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10'):'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Size + Entry Mode */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Team Size *</label>
            <div className="flex gap-2">
              {[['Solo','👤'],['Duo','👥'],['Squad','👥👥'],['Custom','⚙️']].map(([v, icon]) => (
                <button key={v} type="button" onClick={() => set('teamSize', v)}
                  className={`flex-1 py-2.5 font-display text-xs tracking-wider uppercase border transition-all ${form.teamSize===v?'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {icon} {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Entry Mode *</label>
            <div className="flex gap-2">
              {[['FREE', '🆓 Free'], ['PAID', '🪙 Paid']].map(([v, l]) => (
                <button key={v} type="button" disabled={form.type === 'CHAMPIONS' && v === 'FREE'} onClick={() => set('mode', v)}
                  className={`flex-1 py-2.5 font-display text-xs tracking-wider uppercase border transition-all disabled:opacity-30 ${form.mode===v?(v==='PAID'?'border-[#f5a623] text-[#f5a623] bg-[#f5a623]/10':'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'):'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Numbers row */}
        <div className="grid md:grid-cols-3 gap-5">
          {form.mode === 'PAID' && (
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Entry Fee (🪙 Gollars) *</label>
              <input required type="number" min="1" value={form.entryFee} onChange={e => set('entryFee', e.target.value)} placeholder="e.g. 100" className={inputCls} />
            </div>
          )}
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Prize Pool (₹)</label>
            <input type="number" min="0" value={form.prizePool} onChange={e => set('prizePool', e.target.value)} placeholder="e.g. 10000" className={inputCls} />
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">GHQ Coin Reward (join)</label>
            <input type="number" min="0" value={form.coinReward} onChange={e => set('coinReward', e.target.value)} placeholder="e.g. 100" className={inputCls} />
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Max Players *</label>
            <select value={form.maxPlayers} onChange={e => set('maxPlayers', e.target.value)} className={inputCls + ' cursor-pointer'}>
              {['8', '16', '32', '64', '100', '128', '256'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="border border-[#00f5ff]/20 p-5 space-y-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div className="font-mono text-[10px] text-[#00f5ff] tracking-widest uppercase">📅 SCHEDULE</div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Registration Opens <span className="normal-case font-body">(blank = now)</span></label>
              <input type="datetime-local" value={form.registrationStart} onChange={e => set('registrationStart', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Registration Closes <span className="normal-case font-body">(blank = at start)</span></label>
              <input type="datetime-local" value={form.registrationEnd} onChange={e => set('registrationEnd', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Start Date *</label>
              <input required type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Start Time *</label>
              <input required type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Tournament Ends <span className="normal-case font-body">(blank = manual)</span></label>
              <input type="datetime-local" value={form.tournamentEnd} onChange={e => set('tournamentEnd', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="p-3 border border-[#00f5ff]/10 bg-[#00f5ff]/5 font-mono text-[10px] text-[#4a5568]">
            🤖 <strong className="text-white">Auto-scheduler</strong> sets LIVE at start time, COMPLETED at end time.
          </div>
        </div>

        {/* Ad Gate */}
        {form.mode === 'FREE' && (
          <div className="border border-[#00f5ff]/20 p-5 space-y-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <div className="font-mono text-[10px] text-[#00f5ff] tracking-widest uppercase">📺 AD GATE</div>
            <p className="font-mono text-[10px] text-[#4a5568]">Players must watch this many ads before joining. Set to 0 for instant free join.</p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-40">
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Ads Required</label>
                <input type="number" min="0" max="10" value={form.adsRequired}
                  onChange={e => set('adsRequired', Math.max(0, Math.min(10, Number(e.target.value) || 0)))} className={inputCls} />
              </div>
              <div className="flex gap-1.5 pb-0.5">
                {[0, 1, 2, 3, 5].map(n => (
                  <button key={n} type="button" onClick={() => set('adsRequired', n)}
                    className={`px-3 py-2.5 font-mono text-[10px] tracking-wider border transition-all ${Number(form.adsRequired)===n?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                    {n === 0 ? 'None' : `${n} ad${n !== 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prize Tiers */}
        <div className="border border-[#f5a623]/20 p-5" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div className="font-mono text-[10px] text-[#f5a623] tracking-widest uppercase mb-4">🪙 PRIZE TIERS</div>
          <PrizeTierBuilder tiers={form.prizeTiers} onChange={tiers => set('prizeTiers', tiers)} />
        </div>

        <div>
          <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tournament format and details..." className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Rules (one per line)</label>
          <textarea rows={4} value={form.rules} onChange={e => set('rules', e.target.value)} placeholder={"Squad of 4\nCustom room format\nNo teaming"} className={inputCls + ' resize-none font-mono text-xs'} />
        </div>

        <button type="submit" disabled={loading}
          className="relative px-8 py-3 overflow-hidden group disabled:opacity-50"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
          <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
            {loading ? 'Creating...' : 'Create Tournament'}
          </span>
        </button>
      </form>
    </div>
  )
}

// ── Result Announcer ──────────────────────────────────────────────────────────
function ResultAnnouncer({ tournament, registrations, onDone }) {
  const prizeTiers = Array.isArray(tournament?.prizeTiers) ? tournament.prizeTiers : []
  const [placements, setPlacements] = useState({})
  const [loading,    setLoading]    = useState(false)
  const [msg,        setMsg]        = useState('')
  const [error,      setError]      = useState('')

  const getPrizeTier = (p) => prizeTiers.find(t => t.placement === p)

  const setPlacement = (userId, placement) => {
    const tier = getPrizeTier(placement)
    setPlacements(prev => ({ ...prev, [userId]: { placement, gollars: tier?.gollars ?? 0, coins: tier?.coins ?? 0 } }))
  }

  const updateField = (userId, field, val) =>
    setPlacements(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: Number(val) || 0 } }))

  const clearPlacement = (userId) =>
    setPlacements(prev => { const n = { ...prev }; delete n[userId]; return n })

  const handleAnnounce = async () => {
    const results = Object.entries(placements).map(([userId, data]) => ({
      userId: Number(userId), placement: data.placement,
      coinsAwarded: data.coins, gollarsAwarded: data.gollars,
    }))
    if (!results.length) return setError('Assign at least one placement first')
    setLoading(true); setMsg(''); setError('')
    try {
      await tournamentAPI.announceResults(tournament.id, { results })
      setMsg('✓ Results announced! Prizes credited to winners.')
      setTimeout(() => onDone && onDone(), 2000)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const MEDALS = { 1: '🏆', 2: '🥈', 3: '🥉' }

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-1">📢 ANNOUNCE RESULTS — <span className="text-[#ffd700]">{tournament?.name}</span></h3>
      <p className="font-mono text-xs text-[#4a5568] mb-4">{registrations?.length || 0} registered players</p>
      {prizeTiers.length > 0 && (
        <div className="mb-5 p-4 border border-[#f5a623]/20 bg-[#f5a623]/5">
          <div className="font-mono text-[9px] text-[#f5a623] tracking-widest mb-2">PRIZE TIERS (auto-fill on rank assign)</div>
          <div className="flex flex-wrap gap-4">
            {prizeTiers.map(t => (
              <div key={t.placement} className="flex items-center gap-2">
                <span>{MEDALS[t.placement] || `#${t.placement}`}</span>
                {t.gollars > 0 && <span className="font-mono text-xs text-[#f5a623]">🪙 {t.gollars}</span>}
                {t.coins > 0 && <span className="font-mono text-xs text-[#ffd700]">⬡ {t.coins}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-4 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>
      <div className="border border-[#1a2545] mb-6">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#1a2545] bg-[#050810]">
          <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">PLAYER</span>
          <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest">IN-GAME ID</span>
          <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">RANK (type any #)</span>
          <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest">🪙 GOLLARS</span>
          <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest">⬡ COINS</span>
        </div>
        {registrations?.map(reg => {
          const p = placements[reg.user.id]
          return (
            <div key={reg.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#1a2545] last:border-0 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-[9px] text-[#00f5ff] flex-shrink-0">{reg.user.avatar}</div>
                <div>
                  <div className="font-display text-sm text-white">{reg.user.username}</div>
                  {p && <div className="font-mono text-[9px] text-[#ffd700]">{MEDALS[p.placement] || `#${p.placement}`} #{p.placement}</div>}
                </div>
              </div>
              <div className="col-span-2 font-mono text-xs text-[#f5a623]">{reg.user.gameUserId || '—'}</div>
              <div className="col-span-3 flex items-center gap-2">
                <input type="number" min="1" value={p?.placement || ''}
                  onChange={e => { const rank = Number(e.target.value); if (!e.target.value) return clearPlacement(reg.user.id); if (rank > 0) setPlacement(reg.user.id, rank) }}
                  placeholder="e.g. 1"
                  className={`w-full px-2 py-1.5 bg-[#050810] border font-mono text-sm text-center focus:outline-none transition-colors ${p ? 'border-[#ffd700]/50 text-[#ffd700]' : 'border-[#1a2545] text-[#4a5568]'}`} />
                {p && <button onClick={() => clearPlacement(reg.user.id)} className="font-mono text-[10px] text-[#ff2d55]/50 hover:text-[#ff2d55] flex-shrink-0">✕</button>}
              </div>
              <div className="col-span-2">
                <input type="number" min="0" value={p?.gollars ?? ''} onChange={e => updateField(reg.user.id, 'gollars', e.target.value)} disabled={!p} placeholder="0"
                  className="w-full px-2 py-1.5 bg-[#050810] border border-[#1a2545] text-[#f5a623] font-mono text-xs focus:outline-none disabled:opacity-30" />
              </div>
              <div className="col-span-2">
                <input type="number" min="0" value={p?.coins ?? ''} onChange={e => updateField(reg.user.id, 'coins', e.target.value)} disabled={!p} placeholder="0"
                  className="w-full px-2 py-1.5 bg-[#050810] border border-[#1a2545] text-[#ffd700] font-mono text-xs focus:outline-none disabled:opacity-30" />
              </div>
            </div>
          )
        })}
      </div>
      {Object.keys(placements).length > 0 && (
        <div className="border border-[#ffd700]/20 bg-[#ffd700]/5 p-4 mb-5">
          <div className="font-mono text-[10px] text-[#ffd700] tracking-widest mb-2">SUMMARY</div>
          <div className="space-y-1">
            {Object.entries(placements).sort(([,a],[,b]) => a.placement - b.placement).map(([userId, data]) => {
              const reg = registrations?.find(r => r.user.id === Number(userId))
              return (
                <div key={userId} className="flex items-center gap-3 font-mono text-xs">
                  <span>{MEDALS[data.placement] || `#${data.placement}`}</span>
                  <span className="text-white">{reg?.user.username}</span>
                  {reg?.user.gameUserId && <span className="text-[#f5a623]">({reg.user.gameUserId})</span>}
                  {data.gollars > 0 && <span className="text-[#f5a623]">+🪙 {data.gollars}</span>}
                  {data.coins > 0 && <span className="text-[#ffd700]">+⬡ {data.coins}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={() => onDone && onDone()} className="px-6 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">Cancel</button>
        <button onClick={handleAnnounce} disabled={loading || !Object.keys(placements).length}
          className="relative px-8 py-3 overflow-hidden group disabled:opacity-40"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-[#ffd700] group-hover:bg-[#ffd700]/85" />
          <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">{loading ? 'Announcing...' : '📢 Announce & Pay Winners'}</span>
        </button>
      </div>
    </div>
  )
}

// ── Tournament Detail View ────────────────────────────────────────────────────
function TournamentDetailView({ tournament, onBack, onRefresh }) {
  const [full,          setFull]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [view,          setView]          = useState('players')
  const [statusLoading, setStatusLoading] = useState(false)
  const [msg,           setMsg]           = useState('')

  const load = () => {
    setLoading(true)
    tournamentAPI.getById(tournament.id)
      .then(data => setFull(data.tournament))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [tournament.id])

  const changeStatus = async (newStatus) => {
    setStatusLoading(true)
    try {
      await tournamentAPI.update(tournament.id, { status: newStatus })
      setFull(p => ({ ...p, status: newStatus }))
      setMsg(`Status → ${newStatus}`); setTimeout(() => setMsg(''), 3000)
      onRefresh && onRefresh()
    } catch (err) { setMsg(`Error: ${err.message}`) }
    finally { setStatusLoading(false) }
  }

  const t         = full || tournament
  const color     = GAME_COLORS[t.game] || '#00f5ff'
  const isLive      = t.status === 'LIVE'
  const isCompleted = t.status === 'COMPLETED'
  const prizeTiers  = Array.isArray(t.prizeTiers) ? t.prizeTiers : []
  const fmtDate     = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={onBack} className="font-mono text-xs text-[#4a5568] hover:text-white mt-1">← Back</button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="font-mono text-xs font-bold" style={{ color }}>{t.game}</div>
            <div className={`px-2 py-0.5 font-mono text-[9px] tracking-widest border ${isLive?'border-[#00ff88]/40 text-[#00ff88] bg-[#00ff88]/10':isCompleted?'border-[#4a5568]/40 text-[#4a5568]':'border-[#00f5ff]/30 text-[#00f5ff]'}`}>{t.status}</div>
            {t.type === 'CHAMPIONS' && <div className="px-2 py-0.5 font-mono text-[9px] border border-[#ffd700]/30 text-[#ffd700]">👑 CHAMPIONS</div>}
            {t.teamSize && <div className="px-2 py-0.5 font-mono text-[9px] border border-[#00f5ff]/20 text-[#00f5ff]/70">{t.teamSize === 'Solo' ? '👤' : t.teamSize === 'Duo' ? '👥' : t.teamSize === 'Squad' ? '👥👥' : '⚙️'} {t.teamSize}</div>}
            {t.adsRequired > 0 && <div className="px-2 py-0.5 font-mono text-[9px] border border-[#00f5ff]/30 text-[#00f5ff]">📺 {t.adsRequired} ads</div>}
            {t.roomId && <div className="px-2 py-0.5 font-mono text-[9px] border border-[#00ff88]/30 text-[#00ff88] bg-[#00ff88]/5">🎮 Room Set</div>}
          </div>
          <h3 className="font-display font-bold text-2xl text-white">{t.name}</h3>
        </div>
      </div>

      {msg && <div className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</div>}

      {/* Status controls */}
      {!isCompleted && (
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mr-2">STATUS:</div>
          {[['UPCOMING','📅 Upcoming','#4a5568'],['LIVE','🔴 Go Live','#00ff88'],['COMPLETED','🏁 End','#ff2d55'],['CANCELLED','❌ Cancel','#ff2d55']].map(([s, label, c]) => (
            t.status !== s && (
              <button key={s} onClick={() => changeStatus(s)} disabled={statusLoading}
                className="px-4 py-2 font-display text-xs tracking-widest uppercase border transition-all disabled:opacity-40"
                style={{ borderColor: `${c}44`, color: c, background: `${c}10` }}>
                {label}
              </button>
            )
          ))}
          {isLive && (
            <button onClick={() => setView('results')}
              className="px-4 py-2 font-display font-bold text-xs tracking-widest uppercase border border-[#ffd700]/40 text-[#ffd700] bg-[#ffd700]/10 ml-auto">
              📢 Announce Results
            </button>
          )}
        </div>
      )}
      {isCompleted && (
        <div className="flex gap-2 mb-5">
          <button onClick={() => setView('results')} className="px-4 py-2 font-display font-bold text-xs tracking-widest uppercase border border-[#ffd700]/40 text-[#ffd700] bg-[#ffd700]/10">
            📢 Re-Announce / Edit Results
          </button>
        </div>
      )}

      {/* Room Credentials Form */}
      {!isCompleted && <SetRoomForm tournament={full || tournament} onSaved={load} />}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          ['Players',    `${full?.registrations?.length || 0}/${t.maxPlayers}`, color],
          ['Entry Fee',  t.entryFee > 0 ? `🪙 ${t.entryFee}` : 'FREE',        '#f5a623'],
          ['Prize Pool', t.prizePool > 0 ? `₹${t.prizePool.toLocaleString()}` : '—', '#ffd700'],
          ['Join Coins', `+${t.coinReward} ⬡`,                                 '#00ff88'],
        ].map(([l, v, c]) => (
          <div key={l} className="border border-[#1a2545] bg-[#0a0f1e]/40 p-3">
            <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">{l}</div>
            <div className="font-display font-bold text-lg" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          ['📝 Reg Opens',  fmtDate(t.registrationStart) === '—' ? 'Now' : fmtDate(t.registrationStart)],
          ['📝 Reg Closes', fmtDate(t.registrationEnd)   === '—' ? 'At start' : fmtDate(t.registrationEnd)],
          ['▶ Starts',      fmtDate(t.startDate)],
          ['🏁 Ends',       fmtDate(t.tournamentEnd)      === '—' ? 'Manual' : fmtDate(t.tournamentEnd)],
        ].map(([l, v]) => (
          <div key={l} className="border border-[#1a2545] bg-[#0a0f1e]/40 p-3">
            <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">{l}</div>
            <div className="font-mono text-xs text-white">{v}</div>
          </div>
        ))}
      </div>

      {/* Prize tiers */}
      {prizeTiers.length > 0 && (
        <div className="border border-[#f5a623]/20 bg-[#f5a623]/5 p-4 mb-5">
          <div className="font-mono text-[9px] text-[#f5a623] tracking-widest mb-3">🪙 PRIZE TIERS</div>
          <div className="flex flex-wrap gap-3">
            {prizeTiers.map(pt => (
              <div key={pt.placement} className="flex items-center gap-2 border border-[#1a2545] px-3 py-2">
                <span>{{ 1: '🏆', 2: '🥈', 3: '🥉' }[pt.placement] || `#${pt.placement}`}</span>
                {pt.gollars > 0 && <span className="font-mono text-sm text-[#f5a623]">🪙 {pt.gollars}</span>}
                {pt.coins > 0 && <span className="font-mono text-sm text-[#ffd700]">⬡ {pt.coins}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players / Results */}
      {view === 'results' ? (
        <ResultAnnouncer tournament={full} registrations={full?.registrations} onDone={() => { setView('players'); onRefresh && onRefresh() }} />
      ) : (
        <div>
          <h4 className="font-display font-bold text-lg text-white mb-4">REGISTERED PLAYERS ({full?.registrations?.length || 0})</h4>
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
          ) : !full?.registrations?.length ? (
            <div className="text-center py-10 border border-[#1a2545]/40 border-dashed"><div className="font-display text-[#4a5568]">No players registered yet</div></div>
          ) : (
            <div className="border border-[#1a2545]">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
                {['#', 'GHQ Name', 'In-Game ID', 'Rank', 'Paid', 'Result'].map(h => (
                  <span key={h} className={`font-mono text-[9px] text-[#4a5568] tracking-widest ${h==='GHQ Name'?'col-span-3':h==='In-Game ID'?'col-span-2':h==='Rank'?'col-span-2':'col-span-1'}`}>{h}</span>
                ))}
              </div>
              {full.registrations.map((reg, i) => (
                <div key={reg.id} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] last:border-0 items-center hover:bg-[#0a0f1e]/40">
                  <div className="col-span-1 font-mono text-xs text-[#4a5568]">{i + 1}</div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-6 h-6 border border-[#1a2545] flex items-center justify-center font-mono text-[8px] text-[#00f5ff]">{reg.user.avatar}</div>
                    <span className="font-display text-sm text-white">{reg.user.username}</span>
                  </div>
                  <div className="col-span-2 font-mono text-xs text-[#f5a623]">{reg.user.gameUserId || <span className="text-[#4a5568]">—</span>}</div>
                  <div className="col-span-2 font-mono text-xs text-[#4a5568]">{reg.user.inGameRank || '—'}</div>
                  <div className="col-span-1 font-mono text-xs text-[#f5a623]">{reg.gollersPaid > 0 ? `🪙${reg.gollersPaid}` : 'FREE'}</div>
                  <div className="col-span-2 font-mono text-xs">
                    {reg.placement ? (
                      <div>
                        <span style={{ color: reg.placement===1?'#ffd700':reg.placement===2?'#c0c0c0':'#cd7f32' }}>
                          {reg.placement===1?'🏆':reg.placement===2?'🥈':'🥉'} #{reg.placement}
                        </span>
                        {reg.gollarsWon > 0 && <div className="text-[#f5a623] text-[9px]">+🪙{reg.gollarsWon}</div>}
                        {reg.coinsEarned > 0 && <div className="text-[#ffd700] text-[9px]">+⬡{reg.coinsEarned}</div>}
                      </div>
                    ) : <span className="text-[#4a5568]">—</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminTournaments() {
  const [tournaments,  setTournaments]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [view,         setView]         = useState('list')
  const [selected,     setSelected]     = useState(null)
  const [gameFilter,   setGameFilter]   = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try { const data = await tournamentAPI.getAll(); setTournaments(data.tournaments || []) }
    catch (err) { console.error(err) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const games    = ['all', ...new Set(tournaments.map(t => t.game))]
  const filtered = tournaments.filter(t =>
    (gameFilter === 'all' || t.game === gameFilter) &&
    (statusFilter === 'all' || t.status === statusFilter)
  )

  if (view === 'create') return (
    <div>
      <button onClick={() => setView('list')} className="font-mono text-xs text-[#4a5568] hover:text-white mb-8 block">← Back</button>
      <CreateForm onCreated={() => { load(); setTimeout(() => setView('list'), 1500) }} />
    </div>
  )
  if (view === 'detail' && selected) return (
    <TournamentDetailView tournament={selected} onBack={() => { setView('list'); setSelected(null) }} onRefresh={load} />
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
          <h2 className="font-display font-bold text-3xl text-white">TOURNAMENT MANAGEMENT</h2>
        </div>
        <button onClick={() => setView('create')} className="relative px-6 py-3 overflow-hidden group" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85" />
          <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">+ Create Tournament</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1.5">
          {['all', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border transition-all ${statusFilter===s?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {games.map(g => (
            <button key={g} onClick={() => setGameFilter(g)}
              className={`px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border transition-all ${gameFilter===g?'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
              {g === 'all' ? 'All Games' : g}
            </button>
          ))}
        </div>
        <button onClick={load} className="ml-auto px-3 py-1.5 font-mono text-[9px] uppercase border border-[#1a2545] text-[#4a5568] hover:text-white">↻</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
          <div className="text-4xl mb-3">🏆</div>
          <div className="font-display font-bold text-lg text-[#4a5568] mb-3">No tournaments</div>
          <button onClick={() => setView('create')} className="font-mono text-sm text-[#00f5ff] hover:text-white">Create one →</button>
        </div>
      ) : (
        <div className="border border-[#1a2545]">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
            {['Tournament', 'Game', 'Format', 'Status', 'Players', 'Entry', 'Date', ''].map((h, i) => (
              <span key={h+i} className={`font-mono text-[9px] text-[#4a5568] tracking-widest uppercase ${h==='Tournament'?'col-span-3':h==='Game'?'col-span-2':''}`}>{h}</span>
            ))}
          </div>
          {filtered.map((t, i) => {
            const color = GAME_COLORS[t.game] || '#00f5ff'
            return (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#1a2545] last:border-0 items-center hover:bg-[#0a0f1e]/40">
                <div className="col-span-3">
                  <div className="font-display font-semibold text-sm text-white">{t.name}</div>
                  {t.type === 'CHAMPIONS' && <div className="font-mono text-[9px] text-[#ffd700]">👑 Champions</div>}
                </div>
                <div className="col-span-2">
                  <div className="font-mono text-xs font-bold" style={{ color }}>{t.game}</div>
                  <div className="font-mono text-[9px] text-[#4a5568]">{t.platform}</div>
                </div>
                <div className="col-span-1">
                  <div className="font-mono text-[9px] text-[#00f5ff]">{t.teamSize || 'Solo'}</div>
                </div>
                <div className="col-span-1">
                  <span className={`font-mono text-[9px] ${t.status==='LIVE'?'text-[#00ff88]':t.status==='COMPLETED'?'text-[#4a5568]':'text-[#00f5ff]'}`}>{t.status}</span>
                </div>
                <div className="col-span-1 font-mono text-xs text-white">{t.registeredPlayers}/{t.maxPlayers}</div>
                <div className="col-span-1 font-mono text-xs" style={{ color: '#f5a623' }}>{t.entryFee > 0 ? `🪙${t.entryFee}` : 'FREE'}</div>
                <div className="col-span-1 font-mono text-[10px] text-[#4a5568]">{new Date(t.startDate).toLocaleDateString('en-IN')}</div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => { setSelected(t); setView('detail') }}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/10">
                    Manage
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
