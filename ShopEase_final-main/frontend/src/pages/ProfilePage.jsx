import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/index'
import { motion } from 'framer-motion'
import { User, Mail, MapPin, Smartphone, PenLine, ShieldCheck, Star, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'

const LEVELS = [
  { level: 1, minExp: 0, title: 'New Reviewer' },
  { level: 2, minExp: 50, title: 'Regular Reviewer' },
  { level: 3, minExp: 150, title: 'Verified Reviewer', badge: true },
  { level: 4, minExp: 300, title: 'Expert Reviewer', badge: true },
  { level: 5, minExp: 500, title: 'Top Reviewer', badge: true },
  { level: 6, minExp: 1000, title: 'Legendary Reviewer', badge: true },
]

function getLevel(exp) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (exp >= l.minExp) current = l
  }
  return current
}

function getNextLevel(exp) {
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (exp < LEVELS[i + 1].minExp) return LEVELS[i + 1]
  }
  return null
}

export default function ProfilePage() {
  const { user, setUser, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    address: user?.address || '',
    mobile_number: user?.mobile_number || ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      address: user.address || '',
      mobile_number: user.mobile_number || ''
    })
  }, [user])

  useEffect(() => {
    refreshUser()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    try {
      const response = await usersApi.updateProfile(formData)
      if (response.data) {
        await refreshUser()
        setSuccess(true)
        setEditing(false)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      const detail = error.response?.data?.detail || error.message
      alert(`Failed to update profile: ${detail}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  const exp = user.exp || 0
  const level = getLevel(exp)
  const nextLevel = getNextLevel(exp)
  const progress = nextLevel ? ((exp - level.minExp) / (nextLevel.minExp - level.minExp)) * 100 : 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl shadow-lg overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Avatar + Name Header */}
          <div className="p-8 pb-0">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                {(user.first_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                {level.badge && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ShieldCheck size={14} style={{ color: '#22c55e' }} />
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Verified Reviewer</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-primary text-sm px-4 py-2 cursor-pointer shrink-0"
              >
                <PenLine size={14} /> {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {/* EXP Card */}
          <div className="mx-8 mb-6 p-5 rounded-2xl" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: '#f59e0b' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Level {level.level}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)' }}>{level.title}</span>
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{exp} EXP</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))' }}
              />
            </div>
            {nextLevel && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {nextLevel.minExp - exp} EXP to {nextLevel.title}
              </p>
            )}
            {!nextLevel && (
              <p className="text-xs mt-2 font-semibold" style={{ color: '#f59e0b' }}>Maximum Level Reached!</p>
            )}
          </div>

          {/* Email Verification Status */}
          {user && (
            <div className="mx-8 mb-6">
              {user.is_verified ? (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Email Verified</span>
                </div>
              ) : (
                <VerificationCard email={user.email} />
              )}
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-8 mb-6 p-4 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}
            >
              <p className="font-semibold" style={{ color: '#22c55e' }}>Profile updated successfully!</p>
            </motion.div>
          )}

          {/* Info Display or Edit Form */}
          <div className="px-8 pb-8">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                      className="input-field" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                      className="input-field" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mobile Number</label>
                  <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange}
                    className="input-field" placeholder="+91-9999999999" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="4"
                    className="input-field resize-none" placeholder="123 Main St, City, State 12345" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-lg font-bold">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                  <User size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Name</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                  <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                  <Smartphone size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mobile</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.mobile_number || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                  <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: 2 }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Address</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.address || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function VerificationCard({ email }) {
  const { resendVerification } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setSending(true)
    const res = await resendVerification(email)
    setSending(false)
    if (res.success) setSent(true)
  }

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>Email Not Verified</p>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Please verify your email address. If you don't see the email, check your spam folder.
          </p>
          {sent ? (
            <p className="text-xs font-medium" style={{ color: '#22c55e' }}>Verification email sent!</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              {sending ? (
                <span className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              Resend Verification Email
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
