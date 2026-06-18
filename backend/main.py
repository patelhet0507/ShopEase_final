import os
from fastapi import Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from fastapi import FastAPI
from database import engine
import models
import schemas
import auth
from database import get_db, Base
from datetime import datetime
import uuid

print("Initialising....")

print("Database Connected Successfully")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopEase API")

def _split_origins(value: str | None) -> list[str]:
    if not value:
        return []
    return [origin.strip() for origin in value.split(",") if origin.strip()]

frontend_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://shop-ease-frontend-sooty.vercel.app",
]

frontend_origins.extend(_split_origins(os.getenv("CORS_ORIGINS")))

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-")


# ===== Auth Endpoints =====

@app.post("/api/auth/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = db.query(models.User).count()
    role = "admin" if user_count == 0 else "user"

    user = models.User(
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=schemas.UserOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


# ===== User Profile Endpoints (NEW) =====

@app.get("/api/users/me", response_model=schemas.UserOut)
def get_current_user(user_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/api/users/me", response_model=schemas.UserOut)
def update_current_user(user_id: int = Query(...), payload: schemas.UserUpdate = None, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.address is not None:
        user.address = payload.address
    if payload.mobile_number is not None:
        user.mobile_number = payload.mobile_number

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/users/", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.put("/api/users/{user_id}/role/", response_model=schemas.UserOut)
def update_user_role(user_id: int, payload: schemas.RoleUpdate, db: Session = Depends(get_db)):
    if payload.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="role must be 'admin' or 'user'")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


# ===== Categories (with Slug Support) =====

@app.get("/api/categories/", response_model=List[schemas.CategoryBasic])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    updated = False

    for category in categories:
        if not category.slug:
            category.slug = f"{_slugify(category.name)}-{category.id}"
            updated = True

    if updated:
        db.commit()
        for category in categories:
            db.refresh(category)

    return categories


@app.get("/api/categories/with-structure")
def list_categories_with_structure(db: Session = Depends(get_db)):
    categories = (
        db.query(models.Category)
        .options(joinedload(models.Category.subcategories).joinedload(models.SubCategory.products))
        .all()
    )

    result = []
    for cat in categories:
        result.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "subcategories": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "slug": sub.slug,
                    "category_id": sub.category_id,
                    "product_count": len(sub.products),
                }
                for sub in cat.subcategories
            ],
        })
    return result


# Get by slug (NEW: slug-based routing)
@app.get("/api/categories/slug/{slug}", response_model=schemas.CategoryWithProducts)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    products = db.query(models.Product).filter(models.Product.category_id == category.id).all()

    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "products": products,
    }


# Get by ID (kept for backward compatibility)
@app.get("/api/categories/{category_id}/", response_model=schemas.CategoryWithProducts)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    products = db.query(models.Product).filter(models.Product.category_id == category_id).all()

    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "products": products,
    }


@app.post("/api/categories/", response_model=schemas.CategoryBasic)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Category).filter(models.Category.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    category = models.Category(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        color=payload.color
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.put("/api/categories/{category_id}/", response_model=schemas.CategoryBasic)
def update_category(category_id: int, payload: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if new slug already exists
    if payload.slug != category.slug:
        existing = db.query(models.Category).filter(models.Category.slug == payload.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")

    category.name = payload.name
    category.slug = payload.slug
    category.description = payload.description
    category.color = payload.color
    db.commit()
    db.refresh(category)
    return category


@app.delete("/api/categories/{category_id}/", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()
    return None


# ===== Subcategories (with Slug Support) =====

@app.get("/api/subcategories/", response_model=List[schemas.SubCategoryBasic])
def list_subcategories(db: Session = Depends(get_db)):
    subcategories = db.query(models.SubCategory).all()
    updated = False

    for subcategory in subcategories:
        if not subcategory.slug:
            subcategory.slug = f"{_slugify(subcategory.name)}-{subcategory.id}"
            updated = True

    if updated:
        db.commit()
        for subcategory in subcategories:
            db.refresh(subcategory)

    return subcategories


# Get by slug (NEW: slug-based routing)
@app.get("/api/subcategories/slug/{slug}")
def get_subcategory_by_slug(slug: str, db: Session = Depends(get_db)):
    subcategory = db.query(models.SubCategory).filter(models.SubCategory.slug == slug).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    products = db.query(models.Product).filter(models.Product.subcategory_id == subcategory.id).all()

    return {
        "id": subcategory.id,
        "name": subcategory.name,
        "slug": subcategory.slug,
        "category_id": subcategory.category_id,
        "products": products,
    }


@app.post("/api/subcategories/", response_model=schemas.SubCategoryBasic)
def create_subcategory(payload: schemas.SubCategoryCreate, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id")

    existing = db.query(models.SubCategory).filter(models.SubCategory.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    subcategory = models.SubCategory(
        name=payload.name,
        slug=payload.slug,
        category_id=payload.category_id,
        description=payload.description
    )
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


@app.put("/api/subcategories/{subcategory_id}/", response_model=schemas.SubCategoryBasic)
def update_subcategory(subcategory_id: int, payload: schemas.SubCategoryUpdate, db: Session = Depends(get_db)):
    subcategory = db.query(models.SubCategory).filter(models.SubCategory.id == subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    category = db.query(models.Category).filter(models.Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id")

    if payload.slug != subcategory.slug:
        existing = db.query(models.SubCategory).filter(models.SubCategory.slug == payload.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")

    subcategory.name = payload.name
    subcategory.slug = payload.slug
    subcategory.category_id = payload.category_id
    subcategory.description = payload.description
    db.commit()
    db.refresh(subcategory)
    return subcategory


@app.delete("/api/subcategories/{subcategory_id}/", status_code=204)
def delete_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    subcategory = db.query(models.SubCategory).filter(models.SubCategory.id == subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    db.delete(subcategory)
    db.commit()
    return None


# ===== Products (with Slug Support) =====

@app.get("/api/products/", response_model=List[schemas.ProductOut])
def list_products(
    category_id: int = Query(None),
    subcategory_id: int = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)

    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if subcategory_id:
        query = query.filter(models.Product.subcategory_id == subcategory_id)

    products = query.offset(skip).limit(limit).all()
    updated = False

    for product in products:
        if not product.slug:
            product.slug = f"{_slugify(product.name)}-{product.id}"
            updated = True

    if updated:
        db.commit()
        for product in products:
            db.refresh(product)

    return products


# Get by slug (NEW: slug-based routing)
@app.get("/api/products/slug/{slug}", response_model=schemas.ProductOut)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get by ID (kept for backward compatibility)
@app.get("/api/products/{product_id}/", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/products/", response_model=schemas.ProductOut)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    category = db.query(models.Category).filter(models.Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id")

    product = models.Product(
        name=payload.name,
        slug=payload.slug,
        price=payload.price,
        description=payload.description,
        images=payload.images or [],
        stock=payload.stock,
        category_id=payload.category_id,
        subcategory_id=payload.subcategory_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put("/api/products/{product_id}/", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.slug and payload.slug != product.slug:
        existing = db.query(models.Product).filter(models.Product.slug == payload.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")

    if payload.name is not None:
        product.name = payload.name
    if payload.slug is not None:
        product.slug = payload.slug
    if payload.price is not None:
        product.price = payload.price
    if payload.description is not None:
        product.description = payload.description
    if payload.images is not None:
        product.images = payload.images
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.subcategory_id is not None:
        product.subcategory_id = payload.subcategory_id

    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/products/{product_id}/", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None


# ===== Cart =====

@app.get("/api/users/{user_id}/cart/")
def get_cart(user_id: int, db: Session = Depends(get_db)):
    items = db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()
    total_quantity = sum(item.quantity for item in items)
    subtotal = sum(item.product.price * item.quantity for item in items)

    return {
        "items": items,
        "total_quantity": total_quantity,
        "subtotal": subtotal,
    }


@app.post("/api/users/{user_id}/cart/", response_model=schemas.CartItemOut)
def add_to_cart(user_id: int, payload: schemas.CartItemCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == payload.product_id
    ).first()

    if cart_item:
        cart_item.quantity += payload.quantity
    else:
        cart_item = models.CartItem(
            user_id=user_id,
            product_id=payload.product_id,
            quantity=payload.quantity
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)
    return cart_item


@app.put("/api/users/{user_id}/cart/{cart_item_id}/", response_model=schemas.CartItemOut)
def update_cart_item(user_id: int, cart_item_id: int, payload: schemas.CartItemUpdate, db: Session = Depends(get_db)):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == cart_item_id,
        models.CartItem.user_id == user_id
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = payload.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@app.delete("/api/users/{user_id}/cart/{cart_item_id}/", status_code=204)
def remove_from_cart(user_id: int, cart_item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == cart_item_id,
        models.CartItem.user_id == user_id
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return None


@app.delete("/api/users/{user_id}/cart/", status_code=204)
def clear_cart(user_id: int, db: Session = Depends(get_db)):
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    db.commit()
    return None


# ===== Wishlist =====

@app.get("/api/users/{user_id}/wishlist/", response_model=list[schemas.WishlistItemOut])
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    items = db.query(models.WishlistItem).filter(models.WishlistItem.user_id == user_id).all()
    return items


@app.post("/api/users/{user_id}/wishlist/", response_model=schemas.WishlistItemOut)
def add_to_wishlist(user_id: int, payload: schemas.WishlistItemCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    wishlist_item = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == user_id,
        models.WishlistItem.product_id == payload.product_id
    ).first()

    if wishlist_item:
        return wishlist_item

    wishlist_item = models.WishlistItem(
        user_id=user_id,
        product_id=payload.product_id,
        price_at_save=product.price
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item


@app.delete("/api/users/{user_id}/wishlist/{wishlist_item_id}/", status_code=204)
def remove_from_wishlist(user_id: int, wishlist_item_id: int, db: Session = Depends(get_db)):
    wishlist_item = db.query(models.WishlistItem).filter(
        models.WishlistItem.id == wishlist_item_id,
        models.WishlistItem.user_id == user_id
    ).first()
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(wishlist_item)
    db.commit()
    return None


# ===== Reviews =====

@app.get("/api/products/{product_id}/reviews/")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    return reviews


@app.get("/api/products/{product_id}/reviews/stats")
def get_review_stats(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    if not reviews:
        return {
            "average_rating": 0,
            "total_reviews": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }

    total = len(reviews)
    average = sum(r.rating for r in reviews) / total
    distribution = {i: len([r for r in reviews if r.rating == i]) for i in range(1, 6)}

    return {
        "average_rating": round(average, 1),
        "total_reviews": total,
        "rating_distribution": distribution
    }


@app.post("/api/products/{product_id}/reviews/", response_model=schemas.ReviewOut)
def create_review(product_id: int, user_id: int = Query(...), payload: schemas.ReviewCreate = None, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_review = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.user_id == user_id
    ).first()

    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this product")

    review = models.Review(
        user_id=user_id,
        product_id=product_id,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
        verified_purchase=payload.verified_purchase
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@app.put("/api/reviews/{review_id}/", response_model=schemas.ReviewOut)
def update_review(review_id: int, user_id: int = Query(...), payload: schemas.ReviewUpdate = None, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    review.rating = payload.rating
    review.title = payload.title
    review.comment = payload.comment
    review.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)
    return review


@app.delete("/api/reviews/{review_id}/", status_code=204)
def delete_review(review_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(review)
    db.commit()
    return None


# ===== Orders (NEW - Checkout Flow) =====

@app.post("/api/orders/", response_model=schemas.OrderOut)
def create_order(user_id: int = Query(...), payload: schemas.OrderCreate = None, db: Session = Depends(get_db)):
    """Create order from cart items (Cash on Delivery only)"""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not payload.order_items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Calculate total and validate products
    total_amount = 0
    order_items_data = []

    for item in payload.order_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        item_total = product.price * item.quantity
        total_amount += item_total
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "price": product.price
        })

    # Create order
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    order = models.Order(
        user_id=user_id,
        order_number=order_number,
        shipping_address=payload.shipping_address,
        shipping_mobile=payload.shipping_mobile,
        shipping_name=payload.shipping_name,
        total_amount=total_amount,
        status="pending",
        payment_method="cod"
    )

    db.add(order)
    db.flush()  # Flush to get order ID

    # Add order items
    for item_data in order_items_data:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            product_name=item_data["product"].name,
            product_price=item_data["price"],
            quantity=item_data["quantity"]
        )
        db.add(order_item)

        # Update product stock
        item_data["product"].stock -= item_data["quantity"]

    # Clear user's cart
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()

    db.commit()
    db.refresh(order)
    return order


@app.get("/api/orders/", response_model=List[schemas.OrderListOut])
def list_user_orders(user_id: int = Query(...), db: Session = Depends(get_db)):
    """List all orders for a user"""
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()
    return orders


@app.get("/api/orders/{order_id}/", response_model=schemas.OrderOut)
def get_order(order_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == user_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@app.put("/api/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(order_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    """Update order status (admin only)"""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


# ===== Health Check =====

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "ShopEase API is running"}


@app.get("/")
def root():
    return {"message": "ShopEase API", "version": "2.0"}
