import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsApi } from '../api'

export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // BULLETPROOF REGEX: Extract ONLY the database ID digits (\d+) found at the very end ($) of the slug string
  const match = productSlug ? productSlug.match(/\d+$/) : null
  const idFromSlug = match ? parseInt(match[0], 10) : null

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true)
        setError(null)

        if (!idFromSlug || isNaN(idFromSlug)) {
          throw new Error('Could not resolve a valid numerical record ID from the web path.')
        }

        const { data } = await productsApi.get(idFromSlug)
        
        // Handle array wrap variations securely if your individual lookup endpoint wraps objects in an array structure
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setProduct(data[0])
            setCurrentImageIndex(0)
          } else {
            throw new Error('The product collection response returned empty.')
          }
        } else {
          setProduct(data)
          setCurrentImageIndex(0)
        }
      } catch (err) {
        console.error("Product fetch breakdown trace:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (idFromSlug) {
      fetchProductDetails()
    } else {
      setLoading(false)
      setError("No visible application identification index supplied inside routing sequence.")
    }
  }, [idFromSlug, productSlug])

  // 🟢 FIXED: Maps parameters exactly to what CartContext expects to ensure guest-cart safety
  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    try {
      await addToCart(
        product.id, 
        1, 
        product.name || product.product_name || 'Product', 
        product.price || product.product_price || 0
      )
    } catch (err) {
      console.error("Failed to add item to context layer:", err)
    } finally {
      setAdding(false)
    }
  }

  // Get all images for the product safely
  const productImages = product?.images?.length > 0 
    ? product.images 
    : product?.image_url 
      ? [product.image_url] 
      : [`https://ui-avatars.com/api/?name=${encodeURIComponent(product?.name || 'Product')}&size=600&background=a855f7&color=fff&bold=true&font-size=0.2`]

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center min-h-[50vh] flex flex-col justify-center items-center bg-background">
        <h2 className="text-xl font-bold mb-2 text-primary">Product Not Found</h2>
        <p className="text-muted max-w-md mb-6">{error || 'This item structure may have been removed or modified.'}</p>
        <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    )
  }

  // 🟢 SAFE FALLBACK: Avoid runtime failure if isWishlisted isn't loaded/ready
  const wishlisted = typeof isWishlisted === 'function' ? isWishlisted(product.id) : false

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-background min-h-screen text-primary">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface border border-border rounded-[24px] p-6 md:p-8 shadow-sm">
        {/* Left: Product Image Stage */}
        <div className="bg-surface-raised rounded-2xl p-8 flex items-center justify-center border border-subtle min-h-[350px] max-h-[450px] overflow-hidden relative">
          {/* Navigation Buttons */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-raised transition-all shadow-lg z-10"
              >
                <ChevronLeft size={20} className="text-primary" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-raised transition-all shadow-lg z-10"
              >
                <ChevronRight size={20} className="text-primary" />
              </button>
            </>
          )}

          {/* Main Image */}
          <img 
            src={productImages[currentImageIndex]} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain select-none transition-transform duration-300 hover:scale-105"
          />

          {/* Thumbnail Indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-purple-500 scale-125' 
                      : 'bg-surface border border-border hover:bg-surface-raised'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Metadata Details Block */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">
              {product.category_name || 'Electronics'}
            </span>
            {product.subcategory_name && (
              <span className="text-xs uppercase font-bold tracking-wider text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full ml-2">
                {product.subcategory_name}
              </span>
            )}
            
            <h1 className="font-display font-bold text-2xl md:text-3xl mt-4 text-primary leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className="fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs text-muted font-medium">(4.8 / 5.0 Rating)</span>
            </div>

            <div className="mt-6 text-3xl font-display font-bold text-gradient">
              ₹{product.price ? product.price.toLocaleString() : '0'}
            </div>

            <p className="mt-6 text-sm text-secondary leading-relaxed border-t border-subtle pt-6">
              {product.description || 'No specialized description payload has been provided for this product row configuration inside the database system.'}
            </p>
          </div>

          {/* Action Interface Controls Row */}
          <div className="mt-8 border-t border-subtle pt-6">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 py-3 justify-center text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> 
                    Add to Shopping Cart
                  </>
                )}
              </button>

              {user && typeof toggleWishlist === 'function' && (
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center transition-all hover:bg-surface-raised group"
                >
                  <Heart 
                    size={20} 
                    fill={wishlisted ? 'var(--neon)' : 'none'} 
                    stroke={wishlisted ? 'var(--neon)' : 'var(--text-primary)'}
                    className="transition-transform group-hover:scale-110 active:scale-95"
                  />
                </button>
              )}
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-[11px] text-muted font-medium">
              <div className="flex items-center gap-2"><Truck size={14} className="text-purple-500" /> Free Delivery</div>
              <div className="flex items-center gap-2"><RotateCcw size={14} className="text-purple-500" /> 7-Day Replacement</div>
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-purple-500" /> Safe Checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}