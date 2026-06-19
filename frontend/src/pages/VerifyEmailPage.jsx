import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('invalid'); return }
    verifyEmail(token).then(res => {
      setStatus(res.success ? 'success' : 'error')
    })
  }, [searchParams, verifyEmail])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>ShopEase</span>
        </Link>

        {status === 'verifying' && (
          <div>
            <span className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin inline-block mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Email Verified!</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Your account is now active. You can log in and start shopping.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Verification Failed</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The link is invalid or expired. Try logging in to resend the verification email.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Go to Login
            </Link>
          </div>
        )}

        {status === 'invalid' && (
          <div>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Invalid Link</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>No verification token found in the URL.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Go to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
