import os
from fastapi import Depends, HTTPException, Query, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from typing import List
from fastapi import FastAPI
from database import engine
import models
import schemas
import auth
from database import get_db, Base
from datetime import datetime
import uuid
import secrets
import email_service

print("Initialising....")

# Create tables
Base.metadata.create_all(bind=engine)

# Add exp column if missing on existing database
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN exp INTEGER NOT NULL DEFAULT 0"))
        conn.commit()
except Exception:
    pass  # Column already exists

# Backfill exp from existing review counts
try:
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE users
            SET exp = (SELECT COUNT(*) * 10 FROM reviews WHERE reviews.user_id = users.id)
            WHERE exp IS NULL OR exp = 0
        """))
        conn.commit()
except Exception:
    pass

# Add verification columns if missing on existing database
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255)"))
        conn.commit()
except Exception:
    pass

# Add view_token column if missing
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE products ADD COLUMN view_token VARCHAR(50)"))
        conn.commit()
except Exception:
    pass

# Backfill view_token for existing products
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id FROM products WHERE view_token IS NULL"))
        rows = result.fetchall()
        for row in rows:
            pid = row[0]
            token = secrets.token_urlsafe(8)
            conn.execute(
                text("UPDATE products SET view_token = :token WHERE id = :pid AND view_token IS NULL"),
                {"token": token, "pid": pid}
            )
        conn.commit()
except Exception:
    pass

print("Database Connected Successfully")

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
    "https://shop-ease-final.vercel.app",
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


# ===== JWT Auth Dependency =====

async def get_current_user(authorization: str = Header(None), user_id: int = Query(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        uid = auth.verify_access_token(token)
        if uid is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        user = db.query(models.User).filter(models.User.id == uid).first()
    elif user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ===== Auth Endpoints =====

@app.post("/api/auth/register", response_model=schemas.TokenOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = db.query(models.User).count()
    role = "admin" if user_count == 0 else "user"

    verification_token = str(uuid.uuid4())
    user = models.User(
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        role=role,
        is_verified=False,
        verification_token=verification_token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    email_service.send_verification_email(user.email, verification_token)

    access_token = auth.create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = auth.create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.get("/api/auth/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    if user.is_verified:
        return {"message": "Email already verified"}
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully"}


@app.post("/api/auth/resend-verification")
def resend_verification(payload: schemas.EmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    user.verification_token = str(uuid.uuid4())
    db.commit()
    email_service.send_verification_email(user.email, user.verification_token)
    return {"message": "Verification email sent"}


# ===== User Profile Endpoints (NEW) =====

@app.get("/api/users/me", response_model=schemas.UserOut)
def get_current_user_endpoint(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/api/users/me", response_model=schemas.UserOut)
def update_current_user(payload: schemas.UserUpdate = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):

    if payload.first_name is not None:
        current_user.first_name = payload.first_name
    if payload.last_name is not None:
        current_user.last_name = payload.last_name
    if payload.address is not None:
        current_user.address = payload.address
    if payload.mobile_number is not None:
        current_user.mobile_number = payload.mobile_number

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user


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


@app.get("/api/products/by-token/{token}", response_model=schemas.ProductOut)
def get_product_by_token(token: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.view_token == token).first()
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

    token = secrets.token_urlsafe(8)
    while db.query(models.Product).filter(models.Product.view_token == token).first():
        token = secrets.token_urlsafe(8)

    product = models.Product(
        name=payload.name,
        slug=payload.slug,
        view_token=token,
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


# ===== Product Variants =====

@app.get("/api/products/{product_id}/variants/", response_model=List[schemas.VariantOut])
def list_variants(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.variants


@app.post("/api/products/{product_id}/variants/", response_model=schemas.VariantOut, status_code=201)
def create_variant(product_id: int, payload: schemas.VariantCreate, db: Session = Depends(get_db)):
    if not payload.type or not payload.value:
        raise HTTPException(status_code=400, detail="Type and value are required")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    variant = models.ProductVariant(
        product_id=product_id,
        type=payload.type.strip(),
        value=payload.value.strip(),
        price_adjustment=payload.price_adjustment or 0,
        stock=payload.stock or 0,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@app.put("/api/products/{product_id}/variants/{variant_id}/", response_model=schemas.VariantOut)
def update_variant(product_id: int, variant_id: int, payload: schemas.VariantUpdate, db: Session = Depends(get_db)):
    variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == variant_id,
        models.ProductVariant.product_id == product_id
    ).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    if payload.type is not None:
        variant.type = payload.type.strip()
    if payload.value is not None:
        variant.value = payload.value.strip()
    if payload.price_adjustment is not None:
        variant.price_adjustment = payload.price_adjustment
    if payload.stock is not None:
        variant.stock = payload.stock
    db.commit()
    db.refresh(variant)
    return variant


@app.delete("/api/products/{product_id}/variants/{variant_id}/", status_code=204)
def delete_variant(product_id: int, variant_id: int, db: Session = Depends(get_db)):
    variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == variant_id,
        models.ProductVariant.product_id == product_id
    ).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    db.delete(variant)
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

@app.get("/api/products/{product_id}/reviews/", response_model=List[schemas.ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).options(joinedload(models.Review.user)).filter(models.Review.product_id == product_id).all()
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
def create_review(product_id: int, payload: schemas.ReviewCreate = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_review = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.user_id == current_user.id
    ).first()

    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this product")

    review = models.Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
        verified_purchase=payload.verified_purchase
    )
    db.add(review)
    current_user.exp = (current_user.exp or 0) + 10
    db.commit()
    db.refresh(review)
    return review


@app.put("/api/reviews/{review_id}/", response_model=schemas.ReviewOut)
def update_review(review_id: int, payload: schemas.ReviewUpdate = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    review.rating = payload.rating
    review.title = payload.title
    review.comment = payload.comment
    review.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)
    return review


@app.delete("/api/reviews/{review_id}/", status_code=204)
def delete_review(review_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(review)
    db.commit()
    return None


# ===== Orders (NEW - Checkout Flow) =====

@app.post("/api/orders/", response_model=schemas.OrderOut)
def create_order(payload: schemas.OrderCreate = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create order from cart items (Cash on Delivery only)"""

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
            "price": product.price,
        })

    # Create order
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    order = models.Order(
        user_id=current_user.id,
        order_number=order_number,
        shipping_address=payload.shipping_address,
        shipping_mobile=payload.shipping_mobile,
        shipping_name=payload.shipping_name,
        total_amount=total_amount,
        status="pending",
        payment_method="cod"
    )

    db.add(order)
    db.flush()

    for item_data in order_items_data:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            product_name=item_data["product"].name,
            product_price=item_data["price"],
            quantity=item_data["quantity"],
        )
        db.add(order_item)

        item_data["product"].stock -= item_data["quantity"]

    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()

    db.commit()
    db.refresh(order)
    return order


@app.get("/api/orders/", response_model=List[schemas.OrderListOut])
def list_user_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all orders for a user"""
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    return orders


@app.get("/api/orders/{order_id}/", response_model=schemas.OrderOut)
def get_order(order_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@app.get("/api/orders/{order_id}/events", response_model=List[schemas.OrderEventOut])
def get_order_events(order_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    events = db.query(models.OrderEvent).filter(models.OrderEvent.order_id == order_id).order_by(models.OrderEvent.created_at.asc()).all()
    return events


# ===== Admin Endpoints =====

@app.get("/api/admin/orders/", response_model=List[schemas.OrderOut])
def admin_list_all_orders(db: Session = Depends(get_db)):
    """List all orders (admin)"""
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return orders


@app.put("/api/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(order_id: int, status: str = Query(...), note: str = Query(None), db: Session = Depends(get_db)):
    """Update order status (admin only)"""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    order.updated_at = datetime.utcnow()

    event = models.OrderEvent(order_id=order.id, status=status, note=note)
    db.add(event)

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
