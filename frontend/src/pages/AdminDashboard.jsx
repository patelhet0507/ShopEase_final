import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Layers, Grid3x3, Users, Plus, Pencil, Trash2,
  X, Check, AlertCircle, TrendingUp, ShoppingBag, Tag, ChevronDown, 
  Upload, Move, Calendar, DollarSign, Archive
} from 'lucide-react'
import { categoriesApi, subcategoriesApi, productsApi, usersApi } from '../api'
import { FadeIn, StaggerChildren, StaggerItem, Skeleton, Modal } from '../components/ui'

// ─── Mock Sales Data Engine for Analytics ──────────────────────────
const ANALYTICS_DATA = {
  Weekly: [
    { label: 'Mon', revenue: 12000, inventory: 450 },
    { label: 'Tue', revenue: 19000, inventory: 420 },
    { label: 'Wed', revenue: 15000, inventory: 410 },
    { label: 'Thu', revenue: 28000, inventory: 380 },
    { label: 'Fri', revenue: 22000, inventory: 350 },
    { label: 'Sat', revenue: 34000, inventory: 310 },
    { label: 'Sun', revenue: 41000, inventory: 290 },
  ],
  Monthly: [
    { label: 'Week 1', revenue: 85000, inventory: 500 },
    { label: 'Week 2', revenue: 120000, inventory: 420 },
    { label: 'Week 3', revenue: 98000, inventory: 380 },
    { label: 'Week 4', revenue: 165000, inventory: 290 },
  ]
}

// ─── Dynamic Real-Time Sales SVG Multi-Line Graph Stage ───────────
function AnalyticsGraphStage({ dataset }) {
  const [timeframe, setTimeframe] = useState('Weekly')
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  const data = ANALYTICS_DATA[timeframe]
  
  // Graph Configurations
  const width = 600
  const height = 240
  const padding = 40
  
  const maxRevenue = Math.max(...data.map(d => d.revenue)) * 1.15
  const maxInventory = Math.max(...data.map(d => d.inventory)) * 1.15

  // Map Data Vectors into Viewport Coordinate Arcs
  const getPoints = (type) => {
    return data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2)
      const maxVal = type === 'revenue' ? maxRevenue : maxInventory
      const currentVal = type === 'revenue' ? d.revenue : d.inventory
      const y = height - padding - (currentVal / maxVal) * (height - padding * 2)
      return { x, y, value: currentVal, label: d.label }
    })
  }

  const revenuePoints = getPoints('revenue')
  const inventoryPoints = getPoints('inventory')

  const createPathD = (points) => {
    return points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
  }

  return (
    <div className="p-6 rounded-2xl mb-10 relative overflow-hidden flex flex-col"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      
      {/* Stage Control Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={16} className="text-purple-500" />
            Active Store Metrics Studio
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time cross-over charting of revenue flows vs. stock overhead</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-neutral-500/10" style={{ background: 'var(--surface-raised)' }}>
          {['Weekly', 'Monthly'].map(t => (
            <button
              key={t}
              onClick={() => { setTimeframe(t); setHoveredIndex(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === t ? 'shadow-sm text-white' : ''
              }`}
              style={timeframe === t ? { background: 'linear-gradient(135deg, #a855f7, #7c3aed)' } : { color: 'var(--text-secondary)' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Legend Indicators */}
      <div className="flex items-center gap-6 mb-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ backgroundColor: '#a855f7' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Revenue Flow (₹)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ backgroundColor: '#22c55e' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Inventory Overheads (Units)</span>
        </div>
      </div>

      {/* SVG Canvas Renderer */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2)
            return (
              <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} 
                stroke="var(--border)" strokeDasharray="4,4" />
            )
          })}

          {/* Core Multi-Line Vectors */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            d={createPathD(revenuePoints)}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            d={createPathD(inventoryPoints)}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Dynamic Node Trigger Mapping */}
          {revenuePoints.map((pt, idx) => (
            <g key={idx} 
               onMouseEnter={() => setHoveredIndex(idx)}
               onMouseLeave={() => setHoveredIndex(null)}
               className="cursor-pointer"
            >
              {/* Invisible touch bounds */}
              <rect x={pt.x - 15} y={0} width={30} height={height} fill="transparent" />
              
              {/* Highlight Trackline */}
              {hoveredIndex === idx && (
                <line x1={pt.x} y1={padding} x2={pt.x} y2={height - padding} stroke="var(--border)" strokeWidth="1" />
              )}
              
              {/* Revenue Points */}
              <circle cx={pt.x} cy={pt.y} r={hoveredIndex === idx ? 5 : 3.5} fill="#a855f7" stroke="var(--surface)" strokeWidth="1.5" />
              {/* Inventory Points */}
              <circle cx={inventoryPoints[idx].x} cy={inventoryPoints[idx].y} r={hoveredIndex === idx ? 5 : 3.5} fill="#22c55e" stroke="var(--surface)" strokeWidth="1.5" />
              
              {/* X Axis Labels */}
              <text x={pt.x} y={height - 12} textAnchor="middle" fill="var(--text-muted)" className="text-[10px] font-medium font-sans">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip Element Popover */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute pointer-events-none p-3 rounded-xl shadow-xl border flex flex-col gap-1 z-30"
              style={{
                left: `${(revenuePoints[hoveredIndex].x / width) * 100}%`,
                top: '20%',
                transform: 'translateX(-50%)',
                background: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] uppercase font-bold text-neutral-400">{data[hoveredIndex].label} Timeline</span>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-500">
                <DollarSign size={12} /> Rev: <span>₹{data[hoveredIndex].revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-500">
                <Archive size={12} /> Stock: <span>{data[hoveredIndex].inventory} Units</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Drag-and-Drop Image Gallery Sort Canvas ──────────────────────
function ImageGallerySortCanvas({ images, onSequenceChange }) {
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const reorderedImages = [...images]
    const currentDraggedItem = reorderedImages[draggedIndex]
    
    // Swap structures inside index arrays
    reorderedImages.splice(draggedIndex, 1)
    reorderedImages.splice(index, 0, currentDraggedItem)
    
    setDraggedIndex(index)
    onSequenceChange(reorderedImages)
  }

  const handleFileUploadSimulated = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    // Create preview data strings for visualization canvas
    const processed = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name
    }))
    onSequenceChange([...images, ...processed])
  }

  const handleRemoveImage = (id) => {
    onSequenceChange(images.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
        Product Image Gallery Canvas (Drag items to change display priority order)
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <AnimatePresence mode="popLayout">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`relative h-24 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border group select-none ${
                draggedIndex === index ? 'opacity-30 border-purple-500' : ''
              }`}
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <img src={img.url} alt="product-node" className="w-full h-full object-cover pointer-events-none" />
              
              {/* Order index Badge indicator */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-black text-white">
                #{index + 1}
              </div>

              {/* Grid overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <Move size={14} className="text-white drop-shadow" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Terminal Node Grid Slot */}
        <label className="h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-center cursor-pointer hover:bg-purple-500/5 transition-colors group relative"
          style={{ borderColor: 'var(--border)' }}>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUploadSimulated} />
          <Upload size={16} className="text-purple-500 animate-pulse" />
          <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>Upload Images</span>
        </label>
      </div>
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </motion.div>
  )
}

// ─── Confirm Delete ────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, label }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" size="sm">
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{label}</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} className="flex-1 btn-primary bg-red-500 justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          Delete
        </button>
      </div>
    </Modal>
  )
}

// ─── Table ─────────────────────────────────────────────
function AdminTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                {col.label}
              </th>
            ))}
            <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b last:border-0 hover:bg-surface-raised transition-colors"
                style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'transparent' }}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3.5" style={{ color: 'var(--text-primary)' }}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span className="truncate block max-w-xs">{row[col.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-raised transition-colors text-purple-500 cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(row)} className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors text-red-400 cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────
const TABS = ['Overview', 'Categories', 'Subcategories', 'Products', 'Users']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal and custom Form Attachment States
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      subcategoriesApi.list(),
      productsApi.list(),
      usersApi.list(),
    ]).then(([c, s, p, u]) => {
      setCategories(c.data)
      setSubcategories(s.data)
      setProducts(p.data)
      setUsers(u.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── Category CRUD ──
  const openCategoryModal = (data = null) => {
    setForm(data ? { name: data.name } : { name: '' })
    setModal({ type: 'category', data })
    setError('')
  }
  const saveCategory = async () => {
    if (!form.name?.trim()) return setError('Name is required')
    setSaving(true)
    try {
      const slug = form.slug?.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description || '',
        color: form.color || null,
      }
      if (modal.data) {
        const { data } = await categoriesApi.update(modal.data.id, payload)
        setCategories(prev => prev.map(c => c.id === data.id ? { ...c, name: data.name } : c))
      } else {
        const { data } = await categoriesApi.create(payload)
        setCategories(prev => [...prev, { ...data, subcategories: [] }])
      }
      setModal(null)
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save') }
    setSaving(false)
  }
  const deleteCategory = async (id) => {
    await categoriesApi.delete(id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setSubcategories(prev => prev.filter(s => s.category_id !== id))
    setProducts(prev => prev.filter(p => p.category_id !== id))
    setConfirmDelete(null)
  }

  // ── Subcategory CRUD ──
  const openSubModal = (data = null) => {
    setForm(data ? { name: data.name, category_id: data.category_id } : { name: '', category_id: categories[0]?.id || '' })
    setModal({ type: 'subcategory', data })
    setError('')
  }
  const saveSubcategory = async () => {
    if (!form.name?.trim() || !form.category_id) return setError('All fields required')
    setSaving(true)
    try {
      const slug = form.slug?.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const payload = {
        name: form.name.trim(),
        slug,
        category_id: Number(form.category_id),
        description: form.description || '',
      }
      if (modal.data) {
        const { data } = await subcategoriesApi.update(modal.data.id, payload)
        setSubcategories(prev => prev.map(s => s.id === data.id ? data : s))
      } else {
        const { data } = await subcategoriesApi.create(payload)
        setSubcategories(prev => [...prev, data])
      }
      setModal(null)
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save') }
    setSaving(false)
  }
  const deleteSubcategory = async (id) => {
    await subcategoriesApi.delete(id)
    setSubcategories(prev => prev.filter(s => s.id !== id))
    setProducts(prev => prev.filter(p => p.subcategory_id !== id))
    setConfirmDelete(null)
  }

  // ── Product CRUD ──
  const openProductModal = (data = null) => {
    // Populate form with mock placeholder images if structural records are blank
    const baseImages = data?.gallery || [
      { id: '1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
      { id: '2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' }
    ]
    setForm(data
      ? { name: data.name, price: data.price, description: data.description, category_id: data.category_id, subcategory_id: data.subcategory_id, gallery: baseImages }
      : { name: '', price: '', description: '', category_id: categories[0]?.id || '', subcategory_id: '', gallery: [] })
    setModal({ type: 'product', data })
    setError('')
  }
  const saveProduct = async () => {
    const { name, price, description, category_id, subcategory_id, gallery } = form
    if (!name?.trim() || !price || !description?.trim() || !category_id || !subcategory_id)
      return setError('All fields are required')
    setSaving(true)
    try {
      const payload = { name, price: Number(price), description, category_id: Number(category_id), subcategory_id: Number(subcategory_id), gallery }
      if (modal.data) {
        const { data } = await productsApi.update(modal.data.id, payload)
        setProducts(prev => prev.map(p => p.id === data.id ? { ...data, gallery } : p))
      } else {
        const { data } = await productsApi.create(payload)
        setProducts(prev => [...prev, { ...data, gallery }])
      }
      setModal(null)
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save') }
    setSaving(false)
  }
  const deleteProduct = async (id) => {
    await productsApi.delete(id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setConfirmDelete(null)
  }

  // ── User role ──
  const updateRole = async (userId, role) => {
    const { data } = await usersApi.updateRole(userId, role)
    setUsers(prev => prev.map(u => u.id === data.id ? data : u))
  }

  const filteredSubs = form.category_id
    ? subcategories.filter(s => s.category_id === Number(form.category_id))
    : subcategories

  const handleSave = () => {
    if (modal?.type === 'category') saveCategory()
    else if (modal?.type === 'subcategory') saveSubcategory()
    else if (modal?.type === 'product') saveProduct()
  }

  const handleDelete = (item, type) => {
    setConfirmDelete({ item, type })
  }
  const confirmDeleteAction = () => {
    const { item, type } = confirmDelete
    if (type === 'category') deleteCategory(item.id)
    else if (type === 'subcategory') deleteSubcategory(item.id)
    else if (type === 'product') deleteProduct(item.id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="section-heading text-2xl md:text-3xl">Admin Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your store</p>
          </div>
        </div>
      </FadeIn>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-2xl overflow-x-auto" style={{ background: 'var(--surface-raised)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              tab === t ? 'text-white shadow-lg' : 'hover:bg-surface'
            }`}
            style={tab === t
              ? { background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white' }
              : { color: 'var(--text-secondary)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <>
          {/* ── Overview Tab with Embedded Active Multi-Line Analytics ── */}
          {tab === 'Overview' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                <StatCard icon={Layers} label="Categories" value={categories.length} color="#a855f7" delay={0} />
                <StatCard icon={Grid3x3} label="Subcategories" value={subcategories.length} color="#3b82f6" delay={0.08} />
                <StatCard icon={Package} label="Products" value={products.length} color="#22c55e" delay={0.16} />
                <StatCard icon={Users} label="Users" value={users.length} color="#f59e0b" delay={0.24} />
              </div>

              {/* Advanced Real-time Sales Analytic Stage insertion */}
              <FadeIn>
                <AnalyticsGraphStage />
              </FadeIn>

              {/* Recent products */}
              <FadeIn>
                <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Recent Products</h2>
                <AdminTable
                  columns={[
                    { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                    { key: 'name', label: 'Name' },
                    { key: 'price', label: 'Price', render: v => <span className="font-semibold text-gradient">₹{v.toLocaleString()}</span> },
                    { key: 'category_name', label: 'Category', render: v => v || '—' },
                  ]}
                  rows={products.slice(0, 5)}
                  onEdit={(row) => { setTab('Products'); openProductModal(row) }}
                  onDelete={(row) => handleDelete(row, 'product')}
                />
              </FadeIn>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === 'Categories' && (
            <FadeIn>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Categories ({categories.length})</h2>
                <button onClick={() => openCategoryModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer">
                  <Plus size={14} /> Add Category
                </button>
              </div>
              <AdminTable
                columns={[
                  { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                  { key: 'name', label: 'Name' },
                  { key: 'subcategories', label: 'Subcategories', render: v => <span>{v?.length || 0}</span> },
                ]}
                rows={categories}
                onEdit={(row) => openCategoryModal(row)}
                onDelete={(row) => handleDelete(row, 'category')}
              />
            </FadeIn>
          )}

          {/* ── Subcategories ── */}
          {tab === 'Subcategories' && (
            <FadeIn>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Subcategories ({subcategories.length})</h2>
                <button onClick={() => openSubModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer">
                  <Plus size={14} /> Add Subcategory
                </button>
              </div>
              <AdminTable
                columns={[
                  { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                  { key: 'name', label: 'Name' },
                  { key: 'category_id', label: 'Category', render: v => categories.find(c => c.id === v)?.name || '—' },
                ]}
                rows={subcategories}
                onEdit={(row) => openSubModal(row)}
                onDelete={(row) => handleDelete(row, 'subcategory')}
              />
            </FadeIn>
          )}

          {/* ── Products ── */}
          {tab === 'Products' && (
            <FadeIn>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Products ({products.length})</h2>
                <button onClick={() => openProductModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer">
                  <Plus size={14} /> Add Product
                </button>
              </div>
              <AdminTable
                columns={[
                  { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                  { key: 'name', label: 'Name' },
                  { key: 'price', label: 'Price', render: v => <span className="font-semibold text-gradient">₹{v.toLocaleString()}</span> },
                  { key: 'category_name', label: 'Category', render: v => v || '—' },
                  { key: 'subcategory_name', label: 'Subcategory', render: v => v || '—' },
                ]}
                rows={products}
                onEdit={(row) => openProductModal(row)}
                onDelete={(row) => handleDelete(row, 'product')}
              />
            </FadeIn>
          )}

          {/* ── Users ── */}
          {tab === 'Users' && (
            <FadeIn>
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Users ({users.length})</h2>
              <AdminTable
                columns={[
                  { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                  { key: 'email', label: 'Email' },
                  {
                    key: 'role', label: 'Role',
                    render: (v, row) => (
                      <div className="relative inline-block">
                        <select
                          value={v}
                          onChange={e => updateRole(row.id, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer appearance-none pr-7"
                          style={{
                            background: v === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)',
                            color: v === 'admin' ? '#a855f7' : '#22c55e',
                            border: `1px solid ${v === 'admin' ? 'rgba(168,85,247,0.3)' : 'rgba(34,197,94,0.3)'}`,
                          }}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: v === 'admin' ? '#a855f7' : '#22c55e' }} />
                      </div>
                    )
                  },
                ]}
                rows={users}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </FadeIn>
          )}
        </>
      )}

      {/* ── Modular Multi-Context Form Modal ── */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal?.type === 'category' ? (modal?.data ? 'Edit Category' : 'New Category')
          : modal?.type === 'subcategory' ? (modal?.data ? 'Edit Subcategory' : 'New Subcategory')
          : (modal?.data ? 'Edit Product' : 'New Product')
        }
        size={modal?.type === 'product' ? 'lg' : 'sm'}
      >
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Name *</label>
            <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Enter name…" />
          </div>

          {/* Subcategory / Product: category select option matrix */}
          {(modal?.type === 'subcategory' || modal?.type === 'product') && (
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Category *</label>
              <select
                value={form.category_id || ''}
                onChange={e => { setForm(f => ({ ...f, category_id: e.target.value, subcategory_id: '' })) }}
                className="input-field"
              >
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Product Specific Form Layout Extensions */}
          {modal?.type === 'product' && (
            <>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Subcategory *</label>
                <select
                  value={form.subcategory_id || ''}
                  onChange={e => setForm(f => ({ ...f, subcategory_id: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select subcategory…</option>
                  {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Price (₹) *</label>
                <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="0" min="0" />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Description *</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Product description…" />
              </div>

              {/* Integrated Image Gallery Drag-and-Drop Attachment Stage */}
              <ImageGallerySortCanvas
                images={form.gallery || []}
                onSequenceChange={(updatedGallery) => setForm(f => ({ ...f, gallery: updatedGallery }))}
              />
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1 cursor-pointer">Cancel</button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.01 }}
            className="btn-primary flex-1 justify-center cursor-pointer"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Check size={14} /> {modal?.data ? 'Save Changes' : 'Create'}</>
            }
          </motion.button>
        </div>
      </Modal>

      {/* Confirm Delete Backdrop Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteAction}
        label={confirmDelete?.item?.name}
      />
    </div>
  )
}
