import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Package, ArrowLeft, Layers } from 'lucide-react'
import { categoriesApi } from '../api'
import ProductCard from '../components/product/ProductCard'
import { FadeIn, Skeleton, EmptyState } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'

export default function CategoryDetailPage() {
  const { categoryToken, subToken } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  const activeSubToken = subToken || 'all'

  useEffect(() => {
    setLoading(true)
    categoriesApi.getByToken(categoryToken)
      .then(({ data }) => {
        setCategory(data)
        setLoading(false)
        if (data.view_token && data.view_token !== categoryToken) {
          const path = subToken && subToken !== 'all'
            ? `/c/${data.view_token}/${subToken}`
            : `/c/${data.view_token}`
          window.history.replaceState(null, '', path)
        }
      })
      .catch(() => {
        categoriesApi.getBySlug(categoryToken)
          .then(({ data }) => {
            setCategory(data)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
  }, [categoryToken])

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
      description="This category doesn't exist."
      action={<Link to="/categories" className="btn-primary">Browse Categories</Link>}
    />
  )

  const subcategories = category.subcategories || []
  const activeSubcategory = subToken
    ? subcategories.find(
        sub => sub.view_token === subToken || sub.slug === subToken || String(sub.id) === subToken
      )
    : null

  const filteredProducts = !category.products ? [] : category.products.filter(product => {
    if (!subToken || subToken === 'all') return true
    return String(product.subcategory_id) === String(activeSubcategory?.id)
  })

  const handleSubcategoryToggle = (token) => {
    if (!token || token === 'all') {
      navigate(`/c/${category.view_token || category.slug}`, { replace: true })
    } else {
      navigate(`/c/${category.view_token || category.slug}/${token}`, { replace: true })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/categories" className="hover:text-purple-500 transition-colors">Categories</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)' }} className="font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display font-bold text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>{category.name}</h1>
        {category.color && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-4 h-4 rounded-full" style={{ background: category.color }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{filteredProducts.length} products</span>
          </div>
        )}
      </motion.div>

      {/* Subcategory pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleSubcategoryToggle('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              !subToken || subToken === 'all'
                ? 'text-white'
                : 'hover:bg-white/5'
            }`}
            style={{
              background: !subToken || subToken === 'all'
                ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                : 'var(--surface-raised)',
              color: !subToken || subToken === 'all' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <Layers size={14} className="inline mr-1.5" />
            All
          </button>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => handleSubcategoryToggle(sub.view_token || sub.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeSubcategory?.id === sub.id
                  ? 'text-white'
                  : 'hover:bg-white/5'
              }`}
              style={{
                background: activeSubcategory?.id === sub.id
                  ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                  : 'var(--surface-raised)',
                color: activeSubcategory?.id === sub.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={subToken && subToken !== 'all' ? 'No products in this subcategory.' : 'This category has no products yet.'}
          action={<Link to="/products" className="btn-primary"><ArrowLeft size={14} /> Browse All Products</Link>}
        />
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
