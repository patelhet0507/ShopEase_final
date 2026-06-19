import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import VerificationBanner from './VerificationBanner'
import CartDrawer from '../cart/CartDrawer'
import { useCart } from '../../context/CartContext'

export default function Layout() {
  const { cartOpen, setCartOpen } = useCart()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <VerificationBanner />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
