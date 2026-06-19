import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, ShoppingBag, Home, ArrowRight, Package, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api'

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(() => {
    try {
      const stored = sessionStorage.getItem('last_order')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.order_number === orderNumber) return parsed
      }
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(!order)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (order) {
      sessionStorage.removeItem('last_order')
      clearCart().catch(() => {})
      return
    }

    if (!user?.id) { setLoading(false); return }

    async function fetchOrder() {
      try {
        const { data: orders } = await ordersApi.list()
        const match = orders.find(o => o.order_number === orderNumber)
        if (match) {
          const { data: fullOrder } = await ordersApi.get(match.id)
          setOrder(fullOrder)
          await clearCart()
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderNumber, user?.id, clearCart, order])

  const generateReceiptContent = () => {
    if (!order) return ''

    let content = `SHOP EASE - ORDER RECEIPT\n`
    content += `================================\n\n`
    content += `Order Number: ${order.order_number}\n`
    content += `Date: ${new Date(order.created_at).toLocaleString()}\n\n`
    content += `SHIPPING INFORMATION\n`
    content += `-------------------\n`
    content += `Name: ${order.shipping_name}\n`
    content += `Mobile: ${order.shipping_mobile}\n`
    content += `Address: ${order.shipping_address}\n\n`
    content += `ORDER ITEMS\n`
    content += `-----------\n`

    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item, index) => {
        content += `${index + 1}. ${item.product_name || 'Product'}\n`
        content += `   Quantity: ${item.quantity}\n`
        content += `   Price: ₹${item.price_at_order ? item.price_at_order.toLocaleString() : 'N/A'}\n\n`
      })
    }

    content += `TOTAL\n`
    content += `-----\n`
    content += `Total Amount: ₹${order.total_amount ? order.total_amount.toLocaleString() : 'N/A'}\n\n`
    content += `Payment Method: Cash on Delivery (COD)\n`
    content += `Status: ${order.status || 'Pending'}\n\n`
    content += `================================\n`
    content += `Thank you for shopping with ShopEase!\n`

    return content
  }

  const downloadReceipt = async () => {
    if (!order) return

    setDownloading(true)
    try {
      const content = generateReceiptContent()
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${order.order_number}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Failed to download receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

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
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>We couldn't find your order. It may still be processing.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl shadow-lg p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)' }}
            >
              <CheckCircle size={40} style={{ color: '#22c55e' }} />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order Placed Successfully!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Thank you for your purchase</p>
            <div className="mt-4 inline-block px-4 py-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--neon)' }}>Order Number: {order.order_number}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--surface-raised)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Package size={20} style={{ color: 'var(--neon)' }} />
              Order Details
            </h2>

            <div className="space-y-4">
              {order.shipping_name && (
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Shipping To</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.shipping_name}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{order.shipping_mobile}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{order.shipping_address}</p>
                </div>
              )}

              {order.order_items && order.order_items.length > 0 ? (
                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Items Ordered</p>
                  <div className="space-y-2">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {item.product_name || 'Product'} x {item.quantity}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ₹{item.price_at_order ? (item.price_at_order * item.quantity).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No items found</p>
              )}

              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Total Amount</span>
                  <span className="text-2xl font-bold text-gradient">
                    ₹{order.total_amount ? order.total_amount.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Receipt Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadReceipt}
            disabled={downloading}
            className="btn-primary w-full justify-center py-4 text-lg font-bold mb-4"
          >
            {downloading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Receipt...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Receipt (ZIP)
              </>
            )}
          </motion.button>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to={`/order-tracking/${order.order_number}`}
              className="btn-primary flex items-center justify-center gap-2 py-3"
            >
              <Truck size={18} />
              Track Order
            </Link>
            <Link
              to="/products"
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <Home size={18} />
              Back to Home
            </Link>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            You will receive an email confirmation shortly.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
