import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function CartDrawer({ open, onClose }) {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl"
            style={{ background: 'var(--surface)', borderLeft: '1.5px solid var(--border-warm)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gold-gradient">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Your Cart</h2>
                  {cart?.total_quantity > 0 && (
                    <p className="text-xs text-text-muted">{cart.total_quantity} item{cart.total_quantity !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <motion.button 
                onClick={onClose} 
                className="btn-ghost p-2 rounded-lg hover:bg-surface-raised"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Items Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {!cart?.items || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gold-gradient/20"
                  >
                    <ShoppingBag size={32} className="text-accent" />
                  </motion.div>
                  <p className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Your cart is empty</p>
                  <p className="text-sm mb-4 text-text-muted">Add items to get started</p>
                  <Link to="/products" onClick={onClose} className="btn-primary text-xs px-4 py-2">
                    Continue Shopping <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.items.map((item, idx) => {
                    const productData = item.product || {}
                    const productName = productData.name || item.product_name || "Unknown Product"
                    const productPrice = productData.price || item.product_price || 0
                    const initialLetter = productName ? productName[0] : "?"

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-2xl card-premium"
                      >
                        {/* Product Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gold-gradient/20 flex items-center justify-center text-xs font-bold text-accent">
                          {item.product_image || (productData.images && productData.images.length > 0) ? (
                            <img 
                              src={item.product_image || productData.images[0]} 
                              alt={productName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            initialLetter
                          )}
                        </div>

                        {/* Product Meta */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {productName}
                          </p>
                          <p className="text-sm font-bold text-gradient mt-0.5">
                            ₹{productPrice.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 bg-surface-raised rounded-lg p-1">
                          <motion.button
                            onClick={() => item.quantity > 1
                              ? updateCartItem(item.id, item.quantity - 1)
                              : removeFromCart(item.id)
                            }
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-all hover:text-accent"
                            style={{ border: '1px solid var(--border-warm)' }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {item.quantity === 1 ? <Trash2 size={12} className="text-warm-700" /> : <Minus size={12} />}
                          </motion.button>
                          <span className="w-5 text-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-all hover:text-accent"
                            style={{ border: '1px solid var(--border-warm)' }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer Summary */}
            {cart?.items && cart.items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-5 border-t border-subtle"
                style={{ background: 'var(--surface-raised)' }}
              >
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ₹{(cart.subtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span className="text-sage-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between font-display font-bold text-base pt-3 border-t border-subtle" style={{ color: 'var(--text-primary)' }}>
                    <span>Total</span>
                    <span className="text-gradient">₹{(cart.subtotal || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                    <Link
                      to="/cart"
                      onClick={onClose}
                      className="btn-primary w-full justify-center flex items-center gap-2"
                    >
                      View Cart <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={clearCart}
                    className="btn-secondary w-full justify-center text-xs transition-colors hover:text-warm-700"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    Clear Cart
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}