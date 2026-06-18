import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingCart, Truck, FolderHeart, CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FadeIn, StaggerChildren, StaggerItem, EmptyState } from '../components/ui'
import { useState, useEffect } from 'react'

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [savedSandbox, setSavedSandbox] = useState([])

  // Load configuration weights from sandbox storage state if available
  useEffect(() => {
    const saved = localStorage.getItem(`shopease_sandbox_items_${user?.id || 'guest'}`)
    if (saved) setSavedSandbox(JSON.parse(saved))
  }, [user])

  if (!user) return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <EmptyState icon={ShoppingBag} title="Sign in to view your cart"
        description="Your cart is waiting for you."
        action={<Link to="/login" className="btn-primary">Sign in</Link>} />
    </div>
  )

  // Gamified milestones definitions
  const SHIPPING_THRESHOLD = 2500
  const isFreeShippingEligible = cart.subtotal >= SHIPPING_THRESHOLD
  const amountNeededForFreeShipping = SHIPPING_THRESHOLD - cart.subtotal
  const shippingProgressBarPercentage = Math.min((cart.subtotal / SHIPPING_THRESHOLD) * 100, 100)
  const shippingCost = isFreeShippingEligible ? 0 : 150

  // Sandbox multi-line migration engine
  const handleSaveCartToSandbox = () => {
    if (cart.items.length === 0) return
    
    const contextMapPayload = [...cart.items]
    const updatedSandbox = [...savedSandbox, ...contextMapPayload]
    
    // Write isolated parameters safely into sandbox target bounds
    setSavedSandbox(updatedSandbox)
    localStorage.setItem(`shopease_sandbox_items_${user.id}`, JSON.stringify(updatedSandbox))
    
    // Clear out standard active memory array instantly
    clearCart()
  }

  const handleRestoreSandboxToCart = () => {
    // Optional utility to reverse safe arrays back into layout flow pipeline
    // This allows seamless round-trip moving if users aren't ready to drop
    localStorage.removeItem(`shopease_sandbox_items_${user.id}`)
    setSavedSandbox([])
    window.location.reload() // Reload to synchronize initial context providers safely
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/products" className="btn-ghost p-2 rounded-lg"><ArrowLeft size={16} /></Link>
            <div>
              <h1 className="section-heading text-3xl md:text-4xl">Your Cart</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {cart.total_quantity} {cart.total_quantity === 1 ? 'item' : 'items'} in active workspace
              </p>
            </div>
          </div>

          {/* Sandbox Toggle Controllers */}
          {cart.items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveCartToSandbox}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all shadow-sm cursor-pointer"
              style={{ 
                background: 'rgba(168,85,247,0.06)', 
                borderColor: 'rgba(168,85,247,0.2)',
                color: '#a855f7'
              }}
            >
              <FolderHeart size={14} />
              Save Entire Cart for Later
            </motion.button>
          )}
        </div>
      </FadeIn>

      {cart.items.length === 0 ? (
        <div className="space-y-12">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart workspace is empty"
            description="Looks like you haven't added anything yet. Let's fix that."
            action={<Link to="/products" className="btn-primary">Start Shopping <ArrowRight size={15} /></Link>}
          />

          {/* Render isolated sandbox loop container if items reside inside */}
          {savedSandbox.length > 0 && (
            <FadeIn className="max-w-2xl mx-auto p-6 rounded-2xl border bg-[var(--surface)]" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <FolderHeart size={16} className="text-purple-500" />
                  <h3 className="text-sm font-bold">Saved Sandbox ({savedSandbox.length} items)</h3>
                </div>
                <button 
                  onClick={handleRestoreSandboxToCart}
                  className="text-xs font-semibold text-purple-500 hover:underline cursor-pointer"
                >
                  Restore Sandbox Items
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                These items are kept in an isolated memory footprint linked to your Wishlist session layers.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedSandbox.map((sbItem, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 rounded-xl bg-[var(--bg-secondary)]">
                    <span className="font-medium truncate max-w-[70%] text-[var(--text-primary)]">{sbItem.product_name}</span>
                    <span className="font-bold text-purple-400">₹{sbItem.product_price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Work Array Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {cart.items.length} unique arrays matching layout weights
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-500 transition-colors font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 p-4 rounded-2xl group relative overflow-visible"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {/* Thumb */}
                  <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-xl text-white"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(124,58,237,0.15))' }}>
                    {item.product_name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {item.product_name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          ₹{item.product_price.toLocaleString()} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-400/10 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 rounded-xl overflow-hidden"
                        style={{ border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => item.quantity > 1 ? updateCartItem(item.id, item.quantity - 1) : removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-raised transition-colors cursor-pointer"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.quantity === 1 ? <Trash2 size={11} className="text-red-400" /> : <Minus size={11} />}
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-raised transition-colors cursor-pointer"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="font-bold text-gradient">
                        ₹{(item.product_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <FadeIn className="mt-6">
              <Link to="/products" className="btn-ghost text-sm gap-2">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </FadeIn>
          </div>

          {/* Checkout & Summary Sidebar Component */}
          <FadeIn direction="left">
            <div className="lg:sticky lg:top-24 space-y-4">
              
              {/* Gamified Free Shipping Progress Tracker */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border relative overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`p-2 rounded-xl ${isFreeShippingEligible ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    {isFreeShippingEligible ? <CheckCircle2 size={16} /> : <Truck size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                      {isFreeShippingEligible ? 'Target Unlocked!' : 'Shipping Progress'}
                    </h4>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {isFreeShippingEligible ? (
                        <span className="text-green-500 font-semibold">You unlocked Free Next-Day Delivery!</span>
                      ) : (
                        <>Add <span className="font-bold text-purple-500">₹{amountNeededForFreeShipping.toLocaleString()}</span> more to unlock Free Next-Day Delivery!</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Progress bar architecture container */}
                <div className="w-full h-2 rounded-full relative overflow-hidden bg-[var(--surface-raised)]">
                  <motion.div 
                    className="h-full rounded-full absolute left-0 top-0 transition-all duration-300"
                    style={{
                      width: `${shippingProgressBarPercentage}%`,
                      background: isFreeShippingEligible 
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                        : 'linear-gradient(90deg, #a855f7, #ec4899)',
                      boxShadow: isFreeShippingEligible 
                        ? '0 0 12px rgba(34,197,94,0.4)' 
                        : '0 0 12px rgba(168,85,247,0.4)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgressBarPercentage}%` }}
                  />
                </div>
              </div>

              {/* Order Calculations Matrix */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="p-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>
                </div>

                <div className="p-5 space-y-3" style={{ background: 'var(--surface)' }}>
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>
                        {item.product_name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                      </span>
                      <span className="font-medium flex-shrink-0 ml-2" style={{ color: 'var(--text-primary)' }}>
                        ₹{(item.product_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    {isFreeShippingEligible ? (
                      <span className="text-green-500 font-semibold flex items-center gap-1">
                        Free
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-primary)' }}>₹{shippingCost.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Tax (18% GST)</span>
                    <span style={{ color: 'var(--text-primary)' }}>₹{Math.round(cart.subtotal * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <span>Total</span>
                    <span className="text-gradient text-lg">
                      ₹{Math.round((cart.subtotal + shippingCost) * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-5" style={{ background: 'var(--bg-secondary)' }}>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="btn-primary w-full justify-center py-3.5 text-base cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </motion.button>
                  <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    Secure checkout • 256-bit SSL
                  </p>
                </div>
              </div>

              {/* Promo code */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Promo Code</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter code…" className="input-field text-xs py-2.5 flex-1" />
                  <button className="btn-secondary text-xs px-4 py-2.5 cursor-pointer">Apply</button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  )
}