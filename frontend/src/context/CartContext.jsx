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
    if (!user?.id) return
    try {
      console.log("Adding to cart:", payload)
      const { data } = await cartApi.get(user.id)
      console.log("Cart API response:", data)
      setCart(data || { items: [], total_quantity: 0, subtotal: 0 })
    } catch (err) {
      console.error("Error fetching cart data:", err.response?.data || err.message)
    }
  }, [user])

  const fetchWishlist = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await wishlistApi.get(user.id)
      setWishlist(data || [])
    } catch (err) {
      console.error("Error fetching wishlist data:", err.response?.data || err.message)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchCart()
      fetchWishlist()
    } else {
      // Clear global contextual state on user sign out
      setCart({ items: [], total_quantity: 0, subtotal: 0 })
      setWishlist([])
    }
  }, [user, fetchCart, fetchWishlist])

  const addToCart = useCallback(async (productId, quantity = 1) => {
  if (!user?.id) {
    alert("Please log in to manage your cart items.")
    return
  }

  setCartLoading(true)

  try {
    const payload = {
      product_id: Number(productId),
      quantity: Number(quantity)
    }

    await cartApi.add(user.id, payload)

    await fetchCart()

    setCartOpen(true)
  } catch (err) {
    console.error(
      "Add operation failure:",
      err.response?.data || err.message
    )
  } finally {
    setCartLoading(false)
    }
  }, [user, fetchCart])

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
  if (!user?.id) return

  try {
    await cartApi.update(user.id, cartItemId, {
      quantity: Number(quantity)
    })

    await fetchCart()
  } catch (err) {
    console.error(
      "Update quantity operation failure:",
      err.response?.data || err.message)
    }
  }, [user, fetchCart])

  const removeFromCart = useCallback(async (cartItemId) => {
  if (!user?.id) return

  try {
    await cartApi.remove(user.id, cartItemId)

    await fetchCart()
  } catch (err) {
    console.error(
      "Remove operation failure:",
      err.response?.data || err.message
    )
  }
}, [user, fetchCart])

  const clearCart = useCallback(async () => {
    if (!user?.id) return
    try {
      await cartApi.clear(user.id)
      setCart({ items: [], total_quantity: 0, subtotal: 0 })
    } catch (err) {
      console.error("Clear cart sequence encountered error:", err.response?.data || err.message)
    }
  }, [user])

  const toggleWishlist = useCallback(async (productId) => {
    if (!user?.id) {
      alert("Please log in to manage your wishlist.")
      return
    }
    const targetId = parseInt(productId, 10)
    const isWishlisted = wishlist.some(w => w.product_id === targetId)
    try {
      if (isWishlisted) {
        await wishlistApi.remove(user.id, targetId)
        setWishlist(prev => prev.filter(w => w.product_id !== targetId))
      } else {
        const { data } = await wishlistApi.add(user.id, { product_id: targetId })
        if (data) setWishlist(prev => [data, ...prev])
      }
    } catch (err) {
      console.error("Wishlist conversion toggle error:", err.response?.data || err.message)
    }
  }, [user, wishlist])

  const isWishlisted = useCallback((productId) => {
    const targetId = parseInt(productId, 10)
    return wishlist.some(w => w.product_id === targetId)
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