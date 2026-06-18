import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Eye, Star, Maximize2, Sparkles } from 'lucide-react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useState, useRef } from 'react'

// Dynamic Slug Generator Utility
export const generateSlug = (name, id) => {
  if (!name) return String(id);
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove special characters
    .replace(/[\s_-]+/g, '-')    // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') + `-${id}`; // Append ID for guaranteed uniqueness
}

function productImage(idOrSlug, name) {
  const colors = [
    ['a855f7', '7c3aed'], ['111118', '1e1e2a'], ['7c3aed', 'ec4899'], ['16161f', 'a855f7'],
    ['a855f7', '16161f'], ['7c3aed', '111118'], ['ec4899', '7c3aed'], ['1e1e2a', 'a855f7']
  ]
  const stringRep = String(idOrSlug);
  let hash = 0;
  for (let i = 0; i < stringRep.length; i++) {
    hash = stringRep.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  const pair = colors[index];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=${pair[0]}&color=fff&bold=true&font-size=0.3`
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  }),
}

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.4, ease: 'easeInOut' } },
}

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [adding, setAdding] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [particles, setParticles] = useState([])
  const cardRef = useRef(null)

  const wishlisted = isWishlisted ? (isWishlisted(product.slug) || isWishlisted(product.id)) : false
  const activeImageUrl = product.image_url || productImage(product.id, product.name)

  const spotlightX = useMotionValue(0)
  const spotlightY = useMotionValue(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })
  
  const tiltX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12])
  const tiltY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    spotlightX.set(e.clientX - rect.left)
    spotlightY.set(e.clientY - rect.top)

    const mouseX = e.clientX - rect.left - width / 2
    const mouseY = e.clientY - rect.top - height / 2
    x.set(mouseX / width)
    y.set(mouseY / height)
  }

  const handleMouseLeave = () => {
    setHovering(false)
    x.set(0)
    y.set(0)
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setAdding(true)

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      window.dispatchEvent(
        new CustomEvent('trigger-fly-cart', {
          detail: { startRect: rect, image: activeImageUrl }
        })
      )
    }

    const generatedParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      targetX: (Math.random() - 0.5) * 160,
      targetY: -100 - Math.random() * 120,
      scale: Math.random() * 0.4 + 0.6,
      color: ['#a855f7', '#7c3aed', '#ec4899', '#22c55e', '#3b82f6'][i % 5]
    }))
    setParticles(generatedParticles)
    
    await addToCart(product.id, 1)
    setAdding(false)
    setTimeout(() => setParticles([]), 800)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggleWishlist(product.id)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="h-full select-none"
    >
      <motion.div 
        ref={cardRef}
        className="perspective-1000 h-80 w-full cursor-pointer relative group/card"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: tiltX, rotateY: tiltY }}
      >
        {user && (
          <motion.button
            onClick={handleWishlist}
            className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-50 glass shadow-md backdrop-blur-md hover:bg-surface-raised"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div animate={{ scale: wishlisted ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Heart 
                size={15} 
                fill={wishlisted ? 'var(--neon)' : 'none'} 
                stroke={wishlisted ? 'var(--neon)' : 'var(--text-primary)'} 
              />
            </motion.div>
          </motion.button>
        )}

        <motion.div 
          style={{ borderRadius: '24px' }}
          className={`relative w-full h-full transform-style-3d transition-shadow duration-500 overflow-visible rounded-[24px] ${
            hovering ? 'shadow-2xl shadow-purple-500/10' : 'shadow-md shadow-black/[0.02]'
          }`}
          animate={{ rotateY: hovering ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* FRONT FACE */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] overflow-hidden flex flex-col justify-between"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: useTransform(
                  [spotlightX, spotlightY],
                  ([latestX, latestY]) => `radial-gradient(140px circle at ${latestX}px ${latestY}px, var(--neon-glow), transparent 80%)`
                )
              }}
            />

            <div className="relative h-40 overflow-hidden bg-surface-raised flex-shrink-0">
              {!imageLoaded && <div className="absolute inset-0 shimmer" />}
              <motion.img
                src={activeImageUrl}
                alt={product.name}
                className={`w-full h-full object-contain p-4 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                variants={imageVariants}
                initial="rest"
                animate={hovering ? "hover" : "rest"}
                onLoad={() => setImageLoaded(true)}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/[0.04] to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: hovering ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                {product.category_name && (
                  <span className="badge-purple backdrop-blur-sm shadow-sm font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {product.category_name}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
                className="absolute bottom-3 left-3 w-8 h-8 rounded-full glass opacity-0 group-hover/card:opacity-100 shadow-sm flex items-center justify-center transition-opacity duration-200 hover:scale-105 z-20"
              >
                <Maximize2 size={13} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold tracking-wider mb-1 uppercase text-muted">
                  {product.subcategory_name || product.category_name || 'Product'}
                </p>
                <h3 className="font-display font-semibold text-xs sm:text-sm leading-tight line-clamp-2 h-8 text-primary">
                  {product.name}
                </h3>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-subtle">
                <span className="font-display font-bold text-base text-gradient">
                  ₹{product.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={10} className="star-filled fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] p-5 flex flex-col justify-between overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, var(--surface), var(--surface-raised))',
              border: '1px solid var(--border)',
            }}
          >
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: useTransform(
                  [spotlightX, spotlightY],
                  ([latestX, latestY]) => `radial-gradient(140px circle at ${latestX}px ${latestY}px, var(--neon-glow), transparent 80%)`
                )
              }}
            />

            <div className="overflow-hidden flex-1 flex flex-col justify-start relative z-20 pt-7">
              <h3 className="font-display font-bold text-sm mb-1 pl-9 truncate text-primary">
                {product.name}
              </h3>
              <p className="text-xs leading-relaxed line-clamp-3 mb-3 text-secondary">
                {product.description || 'No description provided for this item.'}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
                {product.category_name && (
                  <span className="badge-purple font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {product.category_name}
                  </span>
                )}
                {product.subcategory_name && (
                  <span className="badge-orange font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {product.subcategory_name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-subtle flex-shrink-0 relative z-20">
              <div className="text-center">
                <span className="font-display font-bold text-lg text-gradient">₹{product.price.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-2 relative overflow-visible">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible z-50">
                  <AnimatePresence>
                    {particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: particle.scale }}
                        animate={{ x: particle.targetX, y: particle.targetY, opacity: 0, scale: 0.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                        className="absolute w-2.5 h-2.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: particle.color }}
                      >
                        <Sparkles size={6} className="text-white opacity-40 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {user && (
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="btn-primary flex-1 justify-center text-xs py-2 relative overflow-visible"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0, scale: 0.98 }}
                  >
                    {adding ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><ShoppingCart size={13} /> Add</>
                    )}
                  </motion.button>
                )}
                
                <motion.div className="flex-1" whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.98 }}>
                  {/* GENERATED SLUG INTEGRATION HERE */}
                  <Link
                    to={`/products/${generateSlug(product.name, product.id)}`}
                    className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2 w-full relative z-20"
                    onClick={e => e.stopPropagation()}
                  >
                    <Eye size={13} /> View
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
