import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Package, ArrowLeft, Layers } from 'lucide-react'
import { categoriesApi } from '../api'
import ProductCard from '../components/product/ProductCard'
import { FadeIn, Skeleton, EmptyState } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'

export default function CategoryDetailPage() {
  const { categorySlug, subSlug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Track selected subcategory from path
  const activeSubSlug = subSlug || 'all'
  const activeSubIdMatch = activeSubSlug ? String(activeSubSlug).match(/\d+$/) : null
  const activeSubId = activeSubIdMatch ? parseInt(activeSubIdMatch[0], 10) : null

  useEffect(() => {
    setLoading(true)
    
    categoriesApi.getBySlug(categorySlug)
      .then(({ data }) => {
        setCategory(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Category data sync failure:", err)
        setLoading(false)
      })
  }, [categorySlug])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-12 w-72 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    )
  }

  if (!category) return (
    <EmptyState 
      icon={Package} 
      title="Category not found" 
      description="This category doesn't exist or database is syncing data parameters slowly."
      action={<Link to="/categories" className="btn-primary">Browse Categories</Link>} 
    />
  )

  const activeSubcategory = category.subcategories?.find(
    sub => String(sub.slug) === String(activeSubSlug) || (activeSubId && Number(sub.id) === activeSubId)
  )

  // FIXED: Bypasses subcategory loops if the state trace is pointing to 'all'
  const filteredProducts = !category.products ? [] : category.products.filter(product => {
    // If no specific subcategory pill is highlighted, display all products by default
    if (activeSubSlug === 'all') return true
    
    // Otherwise, match explicitly against the selected subcategory record id
    return String(product.subcategory_id) === String(activeSubcategory?.id || activeSubId || activeSubSlug)
  })

  const activeSubcategoryName = activeSubcategory?.name

  // Handles SEO parameter mutations on standard location history arrays
  const handleSubcategoryToggle = (slug) => {
    if (slug === 'all') {
      navigate(`/categories/${categorySlug}`, { replace: true })
    } else {
      navigate(`/categories/${categorySlug}/${slug}`, { replace: true })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Interactive Breadcrumb Filter Trace */}
      <FadeIn>
        <nav className="flex items-center flex-wrap gap-2 text-xs mb-8 transition-all duration-300" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:text-purple-500 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/categories" className="hover:text-purple-500 transition-colors">Categories</Link>
          <ChevronRight size={12} />
          <button 
            onClick={() => handleSubcategoryToggle('all')} 
            className={`transition-colors cursor-pointer outline-none ${activeSubSlug === 'all' ? 'text-[var(--text-primary)] font-medium' : 'hover:text-purple-500'}`}
          >
            {category.name}
          </button>
          
          <AnimatePresence>
            {activeSubSlug !== 'all' && activeSubcategoryName && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight size={12} />
                <span className="font-semibold text-purple-500 px-2 py-0.5 rounded-md bg-purple-500/10">
                  {activeSubcategoryName}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Header Display */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <Link to="/categories" className="btn-ghost p-2 rounded-lg">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="section-heading text-3xl md:text-4xl">
                {activeSubSlug !== 'all' ? activeSubcategoryName : category.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} visible
              </p>
            </div>
          </div>
        </div>

        {/* Subcategory Nesting Maps Panel Using Slugs */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-8 p-1.5 rounded-2xl bg-[var(--bg-secondary)] border flex flex-wrap gap-1.5 items-center max-w-full overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => handleSubcategoryToggle('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeSubSlug === 'all'
                  ? 'bg-[var(--surface)] text-purple-500 shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              All Products ({category.products?.length || 0})
            </button>
            
            {category.subcategories.map(sub => {
              const isSelected = String(sub.slug) === String(activeSubSlug)
              return (
                <button
                  key={sub.slug}
                  onClick={() => handleSubcategoryToggle(sub.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all inline-flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--surface)] text-purple-500 shadow-sm font-semibold border-purple-500/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-purple-500/10 text-purple-500' : 'bg-[var(--surface-raised)] text-[var(--text-muted)]'}`}>
                    {sub.product_count || 0}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </FadeIn>

      {/* Grid State Renderer */}
      <div className="mt-10">
        {filteredProducts.length === 0 ? (
          <EmptyState 
            icon={Layers} 
            title="No subcategory items found" 
            description="There are currently no products mapped inside this slice filter."
            action={
              activeSubSlug !== 'all' ? (
                <button onClick={() => handleSubcategoryToggle('all')} className="btn-primary">
                  Reset Filter Trace
                </button>
              ) : null
            } 
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.slug || product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                >
                  <ProductCard product={{ ...product, category_name: category.name }} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
