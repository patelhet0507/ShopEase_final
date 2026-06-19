import { createContext, useContext, useState, useCallback } from 'react'
import { authApi, usersApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shopease_user')
      if (!stored) {
        localStorage.removeItem('shopease_user')
        localStorage.removeItem('token')
        return null
      }
      return JSON.parse(stored)
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.login(email, password)
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('shopease_user', JSON.stringify(data.user))
        setUser(data.user)
      } else {
        localStorage.setItem('shopease_user', JSON.stringify(data))
        setUser(data)
      }
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
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('shopease_user', JSON.stringify(data.user))
        setUser(data.user)
      } else {
        localStorage.setItem('shopease_user', JSON.stringify(data))
        setUser(data)
      }
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
    localStorage.removeItem('token')
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersApi.getProfile()
      setUser(data)
      localStorage.setItem('shopease_user', JSON.stringify(data))
      return data
    } catch (err) {
      return null
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser, setUser, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
