import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, ShoppingBag, Home, ArrowRight, Package, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

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
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const pageH = 297
      const margin = 18
      const contentW = pageW - margin * 2

      // Watermark
      doc.setTextColor(245, 235, 255)
      doc.setFontSize(68)
      doc.setFont('helvetica', 'bold')
      for (let y = -60; y < pageH + 60; y += 70) {
        for (let x = -60; x < pageW + 60; x += 110) {
          doc.text('ShopEase', x, y, { angle: 30 })
        }
      }

      // Draw border
      doc.setDrawColor(168, 85, 247)
      doc.setLineWidth(0.8)
      doc.rect(margin - 2, margin - 2, contentW + 4, pageH - margin * 2 + 4)
      doc.setDrawColor(200, 160, 240)
      doc.setLineWidth(0.3)
      doc.rect(margin - 1, margin - 1, contentW + 2, pageH - margin * 2 + 2)

      // Logo
      doc.setFillColor(168, 85, 247)
      doc.rect(margin, 24, 14, 14, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('SE', margin + 2.5, 34.5)

      doc.setTextColor(30, 30, 30)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('ShopEase', margin + 20, 35)

      doc.setFontSize(15)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(168, 85, 247)
      doc.text('INVOICE', margin + 20, 45)

      // Invoice meta right side
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Invoice #', pageW - margin - 60, 28)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`${order.order_number}`, pageW - margin - 60, 35)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text('Date:', pageW - margin - 60, 44)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), pageW - margin - 60, 51)

      // Divider
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(margin, 54, pageW - margin, 54)

      // Bill To
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('BILL TO', margin, 66)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      let billY = 73
      doc.text(order.shipping_name || 'N/A', margin, billY)
      billY += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text(order.shipping_mobile || '', margin, billY)
      billY += 5
      const addrLines = doc.splitTextToSize(order.shipping_address || '', 80)
      addrLines.forEach(line => { doc.text(line, margin, billY); billY += 4.5 })

      // Payment info right side
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('PAYMENT', pageW - margin - 55, 66)
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal')
      doc.text('Method:', pageW - margin - 55, 74)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.text('Cash on Delivery', pageW - margin - 22, 74)
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal')
      doc.text('Status:', pageW - margin - 55, 81)
      doc.setTextColor(34, 197, 94)
      doc.setFont('helvetica', 'bold')
      doc.text((order.status || 'Pending').toUpperCase(), pageW - margin - 22, 81)

      // Items table
      let tableY = billY + 8
      const items = order.order_items || []
      const tableData = items.map((item, i) => [
        `${i + 1}`,
        item.product_name || 'Product',
        `${item.quantity}`,
        `₹${Number(item.product_price || 0).toLocaleString()}`,
        `₹${(Number(item.product_price || 0) * item.quantity).toLocaleString()}`
      ])

      doc.autoTable({
        startY: tableY,
        head: [['#', 'Item', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'plain',
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          cellPadding: 3.5,
        },
        alternateRowStyles: {
          fillColor: [248, 245, 255],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin, right: margin },
        tableLineColor: [230, 230, 230],
        tableLineWidth: 0.2,
      })

      // Total section
      const finalY = doc.lastAutoTable.finalY + 8
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(margin, finalY, pageW - margin, finalY)

      const totalY = finalY + 8
      doc.setTextColor(80, 80, 80)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Total Amount:', margin, totalY)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(`₹${Number(order.total_amount || 0).toLocaleString()}`, pageW - margin - 30, totalY, { align: 'right' })

      // Footer
      const footerY = pageH - margin - 20
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(margin, footerY, pageW - margin, footerY)

      doc.setTextColor(168, 85, 247)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('ShopEase', margin, footerY + 8)

      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text('Thank you for your purchase!', margin, footerY + 15)
      doc.text('For any queries, contact support@shopease.com', margin, footerY + 20)

      doc.setFontSize(7)
      doc.setTextColor(180, 180, 180)
      doc.text('Page 1 of 1', pageW - margin, footerY + 15, { align: 'right' })

      doc.save(`receipt_${order.order_number}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF receipt. Please try again.')
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
