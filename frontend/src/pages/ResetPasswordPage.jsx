import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { authApi } from '../api'
import { FloatingInput } from '../components/ui'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [done, setDone] = useState(false)

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!email) { setError('Enter your email'); return }
    setLoading(true); setError('')
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!password) { setError('Enter a new password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Invalid or expired reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Shop<span className="text-gradient">Ease</span>
          </span>
        </Link>

        {done ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Password reset!</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Redirecting you to login...</p>
          </motion.div>
        ) : token ? (
          <>
            <h2 className="font-display font-bold text-2xl mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Set new password</h2>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-secondary)' }}>Enter your new password below.</p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <FloatingInput id="password" label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={error && !password ? error : ''} required />
              <FloatingInput id="confirm" label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} error={error && password !== confirm ? error : ''} required />
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="btn-primary w-full justify-center py-3.5 mt-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset password <ArrowRight size={16} /></>}
              </motion.button>
            </form>
          </>
        ) : sent ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
            <Mail size={48} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Check your inbox</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              If an account with that email exists, we've sent a password reset link.
            </p>
            <Link to="/login" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>Back to login</Link>
          </motion.div>
        ) : (
          <>
            <h2 className="font-display font-bold text-2xl mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Forgot password?</h2>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleForgot} className="space-y-4">
              <FloatingInput id="email" label="Email address" type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} required />
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="btn-primary w-full justify-center py-3.5 mt-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send reset link <ArrowRight size={16} /></>}
              </motion.button>
            </form>

            <p className="text-xs text-center mt-6">
              <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>Back to login</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
