import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api/index'
import { motion } from 'framer-motion'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Continue Shopping
          </button>
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
          quantity: item.quantity
        }))
      }

      const response = await ordersApi.create(user.id, orderPayload)
      
      if (response.data) {
        navigate(`/order-confirmation/${response.data.order_number}`)
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-slate-900">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Order Summary</h2>
            
            <div className="space-y-4 mb-6 border-b pb-6">
              {cart.items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.product?.name}</p>
                    <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-slate-900">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-900">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="shipping_name"
                  value={formData.shipping_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  name="shipping_mobile"
                  value={formData.shipping_mobile}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                  placeholder="+91-9999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900">Payment Method</p>
                <p className="text-lg font-bold text-blue-900 mt-2">💳 Cash on Delivery (COD)</p>
                <p className="text-sm text-blue-700 mt-2">Pay when your order arrives at your doorstep</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Creating Order...' : 'Place Order (COD)'}
              </button>
            </form>
          </motion.div>

          {/* Price Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24"
          >
            <h3 className="text-xl font-bold mb-6 text-slate-900">Price Summary</h3>
            
            <div className="space-y-4 border-b pb-4 mb-4">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span className="font-semibold">₹{cart.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Tax</span>
                <span className="font-semibold">₹0</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold text-slate-900 mb-6">
              <span>Total</span>
              <span className="text-blue-600">₹{cart.subtotal?.toLocaleString()}</span>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-green-900">✓ Secure Checkout</p>
              <p className="text-xs text-green-700 mt-1">Your information is encrypted</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
