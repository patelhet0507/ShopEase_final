import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shopease_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.login(email, password)
      setUser(data)
      localStorage.setItem('shopease_user', JSON.stringify(data))
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.register(email, password)
      setUser(data)
      localStorage.setItem('shopease_user', JSON.stringify(data))
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('shopease_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
