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

  const downloadReceipt = async () => {
    if (!order) return

    setDownloading(true)
    try {
      const items = order.order_items || []
      const itemsHtml = items.map((item, i) => `
        <tr${i % 2 === 0 ? ' style="background:#f8f5ff"' : ''}>
          <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #eee">${i + 1}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.product_name || 'Product'}</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #eee">${item.quantity}</td>
          <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #eee">₹${Number(item.product_price || 0).toLocaleString()}</td>
          <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #eee;font-weight:600">₹${(Number(item.product_price || 0) * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Receipt ${order.order_number}</title>
<style>
  @page { margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 210mm; min-height: 297mm; padding: 16mm 14mm; position: relative; overflow: hidden; }
  .watermark { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
  .watermark span { position: absolute; font-size: 60px; font-weight: 900; color: #f0e8ff; letter-spacing: 8px; white-space: nowrap; transform-origin: center; }
  .border-outer { position: absolute; top: 12mm; left: 12mm; right: 12mm; bottom: 12mm; border: 2px solid #a855f7; border-radius: 4px; pointer-events: none; }
  .border-inner { position: absolute; top: 13mm; left: 13mm; right: 13mm; bottom: 13mm; border: 1px solid #d4b8f0; border-radius: 3px; pointer-events: none; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1; }
  .logo-area { display: flex; align-items: center; gap: 12px; }
  .logo { width: 36px; height: 36px; background: #a855f7; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 14px; }
  .brand { font-size: 26px; font-weight: 800; color: #1a1a1a; }
  .brand-sub { font-size: 16px; color: #a855f7; font-weight: 500; letter-spacing: 2px; }
  .meta { text-align: right; font-size: 11px; }
  .meta-label { color: #888; }
  .meta-value { font-weight: 700; color: #1a1a1a; font-size: 12px; margin-bottom: 2px; }
  .divider { border: none; border-top: 1px solid #ddd; margin: 14px 0; }
  .section-title { font-size: 10px; font-weight: 600; color: #888; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
  .bill-to { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .bill-detail { font-size: 11px; color: #555; line-height: 1.6; }
  .info-grid { display: flex; justify-content: space-between; margin-bottom: 18px; position: relative; z-index: 1; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; position: relative; z-index: 1; }
  th { background: #a855f7; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 10px; letter-spacing: 0.5px; }
  th:first-child { text-align: center; width: 30px; }
  th:nth-child(3) { text-align: center; width: 50px; }
  th:nth-child(4), th:nth-child(5) { text-align: right; width: 80px; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-top: 8px; border-top: 2px solid #ddd; position: relative; z-index: 1; }
  .total-label { font-size: 14px; font-weight: 600; color: #555; }
  .total-value { font-size: 20px; font-weight: 800; color: #1a1a1a; }
  .footer { position: absolute; bottom: 16mm; left: 14mm; right: 14mm; border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between; align-items: end; }
  .footer-brand { font-size: 11px; font-weight: 700; color: #a855f7; }
  .footer-text { font-size: 9px; color: #999; margin-top: 2px; }
  .footer-right { font-size: 9px; color: #bbb; text-align: right; }
  @media print { .no-print { display: none; } }
</style></head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="watermark">
    ${Array.from({length: 20}).map((_, i) => {
      const x = (i % 5) * 210 - 40
      const y = Math.floor(i / 5) * 280 - 40
      return '<span style="top:' + y + 'px;left:' + x + 'px;transform:rotate(-30deg)">ShopEase</span>'
    }).join('')}
  </div>

  <div class="header">
    <div class="logo-area">
      <div class="logo">SE</div>
      <div><div class="brand">ShopEase</div><div class="brand-sub">INVOICE</div></div>
    </div>
    <div class="meta">
      <div class="meta-label">Invoice #</div>
      <div class="meta-value">${order.order_number}</div>
      <div class="meta-label" style="margin-top:4px">Date</div>
      <div class="meta-value">${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>

  <hr class="divider">

  <div class="info-grid">
    <div>
      <div class="section-title">Bill To</div>
      <div class="bill-to">${order.shipping_name || 'N/A'}</div>
      <div class="bill-detail">${order.shipping_mobile || ''}</div>
      <div class="bill-detail">${(order.shipping_address || '').replace(/\\n/g, '<br>')}</div>
    </div>
    <div style="text-align:right">
      <div class="section-title">Payment</div>
      <div class="bill-detail">Method: <strong>Cash on Delivery</strong></div>
      <div class="bill-detail">Status: <strong style="color:#22c55e">${(order.status || 'Pending').toUpperCase()}</strong></div>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="total-row">
    <span class="total-label">Total Amount</span>
    <span class="total-value">₹${Number(order.total_amount || 0).toLocaleString()}</span>
  </div>

  <div class="footer">
    <div>
      <div class="footer-brand">ShopEase</div>
      <div class="footer-text">Thank you for your purchase!</div>
      <div class="footer-text">support@shopease.com</div>
    </div>
    <div class="footer-right">Page 1 of 1</div>
  </div>
</div>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${order.order_number}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating receipt:', error)
      alert('Failed to generate receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
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
            <div className="mt-4 inline-block px-4 py-2 rounded-lg" style={{ background: 'rgba(var(--accent-rgb),0.1)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Order Number: {order.order_number}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--surface-raised)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Package size={20} style={{ color: 'var(--accent)' }} />
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
                          {item.product_name || 'Product'}

                          {' x '}{item.quantity}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ₹{item.product_price ? (item.product_price * item.quantity).toLocaleString() : 'N/A'}
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
                Download Receipt (PDF)
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
