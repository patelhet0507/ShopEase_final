import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/index'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    mobile_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        address: user.address || '',
        mobile_number: user.mobile_number || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await usersApi.updateProfile(formData)
      if (response.data) {
        setUser(response.data)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      alert('Failed to update profile')
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
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-slate-900">My Profile</h1>
          <p className="text-slate-600 mb-8 font-medium">Manage your personal information</p>

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg"
            >
              <p className="text-green-700 font-semibold">✓ Profile updated successfully!</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                placeholder="+91-9999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-medium text-slate-900 placeholder-slate-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 font-medium">User ID</p>
                <p className="text-lg font-bold text-slate-900">{user?.id}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 font-medium">Role</p>
                <p className="text-lg font-bold text-slate-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
