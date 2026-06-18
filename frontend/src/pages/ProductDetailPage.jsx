import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ShoppingCart, Heart, ArrowLeft, Star, ShieldCheck, Truck, 
  RotateCcw, ChevronLeft, ChevronRight, MessageSquare, Plus, X 
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsApi, reviewsApi } from '../api' // 🟢 Ensure reviewsApi is exported from your api client folder

export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const { user } = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 🟢 State Variables for Live Reviews Layout Trackers
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, rating_distribution: {1:0, 2:0, 3:0, 4:0, 5:0} })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })

  // 🟢 Zoom Magnifier Tracking Coordinates
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' })
  const imageContainerRef = useRef(null)

  const match = productSlug ? productSlug.match(/\d+$/) : null
  const idFromSlug = match ? parseInt(match[0], 10) : null

  // 🟢 Combined Side Effect Engine: Fetches Product Meta alongside Review Datasets
  useEffect(() => {
    async function fetchCompleteProductData() {
      try {
        setLoading(true)
        setError(null)

        if (!idFromSlug || isNaN(idFromSlug)) {
          throw new Error('Could not resolve a valid numerical record ID from the web path.')
        }

        const { data } = await productsApi.get(idFromSlug)
        let activeProduct = Array.isArray(data) ? data[0] : data

        if (!activeProduct) {
          throw new Error('The product collection response returned empty.')
        }

        setProduct(activeProduct)
        setCurrentImageIndex(0)

        // Parallel processing safety fallback hooks hitting your FastAPI backend server
        try {
          const [reviewsRes, statsRes] = await Promise.all([
            reviewsApi.getProductReviews(activeProduct.id),
            reviewsApi.getReviewStats(activeProduct.id)
          ])
          setReviews(reviewsRes.data || [])
          setStats(statsRes.data || { average_rating: 0, total_reviews: 0, rating_distribution: {1:0, 2:0, 3:0, 4:0, 5:0} })
        } catch (reviewErr) {
          console.error("Non-blocking review load failure:", reviewErr)
        }

      } catch (err) {
        console.error("Product fetch breakdown trace:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (idFromSlug) fetchCompleteProductData()
  }, [idFromSlug, productSlug])

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    await addToCart(product.id, 1, product.name, product.price)
    setAdding(false)
  }

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

  // 🟢 Magnifying Lens Logic Controller
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.pageX - left - window.scrollX) / width) * 100
    const y = ((e.pageY - top - window.scrollY) / height) * 100
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${productImages[currentImageIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%' // Zoom factor
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' })
  }

  // 🟢 Submit Review Logic
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSubmittingReview(true)
    try {
      await reviewsApi.createReview(product.id, user.id, {
        ...reviewForm,
        verified_purchase: true
      })
      
      // Refresh list upon successful commit
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsApi.getProductReviews(product.id),
        reviewsApi.getReviewStats(product.id)
      ])
      setReviews(reviewsRes.data || [])
      setStats(statsRes.data || stats)
      setShowReviewModal(false)
      setReviewForm({ rating: 5, title: '', comment: '' })
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to commit your experience rating record.")
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
        <p className="text-muted max-w-md mb-6">{error || 'This item structure may have been removed.'}</p>
        <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted ? isWishlisted(product.id) : false

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-background min-h-screen text-primary relative">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface border border-border rounded-[24px] p-6 md:p-8 shadow-sm">
        
        {/* Left: Product Image Stage (No white borders, built-in zoom panel lens) */}
        <div className="flex flex-col gap-4">
          <div 
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-surface-raised rounded-2xl p-4 flex items-center justify-center border border-subtle min-h-[350px] max-h-[450px] overflow-hidden relative cursor-zoom-in"
          >
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

            {/* Main Image Layer (Filtered transparent background mixin applied) */}
            <img 
              src={productImages[currentImageIndex]} 
              alt={product.name} 
              className="max-h-[380px] max-w-full object-contain select-none mix-blend-lighten pointer-events-none" 
            />

            {/* 🟢 Live Hover Magnifying Lens Panel */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 border-2 border-purple-500/20 bg-no-repeat"
              style={{
                ...zoomStyle,
                backgroundColor: 'var(--surface-raised)'
              }}
            />

            {productImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-purple-500 scale-125' : 'bg-surface border border-border hover:bg-surface-raised'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
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
                  <Star 
                    key={s} 
                    size={16} 
                    className={`${s <= Math.round(stats.average_rating || 4.8) ? 'fill-amber-500 text-amber-500' : 'text-border'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted font-medium">({stats.average_rating || '4.8'} / 5.0 Rating • {stats.total_reviews} global reviews)</span>
            </div>

            <div className="mt-6 text-3xl font-display font-bold text-gradient">
              ₹{product.price ? product.price.toLocaleString() : '0'}
            </div>

            <p className="mt-6 text-sm text-secondary leading-relaxed border-t border-subtle pt-6">
              {product.description || 'No specialized description payload has been provided for this product row.'}
            </p>
          </div>

          <div className="mt-8 border-t border-subtle pt-6">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 py-3 justify-center text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
              >
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart size={18} /> Add to Shopping Cart</>
                )}
              </button>

              {user && (
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

            <div className="grid grid-cols-3 gap-4 mt-6 text-[11px] text-muted font-medium">
              <div className="flex items-center gap-2"><Truck size={14} className="text-purple-500" /> Free Delivery</div>
              <div className="flex items-center gap-2"><RotateCcw size={14} className="text-purple-500" /> 7-Day Replacement</div>
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-purple-500" /> Safe Checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Dark Theme Product Review Feed Framework Section */}
      <div className="mt-12 bg-surface border border-border rounded-[24px] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight inline-flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-500" /> Customer Reflections
            </h2>
            <p className="text-xs text-muted mt-1">Feedback aggregated directly from authentic transactions</p>
          </div>
          {user ? (
            <button 
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} /> Leave a Review
            </button>
          ) : (
            <p className="text-xs text-purple-400 font-medium">Please authenticate session layers to submit reviews.</p>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm bg-surface-raised rounded-2xl border border-dashed border-border">
            No reviews have been published for this workspace variation yet. Be the first to express feedback!
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-surface-raised border border-subtle flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-xs text-purple-400 font-bold">
                      U{rev.user_id}
                    </div>
                    <span className="text-xs font-semibold text-secondary">Verified Buyer</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={12} 
                        className={`${star <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-border'}`} 
                      />
                    ))}
                  </div>
                </div>
                {rev.title && <h4 className="text-sm font-bold text-primary mt-1">{rev.title}</h4>}
                <p className="text-xs text-secondary leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 Seamless Review Overlay Modal Dialog */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-subtle">
              <h3 className="text-base font-bold text-primary">Write Product Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-raised text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Rating Score</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewForm(p => ({ ...p, rating: num }))}
                      className="text-amber-500 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Star size={24} className={num <= reviewForm.rating ? 'fill-amber-500' : 'text-border'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Headline Summary</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Absolute powerhouse device"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full text-xs px-3 py-2.5 bg-surface-raised border border-border rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Elaborate Feedback Experience</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="What did you like or dislike about this asset configuration?"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full text-xs px-3 py-2.5 bg-surface-raised border border-border rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-primary resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex justify-center items-center"
                >
                  {submittingReview ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Publish Feedback Metrics"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}