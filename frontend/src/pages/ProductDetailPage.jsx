import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight, MessageSquare, Share2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsApi, reviewsApi } from '../api'
import ProductVariants from '../components/product/ProductVariants'

export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [copied, setCopied] = useState(false)

  const slug = productSlug || ''

  useEffect(() => {
    let cancelled = false
    async function fetchProductDetails() {
      try {
        setLoading(true)
        setError(null)
        if (!slug) { throw new Error('Missing product slug.') }

        const { data } = await productsApi.getBySlug(slug)
        if (cancelled) return

        setProduct(Array.isArray(data) ? data[0] : data)
        setCurrentImageIndex(0)
      } catch (err) {
        if (!cancelled) {
          console.error("Product fetch error:", err.message)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (slug) { fetchProductDetails() }
    else { setLoading(false); setError("Missing product slug.") }

    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    async function fetchReviews() {
      if (!product?.id) return
      const pid = Number(product.id)
      if (!pid) return
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          reviewsApi.list(pid),
          reviewsApi.getStats(pid)
        ])
        setReviews(reviewsRes.data || [])
        setReviewStats(statsRes.data || null)
      } catch (err) {
        console.error('Error fetching reviews:', err)
      }
    }
    fetchReviews()
  }, [product?.id])

  // 🟢 FIXED: Maps parameters exactly to what CartContext expects (productId, quantity)
  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    try {
      const cleanId = parseInt(product.id, 10)
      if (isNaN(cleanId)) {
        console.error("❌ Add to cart failed: product.id is missing or invalid numerical form")
        return
      }
      await addToCart(cleanId, 1)
    } catch (err) {
      console.error("Failed to add item to context layer:", err)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    setBuying(true)
    try {
      const cleanId = parseInt(product.id, 10)
      if (isNaN(cleanId)) return
      await addToCart(cleanId, 1)
      navigate('/checkout')
    } catch (err) {
      console.error("Buy now failed:", err)
      setBuying(false)
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

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user || !product) return
    
    setSubmittingReview(true)
    try {
      await reviewsApi.create(product.id, {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      })
      // Refresh reviews
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsApi.list(product.id),
        reviewsApi.getStats(product.id)
      ])
      setReviews(reviewsRes.data || [])
      setReviewStats(statsRes.data || null)
      setNewReview({ rating: 5, title: '', comment: '' })
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
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

      {/* 🟢 FIXED: 'border border-border' class removed from line below to drop outer outline border framework seamlessly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface rounded-[24px] p-6 md:p-8 shadow-sm">
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
                  <Star key={s} size={16} style={{ color: s <= (reviewStats?.average_rating || 4.8) ? '#f59e0b' : 'var(--text-muted)' }} className={s <= (reviewStats?.average_rating || 4.8) ? 'fill-amber-500' : ''} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>({reviewStats?.average_rating?.toFixed(1) || '4.8'} / 5.0 Rating, {reviewStats?.total_reviews || reviews.length} reviews)</span>
            </div>

            <div className="mt-6 text-3xl font-display font-bold text-gradient">
              ₹{product.price ? product.price.toLocaleString() : '0'}
            </div>

            <p className="mt-6 text-sm text-secondary leading-relaxed border-t border-subtle pt-6">
              {product.description || 'No specialized description payload has been provided for this product row configuration inside the database system.'}
            </p>

            {/* Variants */}
            <ProductVariants
              product={product}
              onVariantSelect={setSelectedVariants}
            />
          </div>

          {/* Action Interface Controls Row */}
          <div className="mt-8 border-t border-subtle pt-6">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 py-3 justify-center text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> 
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="btn-secondary flex-1 py-3 justify-center text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                {buying ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    🚀 Buy Now
                  </>
                )}
              </button>

              {user && typeof toggleWishlist === 'function' && (
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center transition-all hover:bg-surface-raised group shrink-0"
                >
                  <Heart 
                    size={20} 
                    fill={wishlisted ? 'var(--accent)' : 'none'} 
                    stroke={wishlisted ? 'var(--accent)' : 'var(--text-primary)'}
                    className="transition-transform group-hover:scale-110 active:scale-95"
                  />
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="relative w-12 h-12 rounded-xl border border-border flex items-center justify-center transition-all hover:bg-surface-raised group shrink-0"
                title="Share product"
              >
                <Share2 size={18} className="transition-transform group-hover:scale-110 active:scale-95" style={{ color: 'var(--text-secondary)' }} />
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    Link copied!
                  </span>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="w-12 h-12 rounded-xl border border-border flex items-center justify-center transition-all hover:bg-surface-raised group shrink-0 text-lg"
                title="Buy now"
              >
                🛒
              </button>
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

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 mt-8">
        <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MessageSquare size={24} className="text-purple-500" />
              Customer Reviews
            </h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {showReviewForm && user && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 rounded-xl"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Write Your Review</h3>
              <div className="mb-4">
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        style={{ color: star <= newReview.rating ? '#f59e0b' : 'var(--text-muted)' }}
                        className={star <= newReview.rating ? 'fill-amber-500' : ''}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Great product!"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows="4"
                  required
                  className="w-full px-4 py-3 rounded-lg transition font-medium resize-none"
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)' }}>
                        {review.user_email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{review.user_email?.split('@')[0] || 'User'}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(review.created_at).toLocaleDateString()}</p>
                          {(review.user_exp || 0) >= 150 && (
                            <span className="text-xs flex items-center gap-0.5 font-medium" style={{ color: '#22c55e' }}>
                              <ShieldCheck size={10} /> Verified Reviewer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          style={{ color: star <= review.rating ? '#f59e0b' : 'var(--text-muted)' }}
                          className={star <= review.rating ? 'fill-amber-500' : ''}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}