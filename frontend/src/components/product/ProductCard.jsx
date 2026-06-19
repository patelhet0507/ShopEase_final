import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Eye, Star, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useState, useRef } from 'react'

export const generateSlug = (name, id) => `p-${id}`;

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
    <div className="h-full" ref={cardRef}>
      <div className="card-premium h-full flex flex-col overflow-hidden group/card">
        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ background: 'var(--surface-raised)', minHeight: 180, maxHeight: 200 }}>
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            key={currentImgIndex}
            src={activeImageUrl}
            alt={product.name}
            className={`w-full h-full object-contain p-4 transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Image nav */}
          {productImages.length > 1 && (
            <>
              <button onClick={handlePrevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <ChevronLeft size={12} />
              </button>
              <button onClick={handleNextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <ChevronRight size={12} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {productImages.map((_, dotIdx) => (
                  <span key={dotIdx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === currentImgIndex ? 'bg-accent scale-110' : ''}`}
                    style={{ background: dotIdx === currentImgIndex ? 'var(--accent)' : 'var(--text-muted)' }} />
                ))}
              </div>
            </>
          )}

          {/* Wishlist */}
          {user && (
            <button onClick={handleWishlist}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Heart size={13} fill={wishlisted ? 'var(--accent)' : 'none'} stroke={wishlisted ? 'var(--accent)' : 'var(--text-muted)'} />
            </button>
          )}

          {/* Quick view */}
          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onQuickView?.(product); }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Maximize2 size={11} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-h-[20px]">
            {product.category_name && (
              <span className="badge-warm text-[10px] px-2 py-0.5">{product.category_name}</span>
            )}
            {product.subcategory_name && (
              <span className="badge-sage text-[10px] px-2 py-0.5">{product.subcategory_name}</span>
            )}
          </div>

          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={10} className="star-filled fill-current" style={{ color: '#C4A87C' }} />
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <span className="font-display font-bold text-base text-gradient">₹{Number(product?.price || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {user && (
              <button onClick={handleAddToCart} disabled={adding}
                className="btn-primary flex-1 justify-center text-xs py-2.5">
                {adding ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart size={12} /> Add</>
                )}
              </button>
            )}
            <Link to={`/p/${product.view_token}`}
              className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2.5 flex-1"
              onClick={e => e.stopPropagation()}>
              <Eye size={12} /> View
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
