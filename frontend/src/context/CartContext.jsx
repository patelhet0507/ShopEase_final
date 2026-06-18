import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi, wishlistApi } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'shopease_guest_cart'

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total_quantity: 0, subtotal: 0 })
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  // Load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem(GUEST_CART_KEY)
      if (savedCart) {
        return JSON.parse(savedCart)
      }
    } catch {}
    return { items: [], total_quantity: 0, subtotal: 0 }
  }, [])

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((cartData) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData))
    } catch {}
  }, [])

  const fetchCart = useCallback(async () => {
    if (!user) {
      const guestCart = loadGuestCart()
      setCart(guestCart)
      return
    }
    try {
      const { data } = await cartApi.get(user.id)
      setCart(data)
    } catch {}
  }, [user, loadGuestCart])

  const fetchWishlist = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await wishlistApi.get(user.id)
      setWishlist(data)
    } catch {}
  }, [user])

  // Sync guest cart to server when user logs in
  useEffect(() => {
    if (user) {
      const guestCart = loadGuestCart()
      if (guestCart.items.length > 0) {
        // Sequentially update cart context items
        guestCart.items.forEach(async (item) => {
          try {
            await cartApi.add(user.id, { product_id: item.product_id, quantity: item.quantity })
          } catch {}
        })
        localStorage.removeItem(GUEST_CART_KEY)
        fetchCart()
      } else {
        fetchCart()
      }
      fetchWishlist()
    } else {
      const guestCart = loadGuestCart()
      setCart(guestCart)
    }
  }, [user, loadGuestCart, fetchCart, fetchWishlist])

  // Optimized to account for Fly-To-Cart Trajectory Timings
  const addToCart = useCallback(async (productId, quantity = 1, productName = '', productPrice = 0) => {
    setCartLoading(true)
    try {
      if (user) {
        const { data } = await cartApi.add(user.id, { product_id: productId, quantity })
        setCart(data)
      } else {
        const guestCart = loadGuestCart()
        const existingItem = guestCart.items.find(item => item.product_id === productId)
        
        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          guestCart.items.push({
            id: Date.now(), // Temporary ID for guest items
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity
          })
        }
        
        guestCart.total_quantity = guestCart.items.reduce((sum, item) => sum + item.quantity, 0)
        guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
        
        saveGuestCart(guestCart)
        setCart(guestCart)
      }
      
      // Delays drawer opening until the flying card particle animation lands (750ms)
      setTimeout(() => {
        setCartOpen(true)
      }, 750)

    } finally {
      setCartLoading(false)
    }
  }, [user, loadGuestCart, saveGuestCart])

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    try {
      if (user) {
        const { data } = await cartApi.update(user.id, cartItemId, { quantity })
        setCart(data)
      } else {
        const guestCart = loadGuestCart()
        const item = guestCart.items.find(item => item.id === cartItemId)
        
        if (item) {
          if (quantity <= 0) {
            guestCart.items = guestCart.items.filter(i => i.id !== cartItemId)
          } else {
            item.quantity = quantity
          }
          
          guestCart.total_quantity = guestCart.items.reduce((sum, item) => sum + item.quantity, 0)
          guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
          
          saveGuestCart(guestCart)
          setCart(guestCart)
        }
      }
    } catch {}
  }, [user, loadGuestCart, saveGuestCart])

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      if (user) {
        const { data } = await cartApi.remove(user.id, cartItemId)
        setCart(data)
      } else {
        const guestCart = loadGuestCart()
        guestCart.items = guestCart.items.filter(item => item.id !== cartItemId)
        
        guestCart.total_quantity = guestCart.items.reduce((sum, item) => sum + item.quantity, 0)
        guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
        
        saveGuestCart(guestCart)
        setCart(guestCart)
      }
    } catch {}
  }, [user, loadGuestCart, saveGuestCart])

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await cartApi.clear(user.id)
      } else {
        localStorage.removeItem(GUEST_CART_KEY)
      }
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

  // 🟢 DERIVED EXPOSURES: Creates cross-compatible mapping properties to align 
  // with what Navbar and CartDrawer are parsing out
  const cartCount = cart?.total_quantity || 0
  
  // Normalizes subtotal object definitions across guest/db formats safely
  if (cart && cart.subtotal !== undefined && cart.total_price === undefined) {
    cart.total_price = cart.subtotal
  }

  return (
    <CartContext.Provider value={{
      cart, wishlist, cartOpen, setCartOpen, cartLoading,
      addToCart, 
      updateCartItem,
      updateCartQuantity: updateCartItem, // 🟢 ALIAS MATCH FOR CARTDRAWER
      removeFromCart, 
      clearCart,
      toggleWishlist, isWishlisted,
      fetchCart, fetchWishlist,
      cartCount                           // 🟢 ALIAS MATCH FOR NAVBAR
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