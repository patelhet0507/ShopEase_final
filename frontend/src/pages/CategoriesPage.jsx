import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Search, Layers } from 'lucide-react'
import { categoriesApi } from '../api'
import { FadeIn, StaggerChildren, StaggerItem, Skeleton, EmptyState } from '../components/ui'

const CATEGORY_COLORS = [
  ['#a855f7', '#7c3aed'],
  ['#3b82f6', '#1d4ed8'],
  ['#ec4899', '#db2777'],
  ['#22c55e', '#15803d'],
  ['#f59e0b', '#d97706'],
  ['#ef4444', '#dc2626'],
  ['#06b6d4', '#0891b2'],
  ['#8b5cf6', '#6d28d9'],
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    categoriesApi.listWithStructure().then(({ data }) => {
      setCategories(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <FadeIn>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-2">Explore</p>
          <h1 className="section-heading text-4xl md:text-5xl mb-3">All Categories</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Browse our complete collection of product categories.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Layers} title="No categories found" description="Try a different search term." />
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((cat, i) => {
            const [from, to] = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
            const totalProducts = cat.subcategories?.reduce((s, sub) => s + (sub.product_count || 0), 0) || 0
            
            return (
              <StaggerItem key={cat.id}>
                <motion.div 
                  className="relative rounded-3xl overflow-visible group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Visual Ambient Card Glow Backdrop */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-all duration-500 pointer-events-none scale-105 z-0"
                    style={{
                      background: `linear-gradient(135deg, ${from}50, ${to}30)`,
                      filter: 'blur(24px)'
                    }}
                  />

                  {/* Card Content Container */}
                  <div className="relative rounded-3xl overflow-hidden bg-[var(--surface)] z-10 border transition-colors duration-300 group-hover:border-transparent" style={{ border: '1px solid var(--border)' }}>
                    
                    {/* Category Header Area */}
                    <div className="relative p-6 pb-8"
                      style={{ background: `linear-gradient(135deg, ${from}12, ${to}06)` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 8px 24px ${from}40` }}>
                          <Package size={22} className="text-white" />
                        </div>
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                          style={{ background: `${from}20`, color: from }}
                        >
                          View all <ChevronRight size={12} />
                        </Link>
                      </div>

                      <h2 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </h2>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {cat.subcategories?.length || 0} subcategories • {totalProducts} products
                      </p>
                    </div>

                    {/* Subcategories Navigation List */}
                    <div className="p-4 space-y-1.5" style={{ background: 'var(--surface)' }}>
                      {cat.subcategories?.slice(0, 4).map(sub => (
                        <Link
                          key={sub.id}
                          to={`/categories/${cat.slug}?sub=${sub.slug || sub.id}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl transition-colors hover:bg-[var(--surface-raised)]"
                        >
                          <span className="text-sm font-medium transition-colors group-hover/sub:text-[var(--text-primary)]" style={{ color: 'var(--text-secondary)' }}>
                            {sub.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${from}15`, color: from }}>
                              {sub.product_count}
                            </span>
                            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        </Link>
                      ))}
                      
                      {(cat.subcategories?.length || 0) > 4 && (
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="block text-center text-xs py-2 rounded-xl transition-colors hover:bg-[var(--surface-raised)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          +{cat.subcategories.length - 4} more subcategories
                        </Link>
                      )}
                      {(!cat.subcategories || cat.subcategories.length === 0) && (
                        <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
                          No subcategories yet
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      )}
    </div>
  )
}
