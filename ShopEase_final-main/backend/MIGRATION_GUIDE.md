# ShopEase Backend - Migration & Setup Guide

## Overview

This updated backend includes:
- ✅ Slug-based routing for SEO-friendly URLs (Products, Categories, Subcategories)
- ✅ Multiple image support per product (Cloudinary URLs)
- ✅ User profile management (first_name, last_name, address, mobile_number)
- ✅ Complete Order/Checkout system (Cash on Delivery only)
- ✅ Price drop tracking for wishlist items
- ✅ Order status management
- ✅ Review statistics and sentiment analysis

---

## Database Schema Changes

### New Fields Added

#### Users Table (Additions)
```sql
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20);
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

#### Categories Table (Additions)
```sql
ALTER TABLE categories ADD COLUMN slug VARCHAR(150) UNIQUE NOT NULL;
ALTER TABLE categories ADD COLUMN description TEXT;
ALTER TABLE categories ADD COLUMN color VARCHAR(7);
ALTER TABLE categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

#### Subcategories Table (Additions)
```sql
ALTER TABLE subcategories ADD COLUMN slug VARCHAR(150) UNIQUE NOT NULL;
ALTER TABLE subcategories ADD COLUMN description TEXT;
ALTER TABLE subcategories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE subcategories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

#### Products Table (Additions)
```sql
ALTER TABLE products ADD COLUMN slug VARCHAR(150) UNIQUE NOT NULL;
ALTER TABLE products ADD COLUMN images JSON DEFAULT '[]';
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

#### Wishlist Items Table (Additions)
```sql
ALTER TABLE wishlist_items ADD COLUMN price_at_save INTEGER;
```

### New Tables

#### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_mobile VARCHAR(20) NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    total_amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cod',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number)
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id)
);
```

---

## Migration Steps for Existing Data

### Step 1: Backup Your Database
```bash
# For PostgreSQL
pg_dump shopease_db > backup_$(date +%Y%m%d_%H%M%S).sql

# For SQLite
cp shopease.db shopease_backup_$(date +%Y%m%d_%H%M%S).db
```

### Step 2: Generate Slugs for Existing Data

#### For Categories (PostgreSQL example):
```sql
UPDATE categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-'))
WHERE slug IS NULL;
```

#### For Products:
```sql
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-')) || '-' || id
WHERE slug IS NULL;
```

#### For Subcategories:
```sql
UPDATE subcategories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-')) || '-' || id
WHERE slug IS NULL;
```

### Step 3: Update Product Images

If migrating from single image per product to multiple images:

```python
# Example script to populate images array from existing image field
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

engine = create_engine("postgresql://user:password@localhost/shopease")
Session = sessionmaker(bind=engine)
session = Session()

products = session.query(models.Product).all()
for product in products:
    if product.images is None or product.images == []:
        # If you had a single image field, populate it here
        # product.images = [old_image_url]
        session.commit()
```

### Step 4: Alembic Migration (Optional - For Version Control)

If using Alembic for migrations:

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add slug and order support"

# Apply migration
alembic upgrade head
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/shopease_db
# or for SQLite:
# DATABASE_URL=sqlite:///./shopease.db

# For Render PostgreSQL:
DATABASE_URL=postgresql://shopease_user:password@dpg-xxxxx.render.internal/shopease

# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Installation & Running

### Local Development

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create database (SQLite)
# OR connect to PostgreSQL via DATABASE_URL

# 5. Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production on Render

1. **Create PostgreSQL Database on Render**
   - Go to Render Dashboard
   - Create new PostgreSQL database
   - Copy the external database URL

2. **Deploy Backend Service**
   - Create new Web Service
   - Connect GitHub repository
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variable: `DATABASE_URL` = (your PostgreSQL URL from step 1)

3. **Run Migrations (if needed)**
   ```bash
   # Connect to Render PostgreSQL
   psql "your_render_db_url" < migrations.sql
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile (NEW)
- `GET /api/users/me?user_id={id}` - Get user profile
- `PUT /api/users/me?user_id={id}` - Update user profile

### Categories (Slug Support)
- `GET /api/categories/` - List all categories
- `GET /api/categories/slug/{slug}` - Get category by slug (NEW)
- `GET /api/categories/{id}/` - Get category by ID (backward compatible)
- `POST /api/categories/` - Create category
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Subcategories (Slug Support)
- `GET /api/subcategories/` - List all subcategories
- `GET /api/subcategories/slug/{slug}` - Get by slug (NEW)
- `POST /api/subcategories/` - Create subcategory
- `PUT /api/subcategories/{id}/` - Update subcategory
- `DELETE /api/subcategories/{id}/` - Delete subcategory

### Products (Slug Support + Image Array)
- `GET /api/products/` - List products
- `GET /api/products/slug/{slug}` - Get product by slug (NEW)
- `GET /api/products/{id}/` - Get product by ID (backward compatible)
- `POST /api/products/` - Create product (with images array)
- `PUT /api/products/{id}/` - Update product (with images array)
- `DELETE /api/products/{id}/` - Delete product

### Cart
- `GET /api/users/{user_id}/cart/` - Get cart
- `POST /api/users/{user_id}/cart/` - Add to cart
- `PUT /api/users/{user_id}/cart/{item_id}/` - Update cart item
- `DELETE /api/users/{user_id}/cart/{item_id}/` - Remove from cart
- `DELETE /api/users/{user_id}/cart/` - Clear cart

### Wishlist
- `GET /api/users/{user_id}/wishlist/` - Get wishlist
- `POST /api/users/{user_id}/wishlist/` - Add to wishlist
- `DELETE /api/users/{user_id}/wishlist/{item_id}/` - Remove from wishlist

### Orders (NEW - Checkout)
- `POST /api/orders/` - Create order (COD only)
- `GET /api/orders/` - List user orders
- `GET /api/orders/{order_id}/` - Get order details
- `PUT /api/orders/{order_id}/status` - Update order status (admin)

### Reviews
- `GET /api/products/{product_id}/reviews/` - Get product reviews
- `GET /api/products/{product_id}/reviews/stats` - Get review statistics (NEW)
- `POST /api/products/{product_id}/reviews/` - Create review
- `PUT /api/reviews/{review_id}/` - Update review
- `DELETE /api/reviews/{review_id}/` - Delete review

---

## Backward Compatibility

✅ **All existing ID-based routes are preserved**:
- `/api/products/{id}/` still works
- `/api/categories/{id}/` still works
- `/api/subcategories/{id}/` still works

✅ **New slug-based routes are added alongside**:
- `/api/products/slug/{slug}`
- `/api/categories/slug/{slug}`
- `/api/subcategories/slug/{slug}`

This allows gradual migration of frontend without breaking existing code.

---

## Testing

### Using cURL

```bash
# Create a product with multiple images
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Watch",
    "slug": "premium-watch",
    "price": 2999,
    "description": "Beautiful premium watch",
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v1/watch1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/watch2.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/watch3.jpg"
    ],
    "stock": 50,
    "category_id": 1,
    "subcategory_id": 1
  }'

# Create order
curl -X POST "http://localhost:8000/api/orders/?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": "123 Main St, City, State 12345",
    "shipping_mobile": "+91-9999999999",
    "shipping_name": "John Doe",
    "order_items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

---

## Troubleshooting

### Issue: Slug already exists error
**Solution:** Ensure slugs are unique. Use a slug generator before bulk importing.

### Issue: Images not showing on product
**Solution:** Verify Cloudinary URLs are valid and accessible. Check that images array is properly populated in database.

### Issue: Order creation fails with "Insufficient stock"
**Solution:** Ensure product stock field is properly set. Update stock via: `PUT /api/products/{id}/ {"stock": 100}`

### Issue: PostgreSQL connection error on Render
**Solution:** 
1. Verify DATABASE_URL environment variable is set correctly
2. Check Render PostgreSQL database is running
3. Ensure firewall allows connections from web service

---

## Support & Documentation

- FastAPI Docs: http://localhost:8000/docs
- Database Schema: See models.py
- API Schemas: See schemas.py
- Original Backend: https://github.com/patelhet0507/ShopEase/tree/main/backend

---

**Version:** 2.0  
**Last Updated:** June 2026  
**Status:** Production Ready
