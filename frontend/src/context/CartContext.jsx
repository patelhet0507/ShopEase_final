import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi, wishlistApi } from '../api'
import { useAuth } from './AuthContext'

// 🟢 Uses the shared module file location
import { Modal } from '../components/ui'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total_quantity: 0, subtotal: 0 })
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const fetchCart = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await cartApi.get(user.id)
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
      setCart({ items: [], total_quantity: 0, subtotal: 0 })
      setWishlist([])
    }
  }, [user, fetchCart, fetchWishlist])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user?.id) {
      setModalMessage('Please log in to manage your cart items.')
      setShowLoginModal(true)
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
      console.error("Add operation failure:", err.response?.data || err.message)
    } finally {
      setCartLoading(false)
    }
  }, [user, fetchCart])

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    if (!user?.id) return
    try {
      await cartApi.update(user.id, cartItemId, { quantity: Number(quantity) })
      await fetchCart()
    } catch (err) {
      console.error("Update quantity operation failure:", err.response?.data || err.message)
    }
  }, [user, fetchCart])

  const removeFromCart = useCallback(async (cartItemId) => {
    if (!user?.id) return
    try {
      await cartApi.remove(user.id, cartItemId)
      await fetchCart()
    } catch (err) {
      console.error("Remove operation failure:", err.response?.data || err.message)
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
      setModalMessage('Please log in to manage your wishlist.')
      setShowLoginModal(true)
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
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        cartLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        fetchCart,
        fetchWishlist,
        setShowLoginModal,
        setModalMessage
      }}
    >
      {children}

      {/* 🟢 Fixed: Changed prop name to matching lowercase 'open' configuration */}
      <Modal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        title="Login Required"
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {modalMessage}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => setShowLoginModal(false)}
            className="btn-primary w-full py-2.5 justify-center rounded-xl font-semibold text-xs cursor-pointer"
          >
            OK
          </button>
        </div>
      </Modal>
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}