import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useState } from 'react'

// ─── Skeleton ────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

// ─── StarRating ─────────────────────────────────────────
export function StarRating({ rating, size = 14, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-0.5">
      {stars.map(s => (
        <button
          key={s}
          onClick={() => interactive && onChange?.(s)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            size={size}
            className={s <= rating ? 'star-filled fill-amber-400' : 'star-empty'}
            fill={s <= rating ? '#f59e0b' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

// ─── FadeIn ─────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerChildren ────────────────────────────────────
export function StaggerChildren({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={{
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Badge ───────────────────────────────────────────────
export function Badge({ children, variant = 'purple' }) {
  return <span className={`badge-${variant}`}>{children}</span>
}

// ─── Empty State ─────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(var(--accent-rgb),0.1)' }}>
        <Icon size={28} className="text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      {action}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 shadow-2xl"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`w-full ${sizes[size]} rounded-2xl shadow-2xl`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-0 shrink-0">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
              <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Toast ───────────────────────────────────────────────
export function Toast({ message, type = 'success', visible }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-purple-500',
  }
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl ${colors[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── FloatingLabel Input ────────────────────────────────
export function FloatingInput({ id, label, type = 'text', value, onChange, error, required }) {
  const [focused, setFocused] = useState(false)
  const floating = focused || value
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="w-full px-4 pt-6 pb-2.5 rounded-xl text-sm outline-none transition-all duration-200 peer"
        style={{
          background: 'var(--surface-raised)',
          border: `1px solid ${error ? '#ef4444' : focused ? 'rgba(var(--accent-rgb),0.5)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
          boxShadow: focused ? `0 0 0 3px rgba(var(--accent-rgb),0.1)` : 'none',
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 transition-all duration-200 pointer-events-none font-medium"
        style={{
          top: floating ? '8px' : '50%',
          transform: floating ? 'none' : 'translateY(-50%)',
          fontSize: floating ? '10px' : '14px',
          color: floating ? (focused ? 'var(--accent)' : 'var(--text-muted)') : 'var(--text-muted)',
        }}
      >
        {label}
      </label>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  )
}