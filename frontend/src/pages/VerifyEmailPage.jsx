import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { verifyEmail, user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    const token = searchParams.get('token')
    if (!token) { setStatus('invalid'); return }
    called.current = true
    verifyEmail(token).then(async res => {
      if (res.success) {
        if (user) await refreshUser()
      }
      setStatus(res.success ? 'success' : 'error')
    })
  }, [searchParams, verifyEmail, user, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f18 0%, #1a0a2e 50%, #0f0f18 100%)' }}
    >
      {/* Animated orbs */}
      {[
        { cx: '20%', cy: '30%', r: '200px', color: 'rgba(168,85,247,0.15)' },
        { cx: '70%', cy: '60%', r: '280px', color: 'rgba(124,58,237,0.1)' },
        { cx: '50%', cy: '80%', r: '150px', color: 'rgba(236,72,153,0.08)' },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.cx, top: orb.cy,
            width: orb.r, height: orb.r,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-sm w-full"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Shop<span className="text-gradient">Ease</span>
          </span>
        </Link>

        {status === 'verifying' && (
          <div className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin inline-block mb-5" />
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="font-display font-bold text-3xl mb-2 text-white">Email Verified!</h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Your account is now active. Start exploring ShopEase.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white' }}
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <XCircle size={36} className="text-red-500" />
            </div>
            <h2 className="font-display font-bold text-3xl mb-2 text-white">Verification Failed</h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              The link is invalid or expired. Try logging in to resend the verification email.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white' }}
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'invalid' && (
          <div className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <XCircle size={36} className="text-red-500" />
            </div>
            <h2 className="font-display font-bold text-3xl mb-2 text-white">Invalid Link</h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              No verification token found in the URL.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white' }}
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
