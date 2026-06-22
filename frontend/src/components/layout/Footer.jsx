import { Link } from 'react-router-dom'
import { Zap, ShoppingBag, Heart, Grid3x3, Mail, MapPin, Phone } from 'lucide-react'

const LINK_GROUPS = [
  {
    title: 'Quick Links',
    links: [
      { to: '/', label: 'Home' },
      { to: '/products', label: 'Shop All' },
      { to: '/categories', label: 'Categories' },
      { to: '/cart', label: 'Cart' },
    ]
  },
  {
    title: 'Support',
    links: [
      { to: '/orders', label: 'My Orders' },
      { to: '/profile', label: 'My Account' },
      { to: '/wishlist', label: 'Wishlist' },
    ]
  },
]

export default function Footer() {
  return (
    <footer className="border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border-warm)' }}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                Shop<span className="text-gradient">Ease</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Curated products that celebrate quality, sustainability, and timeless design. Discover your next favorite.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}>
                <Mail size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}>
                <MapPin size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}>
                <Phone size={14} style={{ color: 'var(--accent)' }} />
              </div>
            </div>
          </div>

          {/* Link Groups */}
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / Badge */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Trusted by thousands
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: `linear-gradient(135deg, rgba(var(--accent-rgb),${0.3 - i * 0.05}), rgba(var(--accent-dark-rgb),${0.2 - i * 0.03}))`,
                      borderColor: 'var(--surface)',
                      color: 'white'
                    }}
                  >
                    {['JD', 'AK', 'SM', 'PL'][i - 1]}
                  </div>
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>4.9★ avg rating</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Join thousands of happy customers shopping with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-6" style={{ borderColor: 'var(--border-warm)' }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
