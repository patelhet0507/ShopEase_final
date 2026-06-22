# ShopEase — Premium E-Commerce Platform

A full-featured e-commerce application with a warm earthy theme, built with React + Vite frontend and FastAPI + PostgreSQL backend.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Motion (React Bits), OGL (WebGL), Lenis, Axios
**Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT auth, Cloudinary-ready image storage
**Deployment:** Frontend on Vercel, Backend on Render

## Features

### Shopping
- Browse products with category/subcategory filtering
- Product search with debounced input
- Price range filter, sorting, grid view variants
- Product detail page with image carousel, zoom toggle, social proof
- Compare price with discount badge on product cards

### Cart & Checkout
- Guest cart (localStorage) — no login required to add items
- Authenticated cart synced with backend
- Cart drawer (slide-out panel) from any page
- Full checkout flow with email, shipping details, order placement
- Auto-registration for guest checkout (random password, never shown)
- "Email already registered" flow — prompts for password, signs in

### User System
- JWT-based authentication (register, login, email verification)
- Password reset flow
- Profile management with inline editing
- Experience/levelling system based on reviews
- Wishlist with price-drop detection

### Admin Dashboard
- Stats cards (orders, revenue, products, users)
- Manage products, categories, subcategories, users, orders
- Image URL management with drag-to-reorder
- Search bars on every management tab
- Role management (user/admin)

### Visual Effects
- **Lightfall** (WebGL) — animated particle streaks in hero section
- **Carousel** (React Bits) — draggable, autoplay card carousel
- **Smooth scroll** via Lenis on scroll-stack sections
- Animated page transitions (Framer Motion)
- Spring hover animations on cards
- Flash sale countdown timer
- Live social proof toast stream
- Dark/light theme toggle with warm earthy palette

### Performance
- In-memory API response cache with TTL (60s)
- Request deduplication (reuses in-flight promises)
- Debounced search inputs (300ms)
- Throttled scroll handlers (100ms)
### Security

- **Rate limiting** — in-memory throttling on all auth endpoints (`/api/auth/register`, `/login`, `/forgot-password`, `/reset-password`): max 10 requests per minute per IP, returns HTTP 429 with `Too many requests` message
- **Input validation** — Pydantic `Field` constraints on every schema: `min_length`/`max_length` on strings (names, emails, addresses), `ge=1`/`le=99` on numeric fields (prices, stock, quantities, ratings), preventing SQL injection, XSS, and malformed data at the API boundary
- **JWT authentication** — access tokens issued on login/register; every protected endpoint validates the token via `auth.verify_access_token()`; 401 responses trigger automatic frontend logout + redirect to `/login`
- **Password hashing** — bcrypt via `passlib`; plaintext passwords never stored or logged
- **No secrets in frontend** — API URL is configurable via `VITE_API_URL` env var with a public default; no API keys, tokens, or database credentials in source code
- **CORS** — configured in FastAPI middleware to restrict origins
- **User role enforcement** — admin-only endpoints check `current_user.role` before allowing access to user management, product creation, order status updates
- **Email verification** — new accounts start unverified; verification email with unique token required before full access
- **View tokens** — product detail pages use single-use `view_token` for unlisted/shared product access, preventing unauthorized enumeration

## Theme

Warm earthy palette — works in light and dark mode.

| Variable | Light | Dark |
|---|---|---|
| `--bg` | #EFEAE0 | #1A1815 |
| `--surface` | #F9F6F0 | #24201A |
| `--accent` | #A37644 | #D4AF7A |
| `--border-warm` | rgba(138,106,70,0.3) | rgba(193,154,107,0.15) |

## Project Structure

```
frontend/
├── src/
│   ├── api/           # Axios client + API modules
│   ├── components/
│   │   ├── cart/      # CartDrawer
│   │   ├── layout/    # Navbar, Footer, Lightfall, Carousel, ScrollStack
│   │   ├── product/   # ProductCard, ImageCarousel, ProductVariants
│   │   └── ui/        # Skeleton, Modal, Toast, FloatingInput, badges
│   ├── context/       # AuthContext, CartContext, ThemeContext
│   ├── hooks/         # useDebounce
│   ├── pages/         # All route pages
│   └── utils/         # apiCache, throttle
├── public/
└── ...

backend/
├── main.py           # FastAPI app + all routes
├── models.py         # SQLAlchemy models
├── schemas.py        # Pydantic schemas
├── auth.py           # JWT helpers
├── database.py       # DB connection
├── email_service.py  # Email sending
├── seed.py           # Development seed
└── seed_prod.py      # Production seed
```

## Getting Started

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Build

```bash
cd frontend
npm run build
```
