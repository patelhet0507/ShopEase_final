import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { FloatingInput } from '../components/ui'

const PERKS = [
  'Track orders & manage returns',
  'Save items to your wishlist',
  'Faster checkout, every time',
  'Exclusive member-only deals',
]

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/products'
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await register(form.email, form.password)
    if (result.success) navigate(from, { replace: true })
    else setApiError(result.error)
  }

  return (
    <div className="min-h-screen flex">
      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Shop<span className="text-gradient">Ease</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Create account</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-purple-500 font-medium hover:text-accent-400 transition-colors">
                Sign in
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
            <FloatingInput id="email" label="Email address" type="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email} required />
            <FloatingInput id="password" label="Password" type="password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password} required />
            <FloatingInput id="confirm" label="Confirm password" type="password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              error={errors.confirm} required />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full justify-center mt-2 py-3.5"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create account <ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f18 0%, #1a0a2e 50%, #0f0f18 100%)' }}>
        <div className="absolute inset-0">
          {[
            { cx: '30%', cy: '40%', r: '250px', color: 'rgba(var(--accent-rgb),0.12)' },
            { cx: '65%', cy: '55%', r: '200px', color: 'rgba(var(--accent-light-rgb),0.08)' },
          ].map((orb, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ left: orb.cx, top: orb.cy, width: orb.r, height: orb.r, background: `radial-gradient(circle, ${orb.color}, transparent 70%)`, transform: 'translate(-50%, -50%)' }}
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i }} />
          ))}
        </div>

        <div className="relative z-10 px-16 py-12">
          <h2 className="font-display font-bold text-4xl text-white mb-4 leading-tight">
            Join <span className="text-gradient">thousands</span> of happy shoppers
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Everything you need to shop smarter, in one place.
          </p>

          <div className="space-y-4">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(var(--accent-rgb),0.2)', border: '1px solid rgba(var(--accent-rgb),0.3)' }}>
                  <Check size={13} className="text-accent-400" />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
