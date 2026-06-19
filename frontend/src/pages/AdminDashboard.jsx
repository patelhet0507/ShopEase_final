import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Layers, Grid3x3, Users, Plus, Pencil, Trash2,
  X, Check, AlertCircle, TrendingUp, ShoppingBag, Tag, ChevronDown, 
  Upload, Move, Calendar, DollarSign, Archive, ShoppingCart, UserPlus, Search
} from 'lucide-react'
import { categoriesApi, subcategoriesApi, productsApi, usersApi, ordersApi } from '../api'
import { FadeIn, StaggerChildren, StaggerItem, Skeleton, Modal } from '../components/ui'
import { generateSlug } from '../components/product/ProductCard'

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff))
}

// ─── Image URL Input Canvas ─────────────────────────────────────
function ImageGallerySortCanvas({ images, onSequenceChange }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [newImageUrl, setNewImageUrl] = useState('')

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

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return
    
    const newImage = {
      id: `new-${Date.now()}`,
      url: newImageUrl.trim()
    }
    onSequenceChange([...images, newImage])
    setNewImageUrl('')
  }

  const handleRemoveImage = (id) => {
    onSequenceChange(images.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
        Product Image URLs (Drag items to change display priority order)
      </label>
      
      {/* Add Image URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          className="input-field text-xs flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
        />
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="btn-primary text-xs px-3 py-2 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
      
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
              <img src={img.url} alt="product-node" className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL' }} />
              
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

        {images.length === 0 && (
          <div className="col-span-full text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            No images added yet. Enter an image URL above to add one.
          </div>
        )}
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
    <div className="w-full overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm min-w-[600px] md:min-w-0">
        <thead>
          <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} className="text-left px-3 md:px-5 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}>
                {col.label}
              </th>
            ))}
            <th className="text-right px-3 md:px-5 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
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
                  <td key={col.key} className="px-3 md:px-5 py-3 md:py-3.5" style={{ color: 'var(--text-primary)' }}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span className="truncate block max-w-[120px] md:max-w-xs">{row[col.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-3 md:px-5 py-3 md:py-3.5">
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
const TABS = ['Overview', 'Categories', 'Subcategories', 'Products', 'Users', 'Orders']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Modal and custom Form Attachment States
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({})
  const [formVariants, setFormVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  useEffect(() => {
    async function fetchAll() {
      try {
        const [c, s, p, u] = await Promise.all([
          categoriesApi.list().catch(() => ({ data: [] })),
          subcategoriesApi.list().catch(() => ({ data: [] })),
          productsApi.list().catch(() => ({ data: [] })),
          usersApi.list().catch(() => ({ data: [] })),
        ])
        setCategories(c.data)
        setSubcategories(s.data)
        setProducts(p.data)
        setUsers(u.data)
      } catch {}
      try {
        const { data: o } = await ordersApi.adminList()
        setOrders(o)
      } catch {}
      setLoading(false)
    }
    fetchAll()
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
  const openProductModal = async (data = null) => {
    const baseImages = (data?.images?.length ? data.images : null)?.map((img, index) => (
      typeof img === 'string'
        ? { id: `img-${index}`, url: img }
        : { id: img.id || `img-${index}`, url: img.url || img }
    )) || [
      { id: '1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
      { id: '2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' }
    ]
    setForm(data
      ? { name: data.name, price: data.price, description: data.description, category_id: data.category_id, subcategory_id: data.subcategory_id, images: baseImages, stock: data.stock ?? 0 }
      : { name: '', price: '', description: '', category_id: categories[0]?.id || '', subcategory_id: '', images: [], stock: 0 })
    setModal({ type: 'product', data })
    setError('')
    if (data?.id) {
      try {
        const { data: variants } = await productsApi.getVariants(data.id)
        setFormVariants(variants || [])
      } catch { setFormVariants([]) }
    } else {
      setFormVariants([])
    }
  }
  const saveProduct = async () => {
    const { name, price, description, category_id, subcategory_id, images, stock } = form
    if (!name?.trim() || !price || !description?.trim() || !category_id || !subcategory_id)
      return setError('All fields are required')
    setSaving(true)
    try {
      const payload = {
        name,
        slug: form.slug?.trim() || generateSlug(name, modal.data?.id || Date.now()),
        price: Number(price),
        description,
        images: (images || []).map(img => img.url).filter(Boolean),
        stock: Number(stock || 0),
        category_id: Number(category_id),
        subcategory_id: Number(subcategory_id),
      }
      let savedProduct
      if (modal.data) {
        const { data } = await productsApi.update(modal.data.id, payload)
        savedProduct = data
        setProducts(prev => prev.map(p => p.id === data.id ? data : p))
      } else {
        const { data } = await productsApi.create(payload)
        savedProduct = data
        setProducts(prev => [...prev, data])
      }
      // Sync variants: get current backend variants, create new ones, remove deleted ones
      const { data: backendVariants } = await productsApi.getVariants(savedProduct.id)
      const backendIds = (backendVariants || []).map(v => v.id)
      const wantedIds = formVariants.filter(v => typeof v.id === 'number').map(v => v.id)
      for (const v of formVariants) {
        if (!backendIds.includes(v.id)) {
          await productsApi.createVariant(savedProduct.id, { type: v.type, value: v.value, price_adjustment: v.price_adjustment, stock: v.stock })
        }
      }
      for (const backendId of backendIds) {
        if (!wantedIds.includes(backendId)) {
          await productsApi.deleteVariant(savedProduct.id, backendId)
        }
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
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
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
              ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'white' }
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
                <StatCard icon={Layers} label="Categories" value={categories.length} color="var(--accent)" delay={0} />
                <StatCard icon={Grid3x3} label="Subcategories" value={subcategories.length} color="#3b82f6" delay={0.08} />
                <StatCard icon={Package} label="Products" value={products.length} color="#22c55e" delay={0.16} />
                <StatCard icon={Users} label="Users" value={users.length} color="#f59e0b" delay={0.24} />
              </div>

              {/* Real stats this week */}
              <FadeIn>
                {(() => {
                  const weekStart = getWeekStart()
                  const ordersThisWeek = orders.filter(o => new Date(o.created_at) >= weekStart)
                  const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                  const usersThisWeek = users.filter(u => new Date(u.created_at) >= weekStart)
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--accent-rgb),0.15)' }}>
                          <ShoppingCart size={18} className="text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Orders This Week</p>
                          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{ordersThisWeek.length}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                          <DollarSign size={18} className="text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue This Week</p>
                          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{revenueThisWeek.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                          <UserPlus size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>New Users This Week</p>
                          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{usersThisWeek.length}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Categories ({categories.length})</h2>
                <button onClick={() => openCategoryModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer w-full sm:w-auto justify-center">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Subcategories ({subcategories.length})</h2>
                <button onClick={() => openSubModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer w-full sm:w-auto justify-center">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Products ({products.length})</h2>
                <button onClick={() => openProductModal()} className="btn-primary text-sm px-4 py-2.5 cursor-pointer w-full sm:w-auto justify-center">
                  <Plus size={14} /> Add Product
                </button>
              </div>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="input-field w-full pl-10 text-sm"
                />
              </div>
              {(() => {
                const filtered = productSearch
                  ? products.filter(p => p.name?.toLowerCase().includes(productSearch.toLowerCase()))
                  : products
                return (
                  <AdminTable
                    columns={[
                      { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                      { key: 'name', label: 'Name' },
                      { key: 'price', label: 'Price', render: v => <span className="font-semibold text-gradient">₹{v.toLocaleString()}</span> },
                      { key: 'category_name', label: 'Category', render: v => v || '—' },
                      { key: 'subcategory_name', label: 'Subcategory', render: v => v || '—' },
                    ]}
                    rows={filtered}
                    onEdit={(row) => openProductModal(row)}
                    onDelete={(row) => handleDelete(row, 'product')}
                  />
                )
              })()}
            </FadeIn>
          )}

          {/* ── Users ── */}
          {tab === 'Users' && (
            <FadeIn>
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Users ({users.length})</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="input-field w-full pl-10 text-sm"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="input-field text-sm w-full sm:w-40"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              {(() => {
                let filtered = users
                if (userRoleFilter !== 'all') {
                  filtered = filtered.filter(u => u.role === userRoleFilter)
                }
                if (userSearch) {
                  const q = userSearch.toLowerCase()
                  filtered = filtered.filter(u =>
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.first_name && u.first_name.toLowerCase().includes(q)) ||
                    (u.last_name && u.last_name.toLowerCase().includes(q))
                  )
                }
                return (
                  <AdminTable
                    columns={[
                      { key: 'id', label: 'ID', render: v => <span className="badge-purple">#{v}</span> },
                      {
                        key: 'name', label: 'Name',
                        render: (v, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—'
                      },
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
                                background: v === 'admin' ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(34,197,94,0.15)',
                                color: v === 'admin' ? 'var(--accent)' : '#22c55e',
                                border: `1px solid ${v === 'admin' ? 'rgba(var(--accent-rgb),0.3)' : 'rgba(34,197,94,0.3)'}`,
                              }}
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: v === 'admin' ? 'var(--accent)' : '#22c55e' }} />
                          </div>
                        )
                      },
                    ]}
                    rows={filtered}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                )
              })()}
            </FadeIn>
          )}

          {/* ── Orders ── */}
          {tab === 'Orders' && (
            <FadeIn>
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Orders ({orders.length})</h2>
              {/* ── Search / Filter Bar ── */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer name..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm outline-none font-semibold capitalize appearance-none cursor-pointer"
                  style={{ background: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--border)', minWidth: 130 }}
                >
                  <option value="all">All Status</option>
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Order #</th>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Customer</th>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</th>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Note</th>
                      <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(order => {
                      const matchesSearch = !orderSearch
                        || order.order_number?.toLowerCase().includes(orderSearch.toLowerCase())
                        || order.shipping_name?.toLowerCase().includes(orderSearch.toLowerCase())
                      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
                      return matchesSearch && matchesStatus
                    }).map((order, i) => {
                      const statusColors = {
                        pending: { bg: 'rgba(234,179,8,0.15)', text: '#eab308' },
                        confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
                        shipped: { bg: 'rgba(var(--accent-rgb),0.15)', text: 'var(--accent)' },
                        delivered: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
                        cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
                      }
                      const sc = statusColors[order.status] || { bg: 'rgba(100,116,139,0.15)', text: '#64748b' }
                      return (
                        <tr key={order.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'transparent' }}>
                          <td className="px-5 py-3.5" style={{ color: 'var(--text-primary)' }}>
                            <span className="font-mono text-xs">{order.order_number}</span>
                          </td>
                          <td className="px-5 py-3.5" style={{ color: 'var(--text-primary)' }}>{order.shipping_name}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-gradient">₹{order.total_amount?.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize inline-flex items-center gap-1.5" style={{ background: sc.bg, color: sc.text }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.text }} />
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <input
                              type="text"
                              placeholder="Message to user..."
                              className="text-xs px-2 py-1.5 rounded-lg w-32 outline-none"
                              style={{ background: 'var(--surface-raised)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                              id={`note-${order.id}`}
                              defaultValue=""
                            />
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value
                                  const note = document.getElementById(`note-${order.id}`)?.value || ''
                                  try {
                                    await ordersApi.updateStatus(order.id, newStatus, note)
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
                                    document.getElementById(`note-${order.id}`).value = ''
                                  } catch (err) {
                                    console.error('Status update failed:', err)
                                  }
                                }}
                                className="text-xs pl-3 pr-8 py-2 rounded-xl outline-none appearance-none cursor-pointer font-semibold transition-all"
                                style={{
                                  background: sc.bg,
                                  color: sc.text,
                                  border: `1px solid ${sc.text}33`,
                                }}
                              >
                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                                  <option key={s} value={s} style={{ color: statusColors[s]?.text || '#64748b' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sc.text }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                          No orders yet
                        </td>
                      </tr>
                    )}
                    {orders.length > 0 && orders.filter(order => {
                      const ms = !orderSearch || order.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) || order.shipping_name?.toLowerCase().includes(orderSearch.toLowerCase())
                      const mf = statusFilter === 'all' || order.status === statusFilter
                      return ms && mf
                    }).length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                          No orders match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock ?? 0}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              {/* Integrated Image Gallery Drag-and-Drop Attachment Stage */}
              <ImageGallerySortCanvas
                images={form.images || []}
                onSequenceChange={(updatedImages) => setForm(f => ({ ...f, images: updatedImages }))}
              />

              {/* Variants */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>Variants</label>
                <div className="space-y-2 mb-3">
                  {formVariants.map((v, i) => (
                    <div key={v.id || i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', minWidth: 60, textAlign: 'center' }}>{v.type}</span>
                      <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{v.value}</span>
                      {v.price_adjustment > 0 && <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>+₹{v.price_adjustment}</span>}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stock: {v.stock}</span>
                      <button onClick={() => setFormVariants(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-400/10 text-red-400 cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Type (e.g. Size)"
                    className="input-field text-xs flex-1"
                    id="variant-type-input"
                  />
                  <input
                    type="text"
                    placeholder="Values, comma-separated (e.g. S, M, L)"
                    className="input-field text-xs flex-[2]"
                    id="variant-value-input"
                  />
                  <input
                    type="number"
                    placeholder="+₹"
                    className="input-field text-xs w-20"
                    id="variant-price-input"
                    defaultValue="0"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="input-field text-xs w-20"
                    id="variant-stock-input"
                    defaultValue="0"
                    min="0"
                  />
                  <button
                    onClick={() => {
                      const typeInput = document.getElementById('variant-type-input')
                      const valueInput = document.getElementById('variant-value-input')
                      const priceInput = document.getElementById('variant-price-input')
                      const stockInput = document.getElementById('variant-stock-input')
                      const type = typeInput?.value?.trim()
                      const valuesRaw = valueInput?.value?.trim()
                      if (!type || !valuesRaw) return
                      const values = valuesRaw.split(',').map(v => v.trim()).filter(Boolean)
                      if (values.length === 0) return
                      const priceAdj = parseInt(priceInput?.value || '0', 10) || 0
                      const stock = parseInt(stockInput?.value || '0', 10) || 0
                      setFormVariants(prev => [...prev, ...values.map(v => ({ id: Date.now() + Math.random(), type, value: v, price_adjustment: priceAdj, stock }))])
                      typeInput.value = ''
                      valueInput.value = ''
                      priceInput.value = '0'
                      stockInput.value = '0'
                    }}
                    className="btn-primary text-xs px-3 py-2 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
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
