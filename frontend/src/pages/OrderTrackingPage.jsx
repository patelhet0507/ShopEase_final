import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import { ordersApi } from '../api'

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_META = {
  pending:    { icon: Clock,        color: '#eab308', label: 'Pending' },
  confirmed:  { icon: CheckCircle,  color: '#3b82f6', label: 'Confirmed' },
  shipped:    { icon: Truck,        color: '#a855f7', label: 'Shipped' },
  delivered:  { icon: Package,      color: '#22c55e', label: 'Delivered' },
  cancelled:  { icon: XCircle,      color: '#ef4444', label: 'Cancelled' },
}

export default function OrderTrackingPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [orderNumber])

  async function fetchOrder() {
    try {
      const { data: orders } = await ordersApi.list()
      const match = orders.find(o => o.order_number === orderNumber)
      if (match) {
        const { data: fullOrder } = await ordersApi.get(match.id)
        setOrder(fullOrder)
        const { data: evts } = await ordersApi.getEvents(match.id)
        setEvents(evts)
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? STEPS.indexOf(order.status) : -1
  const isCancelled = order?.status === 'cancelled'
  const StatusIcon = STATUS_META[order?.status]?.icon

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--neon)' }} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Not Found</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>We couldn't find your order.</p>
          <Link to="/orders" className="btn-primary inline-flex items-center gap-2">My Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Order header */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Link to="/orders" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>My Orders</Link>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{order.order_number}</span>
        </div>

        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Order {order.order_number}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold capitalize" style={{
              background: `${STATUS_META[order.status]?.color}18`,
              color: STATUS_META[order.status]?.color,
            }}>
              {StatusIcon && <StatusIcon size={16} />}
              {STATUS_META[order.status]?.label}
            </div>
          </div>

          {/* Progress Timeline */}
          {!isCancelled ? (
            <div className="relative py-4">
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
              {STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                const meta = STATUS_META[step]
                const Icon = meta.icon
                return (
                  <div key={step} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'shadow-lg' : 'opacity-40'}`}
                      style={{ background: isCompleted ? meta.color : 'var(--surface-raised)', border: isCompleted ? 'none' : '2px solid var(--border)' }}>
                      <Icon size={16} className={isCompleted ? 'text-white' : ''} style={{ color: isCompleted ? 'white' : 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="font-semibold text-sm" style={{ color: isCurrent ? meta.color : 'var(--text-primary)' }}>{meta.label}</p>
                      {events.filter(e => e.status === step).map((evt, ei) => (
                        <div key={ei}>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {new Date(evt.created_at).toLocaleString('en-IN')}
                          </p>
                          {evt.note && (
                            <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>"{evt.note}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle size={48} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
              <p className="text-lg font-semibold" style={{ color: '#ef4444' }}>Order Cancelled</p>
              {events.filter(e => e.status === 'cancelled').map((evt, i) => (
                <p key={i} className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {evt.note && `"${evt.note}" — `}{new Date(evt.created_at).toLocaleString('en-IN')}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Shipping Info */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Shipping Details</h2>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.shipping_name}</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.shipping_mobile}</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.shipping_address}</p>
        </div>

        {/* Items */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Items</h2>
          {order.order_items?.map((item, i) => (
            <div key={i} className="flex justify-between py-2 text-sm" style={{ borderBottom: i < order.order_items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.product_name}{item.variant_type && item.variant_value ? ` (${item.variant_type}: ${item.variant_value})` : ''} x {item.quantity}</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{(item.product_price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 mt-2 font-bold text-lg" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-primary)' }}>Total</span>
            <span className="text-gradient">₹{order.total_amount?.toLocaleString()}</span>
          </div>
        </div>

        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    </motion.div>
  )
}
