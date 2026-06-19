import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShoppingBag, Heart, Sun, Moon, Menu, X, LayoutDashboard, LogOut, Zap, User, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'Shop' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  
  // 🟢 FIXED: Grab cartCount from your unified context hooks layer safely
  const { cart, setCartOpen } = useCart()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [bounceBadge, setBounceBadge] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // 🟢 FIXED: Fallback safely using optional chaining to avoid crashing when cart is null
  const currentQuantity = cart?.total_quantity || 0

  // Trigger brief micro-bounce when context quantity scales up
  useEffect(() => {
    if (currentQuantity === 0) return
    setBounceBadge(true)
    const t = setTimeout(() => setBounceBadge(false), 300)
    return () => clearTimeout(t)
  }, [currentQuantity])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-lg shadow-black/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Shop<span className="text-gradient">Ease</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-surface-raised text-primary'
                    : 'text-secondary hover:text-primary hover:bg-surface-raised'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {user && (
              <>
                <Link to="/wishlist" className="btn-ghost p-2 rounded-lg relative">
                  <Heart size={18} />
                </Link>
                
                {/* ID Target Node & Bounce Tracker Attached */}
                <motion.button
                  id="cart-icon-target"
                  onClick={() => setCartOpen(true)}
                  className="btn-ghost p-2 rounded-lg relative"
                  animate={{ scale: bounceBadge ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ShoppingBag size={18} />
                  {currentQuantity > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                    >
                      {currentQuantity > 9 ? '9+' : currentQuantity}
                    </motion.span>
                  )}
                </motion.button>
              </>
            )}

            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-surface-raised"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {user?.email ? user.email.split('@')[0] : 'user'}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl glass-strong shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                        <span className={`badge-${user?.role === 'admin' ? 'purple' : 'green'} mt-1`}>
                          {user?.role || 'customer'}
                        </span>
                      </div>
                      <div className="p-1.5">
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-all">
                            <LayoutDashboard size={15} />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-all">
                          <User size={15} />
                          Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-all">
                          <Package size={15} />
                          My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-all">
                          <Heart size={15} />
                          Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Get started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="btn-ghost p-2 md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-strong border-t overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="p-4 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:text-primary hover:bg-surface-raised transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}