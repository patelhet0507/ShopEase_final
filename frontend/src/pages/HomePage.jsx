import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, Lock, Award, Zap, Flame, Clock, Monitor, Shirt, Home, Palette, BookOpen, Music, Cpu, Smartphone, Headphones, Watch, Gamepad2, Dumbbell, Car, UtensilsCrossed, Gem, ShoppingBag, ArrowUpRight, Handshake, Globe, Recycle, Shield } from 'lucide-react'
import { productsApi, categoriesApi } from '../api'
import ProductCard from '../components/product/ProductCard'
import { Skeleton } from '../components/ui'
import ScrollStack, { ScrollStackItem } from '../components/layout/ScrollStack'

const FEATURES = [
  { icon: Truck, title: 'Fast Shipping', desc: '24-hour processing with free worldwide shipping', size: 'md:col-span-2' },
  { icon: Lock, title: 'Secure Checkout', desc: 'Premium encryption for every transaction', size: 'md:col-span-1' },
  { icon: Award, title: 'Curated Quality', desc: 'Hand-selected products for excellence', size: 'md:col-span-1' },
  { icon: Zap, title: 'Quick Returns', desc: '30-day hassle-free return policy', size: 'md:col-span-2' },
]

const CATEGORY_ICONS = {
  electronics: Monitor, clothing: Shirt, fashion: Shirt, home: Home, beauty: Palette,
  books: BookOpen, music: Music, computers: Cpu, phones: Smartphone, headphones: Headphones,
  watches: Watch, gaming: Gamepad2, sports: Dumbbell, automotive: Car, food: UtensilsCrossed,
  jewelry: Gem, accessories: ShoppingBag, default: ShoppingBag,
}



// Mock stream data for Live Social Proof Toasts
const NOTIFICATION_STREAM = [
  { id: 1, text: "Someone in Mumbai just added a Premium Watch to their cart 🔥", time: "2s ago" },
  { id: 2, text: "An item from the Luxury Collection was purchased in Delhi 👑", time: "Just now" },
  { id: 3, text: "42 people are looking at the Minimalist desk lamps right now 👀", time: "12s ago" },
  { id: 4, text: "Someone in Bangalore saved Handcrafted boots to their Wishlist ❤️", time: "5s ago" }
]

// ─── 1. Magnetic Animation Component Wrapper ───
function MagneticButton({ children }) {
  const magneticVariants = {
    hover: (e) => {
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      return { x: x * 0.3, y: y * 0.3, scale: 1.02 };
    },
    rest: { x: 0, y: 0, scale: 1 }
  };

  return (
    <motion.div
      whileHover="hover"
      animate="rest"
      variants={magneticVariants}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// ─── 2. Category Card ───
function CategoryCard({ cat, idx, itemCount }) {
  const CatIcon = CATEGORY_ICONS[cat.name?.toLowerCase()] || CATEGORY_ICONS.default

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: idx * 0.08 } }
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <Link
        to={`/category/${cat.slug}`}
        className="card-premium block relative rounded-2xl overflow-hidden group"
      >
        <div className="relative z-10 p-6 md:p-8 min-h-[140px] flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>
            <CatIcon size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl mb-0.5"
              style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {/* Arrow on hover */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300"
          style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>
          <ArrowUpRight size={14} />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── 3. Bento Grid Item Card ───
function BentoCard({ feature }) {
  const Icon = feature.icon

  return (
    <div
      className={`card-premium p-8 text-left relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 ${feature.size}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(220px circle at center, var(--neon-glow), transparent 70%)' }}
      />
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
        <Icon size={24} />
      </div>
      <h3 className="font-display font-bold text-xl mb-3 text-primary">{feature.title}</h3>
      <p className="text-sm text-secondary leading-relaxed">{feature.desc}</p>
    </div>
  )
}

// ─── 4. Dynamic Flash Sale Countdown Timer ───
function FlashSaleSection() {
  const calcTimeToMidnight = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const diff = Math.max(0, Math.floor((midnight - now) / 1000))
    return { hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 }
  }

  const [timeLeft, setTimeLeft] = useState(calcTimeToMidnight)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeToMidnight())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds
  const pulseProgress = (totalSeconds / (24 * 3600)) * 100

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-purple-950/20 to-black/40 border-y border-subtle relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse text-red-400">
            <Flame size={28} className="fill-red-400/20" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-primary flex items-center gap-2">
              Midnight Flash Sale <span className="text-xs bg-red-500/20 text-red-400 font-sans px-2 py-0.5 rounded-full font-bold tracking-wide uppercase animate-pulse">Live</span>
            </h2>
            <p className="text-sm text-secondary mt-1">Premium pieces up to 55% off. Ending shortly.</p>
          </div>
        </div>

        {/* Counter Blocks */}
        <div className="flex items-center gap-3 font-display">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 glass border border-subtle rounded-xl flex items-center justify-center text-xl font-bold text-primary shadow-inner">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase font-sans tracking-wider text-muted mt-1.5">Hrs</span>
          </div>
          <span className="text-xl font-bold text-muted -mt-5">:</span>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 glass border border-subtle rounded-xl flex items-center justify-center text-xl font-bold text-primary shadow-inner">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase font-sans tracking-wider text-muted mt-1.5">Min</span>
          </div>
          <span className="text-xl font-bold text-muted -mt-5">:</span>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 glass border border-subtle rounded-xl flex items-center justify-center text-xl font-bold text-[var(--accent)] shadow-inner">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase font-sans tracking-wider text-muted mt-1.5">Sec</span>
          </div>
        </div>
      </div>

      {/* Frame Motion Animated Pulsing Status Bar Tracking Time Allocation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-raised">
        <motion.div 
          className="h-full bg-gradient-to-r from-[var(--accent)] via-pink-500 to-red-500"
          initial={{ width: '100%' }}
          animate={{ width: `${pulseProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </section>
  )
}

// ─── 5. Rolling Micro-User Activity Toast Stream ───
function LiveSocialToasts() {
  const [activeToast, setActiveToast] = useState(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const triggerNextToast = () => {
      setActiveToast(NOTIFICATION_STREAM[indexRef.current])
      indexRef.current = (indexRef.current + 1) % NOTIFICATION_STREAM.length

      // Leave toast visible for 4 seconds, then drop out
      setTimeout(() => {
        setActiveToast(null)
      }, 4000)
    }

    const interval = setInterval(triggerNextToast, 9000)
    // Fire initial notification banner trail
    const initialTimeout = setTimeout(triggerNextToast, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(initialTimeout)
    }
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            className="glass-strong p-4 rounded-2xl shadow-xl flex items-start gap-3 border pointer-events-auto backdrop-blur-xl"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="p-2 bg-purple-500/10 rounded-xl text-[var(--accent)] flex-shrink-0 mt-0.5">
              <Clock size={14} className="animate-spin-slow" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-primary leading-snug">{activeToast.text}</p>
              <span className="text-[10px] text-muted block mt-1">{activeToast.time}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [allProductsForCount, setAllProductsForCount] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([productsApi.list(), categoriesApi.list()]).then(([p, c]) => {
      setAllProductsForCount(p.data || [])
      setProducts((p.data || []).slice(0, 8))
      setCategories((c.data || []).slice(0, 6))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const headingWords = "Shop Premium, Live Elegantly".split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="overflow-hidden relative">
      {/* Live Active Stream Notifications Stack */}
      <LiveSocialToasts />

      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ 
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full opacity-4"
          style={{ 
            background: 'radial-gradient(circle, var(--accent-dark) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />

        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Top Pill Badge Info Layer */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ 
              background: 'var(--neon-glow)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <Sparkles size={13} className="text-purple-500" />
            New arrivals every week
          </motion.div>

          {/* Cinematic Word Staggered Title */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            {headingWords.map((word, idx) => (
              <motion.span 
                key={idx} 
                variants={wordVariants} 
                className={`inline-block mr-3 sm:mr-4 ${idx >= 2 ? 'text-gradient' : ''}`}
              >
                {word} {idx === 1 && <br />}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Curated products that celebrate quality, sustainability, and timeless design. Discover your next favorite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <MagneticButton>
              <Link to="/products" className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group w-48 sm:w-auto">
                Explore Now
                <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ArrowRight size={16} />
                </motion.div>
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link to="/categories" className="btn-secondary text-base px-8 py-4 flex items-center justify-center gap-2 w-48 sm:w-auto">
                View Categories
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Smooth Trust Marquee Ribbon */}
      <div className="overflow-hidden w-full bg-[var(--surface-raised)] py-5 border-y border-subtle whitespace-nowrap mb-8 relative z-20">
        <div className="marquee-track flex gap-16 text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase" style={{ width: 'max-content' }}>
          <span>✦ Sustainable Materials</span>
          <span>✦ Cruelty Free Production</span>
          <span>✦ Global Express Shipping</span>
          <span>✦ Handcrafted Excellence</span>
          <span>✦ Premium Quality Curations</span>
          <span>✦ Sustainable Materials</span>
          <span>✦ Cruelty Free Production</span>
          <span>✦ Global Express Shipping</span>
          <span>✦ Handcrafted Excellence</span>
          <span>✦ Premium Quality Curations</span>
        </div>
      </div>

      {/* FLASH SALE INTERACTIVE BLOCK ROW */}
      <FlashSaleSection />

      {/* ─── Scroll Stack: The ShopEase Story ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading text-4xl md:text-5xl mb-4">The ShopEase Story</h2>
            <p className="text-secondary max-w-2xl mx-auto">Scroll through our journey — each card reveals a chapter</p>
          </motion.div>

          <ScrollStack
            useWindowScroll={true}
            stackPosition="15%"
            itemDistance={80}
            itemScale={0.04}
            rotationAmount={0.5}
            blurAmount={1.5}
          >
            <ScrollStackItem>
              <div className="h-full flex flex-col justify-center p-8 md:p-12 rounded-[40px]"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(168,85,247,0.2)' }}>
                  <Handshake size={28} className="text-purple-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Curated with Passion</h3>
                <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                  Every product in our collection is hand-selected by experts who share your taste for quality.
                  We believe in the power of thoughtful curation.
                </p>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="h-full flex flex-col justify-center p-8 md:p-12 rounded-[40px]"
                style={{ background: 'linear-gradient(135deg, #0f3460, #1a1a2e)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(52,211,153,0.2)' }}>
                  <Globe size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Global Reach, Local Love</h3>
                <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                  From Mumbai to New York, we deliver premium products worldwide with a personal touch.
                  Fast shipping, tracked every step of the way.
                </p>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="h-full flex flex-col justify-center p-8 md:p-12 rounded-[40px]"
                style={{ background: 'linear-gradient(135deg, #2d1b69, #1a1a2e)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(251,191,36,0.2)' }}>
                  <Recycle size={28} className="text-amber-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Sustainable by Design</h3>
                <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                  We partner with brands committed to ethical production and eco-friendly materials.
                  Looking good should never cost the earth.
                </p>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="h-full flex flex-col justify-center p-8 md:p-12 rounded-[40px]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Shield size={28} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Protected, Always</h3>
                <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                  Secure payments, easy returns, and dedicated support. Shop with confidence knowing
                  we've got your back every step of the way.
                </p>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      {products.length > 0 && (
        <section className="py-20 px-4 border-t border-subtle">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-16"
            >
              <div>
                <h2 className="section-heading text-4xl md:text-5xl mb-3">Featured Collection</h2>
                <p className="text-secondary">Our most loved and bestselling items</p>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-2 text-purple-500 hover:text-accent-400 transition-colors font-semibold"
              >
                View all <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {loading ? (
                Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
              ) : (
                products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <MagneticButton>
                <Link to="/products" className="btn-primary text-base px-10 py-4 mx-auto inline-flex gap-2">
                  Shop All Products
                  <ArrowRight size={16} />
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Categories Grid ─── */}
      {categories.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="section-heading text-4xl md:text-5xl mb-4">Explore Categories</h2>
              <p className="text-secondary max-w-2xl mx-auto">Hand-picked collections for every style and need</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
              }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {categories.map((cat, idx) => {
                const itemCount = allProductsForCount.filter(
                  (product) => product.category_id === cat.id || product.category === cat.name
                ).length;
                return <CategoryCard key={cat.id} cat={cat} idx={idx} itemCount={itemCount} />;
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <Link to="/categories" className="btn-secondary text-base px-10 py-4 inline-flex gap-2 items-center">
                View All Categories
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── 3D Bento Grid Features Section ─── */}
      <section className="py-20 px-4 border-t border-subtle">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading text-4xl md:text-5xl mb-4">Why Choose ShopEase</h2>
            <p className="text-secondary max-w-2xl mx-auto">Premium service, elegant products, unforgettable experience</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr"
          >
            {FEATURES.map((feature, idx) => (
              <BentoCard key={idx} feature={feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 px-4 border-t border-subtle">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto card-premium p-12 md:p-16 text-center bg-gradient-to-br from-[var(--surface-raised)] to-[var(--bg-secondary)]"
        >
          <h2 className="section-heading text-4xl md:text-5xl mb-6">Ready to elevate your style?</h2>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust ShopEase for premium quality and exceptional service.
          </p>
          <MagneticButton>
            <Link to="/products" className="btn-primary text-base px-10 py-4 inline-flex gap-2 transition-shadow">
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </MagneticButton>
        </motion.div>
      </section>
    </div>
  )
}
