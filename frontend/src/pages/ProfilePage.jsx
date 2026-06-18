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
    if (!user) return
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      address: user.address || '',
      mobile_number: user.mobile_number || ''
    })
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
      className="min-h-screen py-12 px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl shadow-lg p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="mb-8 font-medium" style={{ color: 'var(--text-secondary)' }}>Manage your personal information</p>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}
            >
              <p className="font-semibold" style={{ color: '#22c55e' }}>Profile updated successfully!</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition font-medium"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg font-medium cursor-not-allowed"
                style={{
                  background: 'var(--surface-raised)',
                  border: '2px solid var(--border)',
                  color: 'var(--text-muted)',
                  opacity: 0.7,
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mobile Number</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
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
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 text-lg font-bold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>User ID</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.id}</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Role</p>
                <p className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
