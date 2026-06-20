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

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #e11d48, #be123c)',
  'linear-gradient(135deg, #6366f1, #4f46e5)',
]

function pickGradient(categoryName, index) {
  if (categoryName) {
    let hash = 0
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
  }
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length]
}

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [adding, setAdding] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const cardRef = useRef(null)

  const wishlisted = isWishlisted?.(Number(product.id)) || false
  const gradient = pickGradient(product?.category_name, index)

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
    if (!user) return
    setAdding(true)
    try {
      await addToCart(Number(product.id), 1)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    await toggleWishlist(product.id)
  }

  return (
    <motion.div
      className="h-full"
      ref={cardRef}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div
        className="h-full rounded-2xl overflow-hidden relative group"
        style={{ background: gradient }}
      >
        {/* Decorative circles */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/5" />

        {/* Image container */}
        <div className="relative z-10 p-4 pb-0">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
            {!imageLoaded && <div className="absolute inset-0 shimmer" />}

            {discount > 0 && (
              <div className="absolute top-2 left-2 z-10 bg-white/25 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                -{discount}%
              </div>
            )}

            {!inStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                <span className="bg-white/90 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">Sold Out</span>
              </div>
            )}

            {user && (
              <button onClick={handleWishlist}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <Heart size={13} fill={wishlisted ? '#fff' : 'none'} stroke="#fff" />
              </button>
            )}

            <img
              key={currentImgIndex}
              src={activeImageUrl}
              alt={product.name}
              className={`w-full h-full object-contain p-3 transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onLoad={() => setImageLoaded(true)}
            />

            {productImages.length > 1 && inStock && (
              <>
                <button onClick={handlePrevImage}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft size={12} />
                </button>
                <button onClick={handleNextImage}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={12} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {productImages.map((_, dotIdx) => (
                    <span key={dotIdx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === currentImgIndex ? 'bg-white scale-110' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 pt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap min-h-[18px]">
            {product.category_name && (
              <span className="text-[10px] font-semibold text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
                {product.category_name}
              </span>
            )}
            {lowStock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90">
                Only {stock} left
              </span>
            )}
          </div>

          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 text-white">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={10}
                style={{ color: s <= avgRating ? '#fff' : 'rgba(255,255,255,0.35)' }}
                className={s <= avgRating ? 'fill-white' : ''} />
            ))}
            {inStock ? (
              <span className="ml-1.5 text-[9px] font-medium text-white/70">
                {lowStock ? 'Low Stock' : 'In Stock'}
              </span>
            ) : (
              <span className="ml-1.5 text-[9px] font-medium text-white/70">Out of Stock</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 mt-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product?.compare_price && (
                <span className="text-[11px] line-through text-white/50">
                  ₹{Number(product.compare_price).toLocaleString()}
                </span>
              )}
              <span className="font-display font-bold text-base text-white">₹{Number(product?.price || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-1">
            {user && inStock && (
              <button onClick={handleAddToCart} disabled={adding}
                className="flex-1 justify-center text-xs py-2 rounded-xl font-semibold backdrop-blur-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                {adding ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  <span className="flex items-center justify-center gap-1.5"><ShoppingCart size={12} /> Add</span>
                )}
              </button>
            )}
            <Link to={`/product/${product.slug || generateSlug(product.name, product.id)}`}
              className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-semibold backdrop-blur-sm transition-all flex-1"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
              onClick={e => e.stopPropagation()}>
              <Eye size={12} /> View
            </Link>
          </div>
        </div>

        {/* Arrow indicator on hover */}
        <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ArrowUpRight size={14} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}