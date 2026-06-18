import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight, Eye, Sparkles, TrendingDown, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FadeIn, StaggerChildren, StaggerItem, EmptyState } from '../components/ui'
import { useState } from 'react'
import { generateSlug } from '../components/product/ProductCard'

function WishlistCard({ item, onRemove, onAddToCart }) {
  const [adding, setAdding] = useState(false)

  const product = item?.product || {}
  const currentPrice = product.price || 0
  const regularPrice = item.price_at_save || null
  const hasPriceDropped = regularPrice && regularPrice > currentPrice
  
  const priceDropPercentage = hasPriceDropped 
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) 
    : 0

  const handleAdd = async () => {
    if (!product.id) return
    setAdding(true)
    await onAddToCart(item.product_id)
    setAdding(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden group relative"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {hasPriceDropped && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide shadow-sm"
          style={{ 
            background: 'rgba(34,197,94,0.12)', 
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 0 10px rgba(34,197,94,0.15)'
          }}
        >
          <TrendingDown size={11} className="animate-bounce" />
          <span>Price dropped {priceDropPercentage}%</span>
        </motion.div>
      )}

      {/* Image area */}
      <div className="relative h-44 flex items-center justify-center font-bold text-4xl text-white select-none"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.12))' }}>
        {product.name?.[0] || '?'}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <Link
            to={`/products/${generateSlug(product.name || 'Product', item.product_id)}`}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <Eye size={16} />
          </Link>
          {product.id && (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/80 hover:bg-purple-500 transition-colors text-white cursor-pointer"
            >
              {adding
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ShoppingCart size={16} />
              }
            </button>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.product_id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-white cursor-pointer z-20"
          style={{ background: 'rgba(239,68,68,0.8)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 h-full justify-between">
        <div>
          <Link to={`/products/${generateSlug(product.name || 'Product', item.product_id)}`}>
            <h3 className="font-semibold text-sm leading-tight hover:text-purple-500 transition-colors line-clamp-2 mb-2"
              style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-gradient text-base">₹{(currentPrice).toLocaleString()}</span>
            {hasPriceDropped && (
              <span className="text-xs line-through opacity-40" style={{ color: 'var(--text-muted)' }}>
                ₹{regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t mt-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
          
          <motion.button
            onClick={handleAdd}
            disabled={adding || !product.id}
            whileHover={product.id ? { scale: 1.05 } : {}}
            whileTap={product.id ? { scale: 0.95 } : {}}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
              product.id 
                ? 'btn-primary cursor-pointer' 
                : 'bg-neutral-500/10 text-neutral-400 border border-transparent cursor-not-allowed'
            }`}
          >
            {adding ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : product.id ? (
              <><ShoppingCart size={12} /> Add</>
            ) : (
              'Unavailable'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart()
  const { user } = useAuth()
  const [isBulkAdding, setIsBulkAdding] = useState(false)
  const [particles, setParticles] = useState([])

  if (!user) return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <EmptyState icon={Heart} title="Sign in to view your wishlist"
        description="Save items you love and come back to them anytime."
        action={<Link to="/login" className="btn-primary">Sign in</Link>} />
    </div>
  )

  const inStockItems = wishlist.filter(item => item.product?.id)

  // Particle generation engine logic triggered on master migration match
  const triggerSparkExplosion = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2

    const temporaryParticles = Array.from({ length: 32 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2
      const distance = 40 + Math.random() * 140
      return {
        id: `${Date.now()}-${i}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0.4 + Math.random() * 0.8,
        color: ['#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 5)]
      }
    })

    setParticles(temporaryParticles)
    // Automatically purge node calculations down-stream to keep document layout clean
    setTimeout(() => setParticles([]), 1200)
  }

  const handleMoveAllInStock = async (e) => {
    if (inStockItems.length === 0 || isBulkAdding) return

    setIsBulkAdding(true)
    triggerSparkExplosion(e)

    // Fire off sequential async mapping parameters into implementation pipeline
    try {
      for (const item of inStockItems) {
        await addToCart(item.product_id)
        // Instantly toggle item out of wishlist structure to match migration mechanics
        await toggleWishlist(item.product_id)
      }
    } catch (error) {
      console.error('Error migrating configuration arrays:', error)
    } finally {
      setIsBulkAdding(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      
      {/* Absolute canvas viewport container for rendering spark particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, x: '50vw', y: '40vh', scale: 1 }}
              animate={{ 
                opacity: 0, 
                x: `calc(50vw + ${particle.x}px)`, 
                y: `calc(40vh + ${particle.y}px)`,
                scale: 0,
                rotate: Math.random() * 360
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.1, 0.8, 0.25, 1] }}
              className="absolute w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ color: particle.color, backgroundColor: 'currentColor' }}
            />
          ))}
        </AnimatePresence>
      </div>

      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-2">Saved Items</p>
            <h1 className="section-heading text-3xl md:text-4xl">My Wishlist</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved ({inStockItems.length} available to pull)
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            {inStockItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMoveAllInStock}
                disabled={isBulkAdding}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition-all cursor-pointer select-none relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
              >
                {isBulkAdding ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Moving Workspace Items...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="animate-pulse" />
                    Move In-Stock Items To Cart
                  </>
                )}
              </motion.button>
            )}
            
            <Link to="/products" className="btn-ghost text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              Keep browsing
            </Link>
          </div>
        </div>
      </FadeIn>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse products and tap the heart icon to save items you love."
          action={<Link to="/products" className="btn-primary">Discover Products <ArrowRight size={15} /></Link>}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {wishlist.map(item => (
              <WishlistCard
                key={item.id || item.product_id}
                item={item}
                onRemove={(productId) => toggleWishlist(productId)}
                onAddToCart={addToCart}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
