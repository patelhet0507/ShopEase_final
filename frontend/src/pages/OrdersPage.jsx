import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { ordersApi } from '../api'

const STATUS_COLORS = {
  pending:    { bg: 'rgba(234,179,8,0.15)', text: '#eab308' },
  confirmed:  { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  shipped:    { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  delivered:  { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--neon)' }} />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Orders</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No orders yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Start shopping to see your orders here.</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2"><ShoppingBag size={16} /> Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const sc = STATUS_COLORS[order.status] || { bg: 'rgba(100,116,139,0.15)', text: '#64748b' }
              return (
                <Link key={order.id} to={`/order-tracking/${order.order_number}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-5 transition-all hover:shadow-md"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize inline-flex items-center gap-1.5" style={{ background: sc.bg, color: sc.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.text }} />
                          {order.status}
                        </span>
                        <span className="font-bold text-sm text-gradient">₹{order.total_amount?.toLocaleString()}</span>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
