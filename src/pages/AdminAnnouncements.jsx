// src/pages/AdminAnnouncements.jsx
// Admin panel to create, manage, delete announcements shown on homepage

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { announcementAPI } from '../services/api'

const TYPE_OPTIONS = [
  { value: 'info',    label: '💬 Info',    color: '#00f5ff' },
  { value: 'success', label: '✅ Update',  color: '#00ff88' },
  { value: 'warning', label: '⚠️ Warning', color: '#f5a623' },
  { value: 'urgent',  label: '🚨 Urgent',  color: '#ff2d55' },
]

const ICON_OPTIONS = ['📢', '🏆', '🎮', '🔥', '⚡', '🚨', '🎯', '💎', '🪙', '⬡', '🛡️', '📅', '🎉', '⚠️', '✅', '❌']

const EMPTY_FORM = { title: '', message: '', type: 'info', icon: '📢', pinned: false, expiresAt: '' }

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)   // announcement being edited
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [error,    setError]    = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await announcementAPI.getAdmin()
      setAnnouncements(res.announcements || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setMsg(''); setError('')
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      title:     a.title,
      message:   a.message,
      type:      a.type,
      icon:      a.icon,
      pinned:    a.pinned,
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
    })
    setShowForm(true)
    setMsg(''); setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt || null,
      }
      if (editing) {
        await announcementAPI.update(editing.id, payload)
        setMsg('✓ Announcement updated!')
      } else {
        await announcementAPI.create(payload)
        setMsg('✓ Announcement created!')
      }
      await load()
      setTimeout(() => { setShowForm(false); setMsg('') }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (a) => {
    try {
      await announcementAPI.update(a.id, { isActive: !a.isActive })
      setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, isActive: !x.isActive } : x))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await announcementAPI.delete(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const TYPE_COLORS = { info: '#00f5ff', success: '#00ff88', warning: '#f5a623', urgent: '#ff2d55' }
  const inputCls = "w-full px-3 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
          <h2 className="font-display font-bold text-3xl text-white">📢 ANNOUNCEMENTS</h2>
          <p className="font-mono text-xs text-[#4a5568] mt-1">Create notices that appear on the homepage for all players</p>
        </div>
        <button onClick={openCreate}
          className="relative px-6 py-3 overflow-hidden group"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
          <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
            + New Announcement
          </span>
        </button>
      </div>

      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-5 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-5 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>

      {/* ── CREATE / EDIT FORM ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="border border-[#00f5ff]/20 bg-[#0a0f1e] p-6 mb-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

            <h3 className="font-display font-bold text-lg text-white mb-5">
              {editing ? '✏️ EDIT ANNOUNCEMENT' : '+ CREATE ANNOUNCEMENT'}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title + Icon */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Server Maintenance Tonight" className={inputCls} />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Icon</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ICON_OPTIONS.map(icon => (
                      <button key={icon} type="button" onClick={() => setForm({...form, icon})}
                        className={`w-8 h-8 text-base transition-all border ${form.icon===icon ? 'border-[#00f5ff] bg-[#00f5ff]/10' : 'border-[#1a2545] hover:border-[#4a5568]'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Message *</label>
                <textarea required rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Write your announcement message here..."
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Type */}
              <div>
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPE_OPTIONS.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm({...form, type: t.value})}
                      className={`px-4 py-2 font-display text-xs tracking-wider uppercase border transition-all ${
                        form.type===t.value
                          ? 'border-current bg-current/10'
                          : 'border-[#1a2545] text-[#4a5568] hover:text-white'
                      }`}
                      style={form.type===t.value ? { color: t.color, borderColor: `${t.color}66` } : {}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                    Expires At <span className="normal-case font-body">(blank = never)</span>
                  </label>
                  <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                    className={inputCls} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.pinned ? 'bg-[#ffd700]' : 'bg-[#1a2545]'}`}
                      onClick={() => setForm({...form, pinned: !form.pinned})}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.pinned ? 'left-7' : 'left-1'}`} />
                    </div>
                    <div>
                      <div className="font-display text-sm text-white">📌 Pin to top</div>
                      <div className="font-mono text-[10px] text-[#4a5568]">Always shown first</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="relative px-8 py-2.5 overflow-hidden group disabled:opacity-50"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                  <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANNOUNCEMENTS LIST ── */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-16 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
          <div className="text-4xl mb-3">📢</div>
          <div className="font-display font-bold text-lg text-[#4a5568] mb-2">No announcements yet</div>
          <button onClick={openCreate} className="font-mono text-sm text-[#00f5ff] hover:text-white transition-colors">
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => {
            const color = TYPE_COLORS[a.type] || '#00f5ff'
            const expired = a.expiresAt && new Date(a.expiresAt) < new Date()
            return (
              <motion.div key={a.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.05 }}
                className={`border p-4 transition-all ${!a.isActive || expired ? 'opacity-40' : ''}`}
                style={{ borderColor: `${color}33` }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 border tracking-widest"
                        style={{ color, borderColor: `${color}44` }}>
                        {a.type.toUpperCase()}
                      </span>
                      {a.pinned   && <span className="font-mono text-[9px] text-[#ffd700]">📌 PINNED</span>}
                      {!a.isActive && <span className="font-mono text-[9px] text-[#4a5568]">HIDDEN</span>}
                      {expired    && <span className="font-mono text-[9px] text-[#ff2d55]">EXPIRED</span>}
                    </div>
                    <div className="font-display font-semibold text-white mb-1">{a.title}</div>
                    <div className="font-body text-sm text-[#4a5568] line-clamp-2">{a.message}</div>
                    <div className="font-mono text-[9px] text-[#4a5568]/60 mt-1">
                      Created {new Date(a.createdAt).toLocaleDateString('en-IN')}
                      {a.expiresAt && ` · Expires ${new Date(a.expiresAt).toLocaleDateString('en-IN')}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle active */}
                    <button onClick={() => handleToggle(a)} title={a.isActive ? 'Hide' : 'Show'}
                      className={`px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border transition-all ${
                        a.isActive ? 'border-[#00ff88]/40 text-[#00ff88]' : 'border-[#1a2545] text-[#4a5568]'
                      }`}>
                      {a.isActive ? '● Visible' : '○ Hidden'}
                    </button>
                    {/* Edit */}
                    <button onClick={() => openEdit(a)}
                      className="px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all">
                      Edit
                    </button>
                    {/* Delete */}
                    <button onClick={() => handleDelete(a.id)}
                      className="px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-[#ff2d55] hover:border-[#ff2d55]/30 transition-all">
                      ✕
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
