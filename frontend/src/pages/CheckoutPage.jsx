import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api/index'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shipping_name: user?.first_name || '',
    shipping_mobile: user?.mobile_number || '',
    shipping_address: user?.address || '',
  })


  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h1>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    const orderPayload = {
      shipping_name: formData.shipping_name,
      shipping_mobile: formData.shipping_mobile,
      shipping_address: formData.shipping_address,
      order_items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
      })),
    }

    console.log("ORDER PAYLOAD:", orderPayload)

    const response = await ordersApi.create(orderPayload)

    console.log("ORDER RESPONSE:", response.data)

    if (response.data?.order_number) {
      sessionStorage.setItem('last_order', JSON.stringify(response.data))
      navigate(`/order-confirmation/${response.data.order_number}`)
    }
  } catch (error) {
    console.error("FULL ORDER ERROR:", error)
    console.error("RESPONSE:", error.response?.data)

    alert(
      JSON.stringify(
        error.response?.data || error.message,
        null,
        2
      )
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12" style={{ color: 'var(--text-primary)' }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-xl shadow-lg p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>

            <div className="space-y-4 mb-6 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
              {cart.items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg gap-2"
                  style={{ background: 'var(--surface-raised)' }}
                >
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.product_name || item.product?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₹{((item.product_price || item.product?.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Full Name *</label>
                <input
                  type="text"
                  name="shipping_name"
                  value={formData.shipping_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mobile Number *</label>
                <input
                  type="tel"
                  name="shipping_mobile"
                  value={formData.shipping_mobile}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="+91-9999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="rounded-lg p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '2px solid rgba(168,85,247,0.2)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Method</p>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--neon)' }}>Cash on Delivery (COD)</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Pay when your order arrives at your doorstep</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 text-lg font-bold"
              >
                {loading ? 'Creating Order...' : 'Place Order (COD)'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl shadow-lg p-6 h-fit sticky top-24"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Price Summary</h3>

            <div className="space-y-4 border-b pb-4 mb-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{cart.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span className="font-semibold" style={{ color: '#22c55e' }}>FREE</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Tax</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹0</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span className="text-gradient">₹{cart.subtotal?.toLocaleString()}</span>
            </div>

            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Secure Checkout</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Your information is encrypted</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
