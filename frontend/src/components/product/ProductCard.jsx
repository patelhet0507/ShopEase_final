import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Eye, Star, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useState, useRef } from 'react'

export const generateSlug = (name, id) => {
  return name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `product-${id}`
}

function productImage(idOrSlug, name) {
  const colors = [
    ['8B7355', 'A68B6B'], ['C4A87C', 'D4BFA0'], ['7A6341', '9B845E'],
    ['B8A080', 'D4C0A8'], ['5E4D36', '7A6B50'], ['A39074', 'C4B49C'],
    ['8C7A60', 'A89880'], ['6B5B44', '8A7A62']
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

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [adding, setAdding] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const cardRef = useRef(null)

  const wishlisted = isWishlisted?.(Number(product.id)) || false
  const productImages = product?.images?.length > 0
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : [productImage(product.id, product.name || 'Product')]

  const activeImageUrl = productImages[currentImgIndex]

  const discount = product?.compare_price && product?.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const stock = product?.stock ?? null
  const inStock = stock === null || stock > 0
  const lowStock = stock !== null && stock > 0 && stock <= 5
  const avgRating = product?.rating || product?.average_rating || 0

  const handlePrevImage = (e) => {
    e.preventDefault(); e.stopPropagation()
    setImageLoaded(false)
    setCurrentImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e.preventDefault(); e.stopPropagation()
    setImageLoaded(false)
    setCurrentImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
  }

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation()
    setAdding(true)
    try {
      await addToCart(Number(product.id), 1, { name: product.name, price: product.price })
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    await toggleWishlist(product.id)
  }

  return (
    <motion.div
      className="h-full"
      ref={cardRef}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <div className="card-premium h-full flex flex-col overflow-hidden relative group">
        {/* Image area */}
        <div className="relative overflow-hidden" style={{ background: 'var(--surface-raised)', minHeight: 200, maxHeight: 220 }}>
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}

          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              -{discount}%
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
              <span className="text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>Sold Out</span>
            </div>
          )}

          <button onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Heart size={13} fill={wishlisted ? 'var(--accent)' : 'none'}
              stroke={wishlisted ? 'var(--accent)' : 'var(--text-muted)'} />
          </button>

          <img
            key={currentImgIndex}
            src={activeImageUrl}
            alt={product.name}
            className={`w-full h-full object-contain p-5 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {productImages.length > 1 && inStock && (
            <>
              <button onClick={handlePrevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <ChevronLeft size={12} />
              </button>
              <button onClick={handleNextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <ChevronRight size={12} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {productImages.map((_, dotIdx) => (
                  <span key={dotIdx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === currentImgIndex ? 'scale-110' : ''}`}
                    style={{ background: dotIdx === currentImgIndex ? 'var(--accent)' : 'var(--text-muted)' }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-h-[18px]">
            {product.category_name && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>
                {product.category_name}
              </span>
            )}
            {lowStock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(234,179,8,0.12)', color: '#ca8a04' }}>
                Only {stock} left
              </span>
            )}
          </div>

          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={10}
                style={{ color: s <= avgRating ? '#D4A574' : 'var(--text-muted)' }}
                className={s <= avgRating ? 'star-filled fill-current' : ''} />
            ))}
            {inStock ? (
              <span className="ml-1.5 text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {lowStock ? 'Low Stock' : 'In Stock'}
              </span>
            ) : (
              <span className="ml-1.5 text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>Out of Stock</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2"
            style={{ borderTop: '1px solid var(--border-warm)' }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product?.compare_price && (
                <span className="text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>
                  ₹{Number(product.compare_price).toLocaleString()}
                </span>
              )}
              <span className="font-display font-bold text-base text-gradient">₹{Number(product?.price || 0).toLocaleString()}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--accent)' }}>
              <ArrowUpRight size={14} />
            </div>
          </div>

          <div className="flex gap-2 mt-0.5">
            {inStock && (
              <button onClick={handleAddToCart} disabled={adding}
                className="btn-primary flex-1 justify-center text-xs py-2.5">
                {adding ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart size={12} /> Add</>
                )}
              </button>
            )}
            <Link to={`/product/${product.slug || generateSlug(product.name, product.id)}`}
              className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2.5 flex-1"
              onClick={e => e.stopPropagation()}>
              <Eye size={12} /> View
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}