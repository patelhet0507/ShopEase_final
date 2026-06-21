import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi, wishlistApi } from '../api'
import { useAuth } from './AuthContext'
import { Modal } from '../components/ui'

const CartContext = createContext(null)

const LOCAL_CART_KEY = 'shopease_guest_cart'

function loadLocalCart() {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { items: [], total_quantity: 0, subtotal: 0 }
}

function saveLocalCart(cart) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
}

function clearLocalCart() {
  localStorage.removeItem(LOCAL_CART_KEY)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total_quantity: 0, subtotal: 0 })
  const [localCart, setLocalCart] = useState(loadLocalCart)
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  // Persist local cart to localStorage
  useEffect(() => {
    if (!user) {
      saveLocalCart(localCart)
    }
  }, [localCart, user])

  const activeCart = user ? cart : localCart

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

  const addToCart = useCallback(async (productId, quantity = 1, productInfo = {}) => {
    if (user?.id) {
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
    } else {
      setLocalCart(prev => {
        const existing = prev.items.find(i => Number(i.product_id) === Number(productId))
        let newItems
        if (existing) {
          newItems = prev.items.map(i =>
            Number(i.product_id) === Number(productId)
              ? { ...i, quantity: i.quantity + Number(quantity) }
              : i
          )
        } else {
          newItems = [...prev.items, {
            id: Date.now(),
            product_id: Number(productId),
            quantity: Number(quantity),
            product_name: productInfo.name || productInfo.product_name || `Product #${productId}`,
            product_price: productInfo.price || productInfo.product_price || 0,
          }]
        }
        const updated = {
          items: newItems,
          total_quantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: newItems.reduce((sum, i) => sum + ((i.product_price || 0) * i.quantity), 0),
        }
        return updated
      })
      setCartOpen(true)
    }
  }, [user, fetchCart])

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    if (user?.id) {
      try {
        await cartApi.update(user.id, cartItemId, { quantity: Number(quantity) })
        await fetchCart()
      } catch (err) {
        console.error("Update quantity operation failure:", err.response?.data || err.message)
      }
    } else {
      setLocalCart(prev => {
        const newItems = prev.items.map(i =>
          Number(i.id) === Number(cartItemId) ? { ...i, quantity: Number(quantity) } : i
        )
        return {
          items: newItems,
          total_quantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: newItems.reduce((sum, i) => sum + ((i.product_price || 0) * i.quantity), 0),
        }
      })
    }
  }, [user, fetchCart])

  const removeFromCart = useCallback(async (cartItemId) => {
    if (user?.id) {
      try {
        await cartApi.remove(user.id, cartItemId)
        await fetchCart()
      } catch (err) {
        console.error("Remove operation failure:", err.response?.data || err.message)
      }
    } else {
      setLocalCart(prev => {
        const newItems = prev.items.filter(i => Number(i.id) !== Number(cartItemId))
        return {
          items: newItems,
          total_quantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: newItems.reduce((sum, i) => sum + ((i.product_price || 0) * i.quantity), 0),
        }
      })
    }
  }, [user, fetchCart])

  const clearCart = useCallback(async () => {
    if (user?.id) {
      try {
        await cartApi.clear(user.id)
        setCart({ items: [], total_quantity: 0, subtotal: 0 })
      } catch (err) {
        console.error("Clear cart sequence encountered error:", err.response?.data || err.message)
      }
    } else {
      setLocalCart({ items: [], total_quantity: 0, subtotal: 0 })
      clearLocalCart()
    }
  }, [user])

  const toggleWishlist = useCallback(async (productId) => {
    if (!user?.id) {
      setModalMessage('Please log in to manage your wishlist.')
      setShowLoginModal(true)
      return
    }

    const targetId = Number(productId)
    const existingItem = wishlist.find(item => item.product_id === targetId)

    try {
      if (existingItem) {
        await wishlistApi.remove(user.id, existingItem.id)
        setWishlist(prev => prev.filter(item => item.id !== existingItem.id))
      } else {
        const { data } = await wishlistApi.add(user.id, { product_id: targetId })
        setWishlist(prev => [...prev, data])
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err.response?.data || err.message)
    }
  }, [user, wishlist])

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(item => Number(item.product_id) === Number(productId))
  }, [wishlist])

  return (
    <CartContext.Provider
      value={{
        cart: activeCart,
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
        setModalMessage,
        localCart,
        setLocalCart,
      }}
    >
      {children}

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