import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { FloatingInput } from '../components/ui'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate('/')
    } else {
      setApiError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel – decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0f18 0%, #1a0a2e 50%, #0f0f18 100%)' }}>
        <div className="absolute inset-0">
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
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">ShopEase</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-display font-bold text-5xl text-white leading-tight mb-4">
              The future of<br />
              <span className="text-gradient">shopping</span>
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Discover curated products with a seamless experience built for the modern shopper.
            </p>
          </motion.div>

          {/* Floating product cards */}
          <div className="mt-16 space-y-3">
            {['Premium Headphones', 'Minimal Sneakers', 'Smart Watch'].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.4), rgba(124,58,237,0.2))` }}>
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Just added</p>
                </div>
                <div className="ml-auto">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-amber-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Shop<span className="text-gradient">Ease</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-500 font-medium hover:text-purple-400 transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={16} />
              {apiError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setApiError('') }}
              error={errors.email}
              required
            />
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setApiError('') }}
              error={errors.password}
              required
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full justify-center mt-2 py-3.5"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
