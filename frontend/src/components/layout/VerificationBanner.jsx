import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, X, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function VerificationBanner() {
  const { user, resendVerification } = useAuth()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [dismissed, setDismissed] = useState(false)

  if (!user || user.is_verified || dismissed) return null

  const handleResend = async () => {
    setSending(true)
    setMessage('')
    const res = await resendVerification(user.email)
    setSending(false)
    setMessage(res.success ? 'Verification email sent!' : res.error)
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="relative px-4 py-2.5 text-sm text-center"
      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,58,237,0.08))', borderBottom: '1px solid rgba(168,85,247,0.15)' }}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Mail size={14} className="text-purple-400 flex-shrink-0" />
        <span style={{ color: 'var(--text-secondary)' }}>
          Please verify your email address to activate your account.
        </span>
        <button
          onClick={handleResend}
          disabled={sending}
          className="text-purple-400 hover:text-purple-300 font-medium text-xs flex items-center gap-1 transition-colors"
        >
          {sending ? (
            <span className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          Resend
        </button>
      </div>
      {message && (
        <div className="flex items-center justify-center gap-1 mt-1 text-xs" style={{ color: message.includes('sent') ? '#22c55e' : '#ef4444' }}>
          <AlertCircle size={10} />
          {message}
        </div>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
