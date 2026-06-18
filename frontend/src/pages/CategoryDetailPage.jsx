import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Package, ArrowLeft, Layers } from 'lucide-react'
import { categoriesApi } from '../api'
import ProductCard from '../components/product/ProductCard'
import { FadeIn, Skeleton, EmptyState } from '../components/ui'
import { AnimatePresence, motion } from 'framer-motion'

export default function CategoryDetailPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Track selected subcategory code slug without refreshing pages
  const activeSubSlug = searchParams.get('sub') || 'all'

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

  // FIXED: Bypasses subcategory loops if the state trace is pointing to 'all'
  const filteredProducts = !category.products ? [] : category.products.filter(product => {
    // If no specific subcategory pill is highlighted, display all products by default
    if (activeSubSlug === 'all') return true
    
    // Otherwise, match explicitly against subcategory slug identifiers or relational IDs
    return String(product.subcategory_slug || product.subcategory_id) === String(activeSubSlug)
  })

  // Locate active subcategory metadata via slug matching
  const activeSubcategoryName = category.subcategories?.find(
    sub => String(sub.slug || sub.id) === String(activeSubSlug)
  )?.name

  // Handles SEO parameter mutations on standard location history arrays
  const handleSubcategoryToggle = (subSlug) => {
    if (subSlug === 'all') {
      searchParams.delete('sub')
    } else {
      searchParams.set('sub', subSlug)
    }
    setSearchParams(searchParams)
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
              >