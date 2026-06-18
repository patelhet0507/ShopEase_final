import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  SlidersHorizontal, Search, X, ChevronDown, Package,
  Grid2X2, Grid3x3, LayoutList, Laptop, Smartphone, Shirt, Watch, Home
} from 'lucide-react'
import { categoriesApi, productsApi } from '../api'
import ProductCard from '../components/product/ProductCard'
import { Skeleton, EmptyState } from '../components/ui'

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
  { value: 'name_desc', label: 'Name: Z-A' },
]

const getCategoryIcon = (name = '') => {
  const lowered = name.toLowerCase()
  if (lowered.includes('tech') || lowered.includes('computer') || lowered.includes('electronics')) return Laptop
  if (lowered.includes('phone') || lowered.includes('mobile')) return Smartphone
  if (lowered.includes('cloth') || lowered.includes('apparel') || lowered.includes('fashion')) return Shirt
  if (lowered.includes('accessory') || lowered.includes('jewel') || lowered.includes('watch')) return Watch
  return Home
}

const triggerFeedback = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    }
  } catch {}

  if ('vibrate' in navigator) navigator.vibrate(8)
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sort, setSort] = useState('default')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [gridVariant, setGridVariant] = useState('density-modern')

  useEffect(() => {
    Promise.all([productsApi.list(), categoriesApi.list()]).then(([p, c]) => {
      const nextProducts = Array.isArray(p.data) ? p.data : []
      const nextCategories = Array.isArray(c.data) ? c.data : []
      setProducts(nextProducts)
      setCategories(nextCategories)
      const max = nextProducts.length ? Math.max(...nextProducts.map(pr => Number(pr.price) || 0), 1000) : 1000
      setMaxPrice(max)
      setPriceRange([0, max])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const liveCountMetrics = useMemo(() => {
    const counts = { all: 0 }
    categories.forEach(c => { counts[c.id] = 0 })
    products.forEach(p => {
      const matchesSearch = !search ||
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchesPrice = Number(p.price || 0) >= priceRange[0] && Number(p.price || 0) <= priceRange[1]
      if (matchesSearch && matchesPrice) {
        counts.all++
        if (p.category_id in counts) counts[p.category_id]++
      }
    })
    return counts
  }, [products, categories, search, priceRange])

  const filtered = useMemo(() => {
    let result = [...products]
    if (search) {
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }
    if (selectedCategory) result = result.filter(p => Number(p.category_id) === Number(selectedCategory))
    result = result.filter(p => Number(p.price || 0) >= priceRange[0] && Number(p.price || 0) <= priceRange[1])
    if (sort === 'price_asc') result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    else if (sort === 'price_desc') result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    else if (sort === 'name_asc') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    else if (sort === 'name_desc') result.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    return result
  }, [products, search, selectedCategory, priceRange, sort])

  const activeFilters = [
    selectedCategory && categories.find(c => Number(c.id) === Number(selectedCategory))?.name,
    sort !== 'default' && SORT_OPTIONS.find(s => s.value === sort)?.label,
  ].filter(Boolean)

  const gridContainerClass =
    gridVariant === 'density-dense'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-8'
      : gridVariant === 'density-list'
        ? 'flex flex-col gap-3'
        : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'

  const resetFilters = () => {
    triggerFeedback()
    setSelectedCategory(null)
    setPriceRange([0, maxPrice])
    setSearch('')
    setSort('default')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-1">Shop</p>
          <h1 className="section-heading text-3xl md:text-4xl">All Products</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? '...' : `${filtered.length} products found`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {[
              { id: 'density-dense', icon: Grid2X2 },
              { id: 'density-modern', icon: Grid3x3 },
              { id: 'density-list', icon: LayoutList },
            ].map(item => {
              const IconComp = item.icon
              const isActive = gridVariant === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { triggerFeedback(); setGridVariant(item.id) }}
                  className="relative p-2.5 rounded-lg text-sm transition-colors focus:outline-none"
                  style={{ color: isActive ? '#a855f7' : 'var(--text-muted)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLayoutBackground"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <IconComp size={16} className="relative z-10" />
                </button>
              )
            })}
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={e => { triggerFeedback(); setSort(e.target.value) }}
              className="input-field pr-8 text-xs py-2.5 cursor-pointer appearance-none"
              style={{ paddingRight: '2rem' }}
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          <button onClick={() => { triggerFeedback(); setSidebarOpen(true) }} className="btn-secondary text-xs py-2.5 lg:hidden">
            <SlidersHorizontal size={14} /> Filters
            {activeFilters.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center" style={{ background: '#a855f7' }}>
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map(f => <span key={f} className="badge-purple text-xs">{f}</span>)}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
          <div className="p-5 rounded-2xl animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <SlidersHorizontal size={15} className="text-purple-500" />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Filters Matrix</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-9 text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>Category Chips</label>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${!selectedCategory ? 'neon-border bg-purple-500/5 text-purple-500 font-semibold' : 'hover:bg-surface-raised text-secondary'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Grid3x3 size={14} className={!selectedCategory ? 'text-purple-500' : 'text-text-muted group-hover:text-purple-400'} />
                      <span>All Categories</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${!selectedCategory ? 'bg-purple-500 text-white' : 'bg-surface-raised text-muted'}`} style={{ color: !selectedCategory ? '#fff' : 'var(--text-secondary)' }}>
                      {liveCountMetrics.all}
                    </span>
                  </button>

                  {categories.map(cat => {
                    const CatIcon = getCategoryIcon(cat.name)
                    const isSelected = Number(selectedCategory) === Number(cat.id)
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                        className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${isSelected ? 'neon-border bg-purple-500/5 text-purple-500 font-semibold' : 'hover:bg-surface-raised text-secondary'}`}
                      >
                        <div className="flex items-center gap-2">
                          <CatIcon size={14} className={isSelected ? 'text-purple-500' : 'text-text-muted group-hover:text-purple-400'} />
                          <span>{cat.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isSelected ? 'bg-purple-500 text-white' : 'bg-surface-raised text-muted'}`} style={{ color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                          {liveCountMetrics[cat.id] || 0}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Price Target</label>
                  <span className="text-xs font-semibold text-purple-500">Max: â‚¹{priceRange[1].toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>â‚¹0</span>
                  <span>â‚¹{maxPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full btn-ghost text-xs text-red-400 hover:text-red-500 justify-center"
              >
                <X size={12} /> Reset Grid Matrix
              </button>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-80 p-6 overflow-y-auto"
                style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Filters Matrix</span>
                  <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5 rounded-lg">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>Search</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-9 text-xs py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>Category Chips</label>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => { setSelectedCategory(null); setSidebarOpen(false) }}
                        className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${!selectedCategory ? 'neon-border bg-purple-500/5 text-purple-500 font-semibold' : 'hover:bg-surface-raised text-secondary'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Grid3x3 size={14} />
                          <span>All Categories</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full ${!selectedCategory ? 'bg-purple-500 text-white' : 'bg-surface-raised'}`}>
                          {liveCountMetrics.all}
                        </span>
                      </button>
                      {categories.map(cat => {
                        const CatIcon = getCategoryIcon(cat.name)
                        const isSelected = Number(selectedCategory) === Number(cat.id)
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(isSelected ? null : cat.id); setSidebarOpen(false) }}
                            className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${isSelected ? 'neon-border bg-purple-500/5 text-purple-500 font-semibold' : 'hover:bg-surface-raised text-secondary'}`}
                          >
                            <div className="flex items-center gap-2">
                              <CatIcon size={14} />
                              <span>{cat.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] rounded-full ${isSelected ? 'bg-purple-500 text-white' : 'bg-surface-raised'}`}>
                              {liveCountMetrics[cat.id] || 0}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Price: â‚¹{priceRange[0].toLocaleString()} - â‚¹{priceRange[1].toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <button
                    onClick={() => { resetFilters(); setSidebarOpen(false) }}
                    className="w-full btn-ghost text-xs text-red-400 hover:text-red-500 justify-center"
                  >
                    <X size={12} /> Clear all filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your active target filters matrix."
              action={<button onClick={resetFilters} className="btn-primary">Reset Grid Matrix</button>}
            />
          ) : (
            <motion.div layout className={gridContainerClass} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, delay: (i % 8) * 0.03 }}
                    className={gridVariant === 'density-list' ? 'w-full' : ''}
                  >
                    {gridVariant === 'density-list' ? (
                      <div
                        className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.005]"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center font-bold text-lg text-purple-400 flex-shrink-0">
                          {(product.name || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-sm font-bold text-gradient">â‚¹{Number(product.price || 0).toLocaleString()}</span>
                          <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>In Stock</span>
                        </div>
                      </div>
                    ) : (
                      <ProductCard product={product} index={i} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
