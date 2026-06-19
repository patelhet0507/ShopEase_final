import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, RefreshCw, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function VerificationBanner() {
  const { user, resendVerification, refreshUser } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setSent(false), 4000)
      return () => clearTimeout(t)
    }
  }, [sent])

  if (!user || user.is_verified || dismissed) return null

  const handleResend = async () => {
    setSending(true)
    const res = await resendVerification(user.email)
    setSending(false)
    if (res.success) {
      setSent(true)
      setTimeout(() => setDismissed(true), 2000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="sticky top-0 z-50"
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-2 text-sm"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f0f18)', borderBottom: '1px solid rgba(var(--accent-rgb),0.2)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={14} className="text-accent-400 flex-shrink-0" />
            <span className="truncate text-purple-200/80">
              Verify your email to activate your account
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResend}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)' }}
            >
              {sending ? (
                <span className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              ) : sent ? (
                <Check size={12} />
              ) : (
                <RefreshCw size={12} />
              )}
              {sent ? 'Sent!' : 'Resend'}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
