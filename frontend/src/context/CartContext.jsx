import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi, wishlistApi } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total_quantity: 0, subtotal: 0 })
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await cartApi.get(user.id)
      setCart(data)
    } catch {}
  }, [user])

  const fetchWishlist = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await wishlistApi.get(user.id)
      setWishlist(data)
    } catch {}
  }, [user])

  useEffect(() => {
    fetchCart()
    fetchWishlist()
  }, [fetchCart, fetchWishlist])

  // Optimized to account for Fly-To-Cart Trajectory Timings
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user) return
    setCartLoading(true)
    try {
      const { data } = await cartApi.add(user.id, { product_id: productId, quantity })
      setCart(data)
      
      // Delays drawer opening until the flying card particle animation lands (750ms)
      setTimeout(() => {
        setCartOpen(true)
      }, 750)

    } finally {
      setCartLoading(false)
    }
  }, [user])

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    if (!user) return
    try {
      const { data } = await cartApi.update(user.id, cartItemId, { quantity })
      setCart(data)
    } catch {}
  }, [user])

  const removeFromCart = useCallback(async (cartItemId) => {
    if (!user) return
    try {
      const { data } = await cartApi.remove(user.id, cartItemId)
      setCart(data)
    } catch {}
  }, [user])

  const clearCart = useCallback(async () => {
    if (!user) return
    try {
      await cartApi.clear(user.id)
      setCart({ items: [], total_quantity: 0, subtotal: 0 })
    } catch {}
  }, [user])

  const toggleWishlist = useCallback(async (productId) => {
    if (!user) return
    const isWishlisted = wishlist.some(w => w.product_id === productId)
    try {
      if (isWishlisted) {
        await wishlistApi.remove(user.id, productId)
        setWishlist(prev => prev.filter(w => w.product_id !== productId))
      } else {
        const { data } = await wishlistApi.add(user.id, { product_id: productId })
        setWishlist(prev => [data, ...prev])
      }
    } catch {}
  }, [user, wishlist])

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(w => w.product_id === productId)
  }, [wishlist])

  return (
    <CartContext.Provider value={{
      cart, wishlist, cartOpen, setCartOpen, cartLoading,
      addToCart, updateCartItem, removeFromCart, clearCart,
      toggleWishlist, isWishlisted,
      fetchCart, fetchWishlist,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
