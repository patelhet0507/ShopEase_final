# ShopEase Frontend

A premium, vibe-coded e-commerce frontend built with **React 18 + Vite + Tailwind CSS + Framer Motion**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark/light mode) |
| Animations | Framer Motion 11 |
| Routing | React Router DOM v6 |
| HTTP | Axios |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── api/           # Axios API client (maps to FastAPI endpoints)
├── context/       # AuthContext, CartContext, ThemeContext
├── components/
│   ├── layout/    # Navbar, Layout
│   ├── ui/        # Shared components (Skeleton, Modal, Toast, etc.)
│   ├── product/   # ProductCard (3D flip)
│   └── cart/      # CartDrawer (slide-over)
└── pages/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── HomePage.jsx
    ├── CategoriesPage.jsx
    ├── CategoryDetailPage.jsx
    ├── ProductsPage.jsx
    ├── ProductDetailPage.jsx
    ├── CartPage.jsx
    ├── WishlistPage.jsx
    └── AdminDashboard.jsx
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Your FastAPI backend running (default: `http://localhost:8000`)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API URL
```bash
cp .env.example .env
```
Edit `.env` and set your backend URL:
```
VITE_API_URL=http://localhost:8000
```
If your backend runs on the default port 8000, no change is needed.

### 3. Start development server
```bash
npm run dev
```
Visit **http://localhost:3000**

### 4. Build for production
```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Backend Requirements

Your FastAPI backend must allow CORS from `http://localhost:3000`. It already does — the `main.py` CORS config includes this origin.

Make sure your backend `.env` has a valid `DATABASE_URL`, then start it with:
```bash
uvicorn main:app --reload --port 8000
```

---

## Features

### Pages
| Page | Route | Auth Required |
|---|---|---|
| Home | `/` | No |
| Login | `/login` | Guest only |
| Register | `/register` | Guest only |
| Categories | `/categories` | No |
| Category Detail | `/categories/:id` | No |
| All Products | `/products` | No |
| Product Detail | `/products/:id` | No |
| Cart | `/cart` | Yes |
| Wishlist | `/wishlist` | Yes |
| Admin Dashboard | `/admin` | Admin role |

### Key UI Features
- **Dark / Light mode** — toggle in navbar, persisted in localStorage
- **3D Flip Product Cards** — hover to flip and reveal quick-add options
- **Cart Drawer** — slides in from the right, live quantity controls
- **Sticky Sidebar Filters** — on the Products page (category, price range, sort)
- **Mini Cart & Wishlist Previews** — floating dropdowns on the Product Detail page
- **Animated Review Cards** — expandable, star ratings, edit/delete for own reviews
- **Admin Dashboard** — full CRUD for categories, subcategories, products; role management for users
- **Framer Motion** — staggered scroll reveals, fade-ups, layout animations throughout

### Auth Flow
- First user to register becomes **admin** (matches backend logic)
- User session stored in `localStorage` as JSON
- Admin-only routes redirect non-admins to `/`

---

## Customisation

| What | Where |
|---|---|
| API base URL | `.env` → `VITE_API_URL` |
| Color palette | `tailwind.config.js` → `colors.accent` / `colors.ink` |
| Product placeholder images | `src/components/product/ProductCard.jsx` → `productImage()` |
| Currency symbol | Search for `₹` across `src/` |

---

## Deployment

### Vercel (recommended)
1. Push to GitHub
2. Import repo in Vercel
3. Set `VITE_API_URL` in Vercel environment variables
4. Deploy — Vercel auto-detects Vite

### Netlify
```bash
npm run build
# drag-and-drop the dist/ folder into Netlify
```
Set the publish directory to `dist` and add `VITE_API_URL` as an env variable.

Recommended production values:
```bash
VITE_API_URL=https://shopease-backend-0uzd.onrender.com
CORS_ORIGINS=https://shop-ease-frontend-sooty.vercel.app
```

---

## Notes

- Product images are generated dynamically via `ui-avatars.com` (no uploads required). Replace `productImage()` in `ProductCard.jsx` with your own image URL logic when you add image upload support to the backend.
- The checkout button is a UI placeholder — connect it to your payment gateway.
- GST (18%) is calculated client-side in the Cart page for display only.
#
