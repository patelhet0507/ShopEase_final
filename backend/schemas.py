from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional


# ===== User Schemas =====

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    exp: int = 0
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class EmailRequest(BaseModel):
    email: EmailStr


class RoleUpdate(BaseModel):
    role: str


# ===== Category Schemas =====

class CategoryBasic(BaseModel):
    id: int
    name: str
    slug: str
    color: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = None


class SubCategoryBasic(BaseModel):
    id: int
    name: str
    slug: str
    category_id: int

    class Config:
        from_attributes = True


class SubCategoryCreate(BaseModel):
    name: str
    slug: str
    category_id: int
    description: Optional[str] = None


class SubCategoryUpdate(BaseModel):
    name: str
    slug: str
    category_id: int
    description: Optional[str] = None


class CategoryWithSubcategories(BaseModel):
    id: int
    name: str
    slug: str
    subcategories: List[SubCategoryBasic] = []

    class Config:
        from_attributes = True


# ===== Product Schemas =====

class VariantOut(BaseModel):
    id: int
    product_id: int
    type: str
    value: str
    price_adjustment: int = 0
    stock: int = 0

    class Config:
        from_attributes = True


class VariantCreate(BaseModel):
    type: str
    value: str
    price_adjustment: int = 0
    stock: int = 0


class VariantUpdate(BaseModel):
    type: Optional[str] = None
    value: Optional[str] = None
    price_adjustment: Optional[int] = None
    stock: Optional[int] = None


class ProductBasic(BaseModel):
    id: int
    name: str
    slug: str
    view_token: Optional[str] = None
    price: int
    description: str
    images: Optional[List[str]] = []
    stock: int
    category_id: int
    subcategory_id: int
    variants: List[VariantOut] = []

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    slug: str
    price: int
    description: str
    images: Optional[List[str]] = []
    stock: int = 0
    category_id: int
    subcategory_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    view_token: Optional[str] = None
    price: int
    description: str
    images: Optional[List[str]] = []
    stock: int
    category_id: int
    subcategory_id: int
    variants: List[VariantOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWithProducts(BaseModel):
    id: int
    name: str
    slug: str
    products: List[ProductBasic] = []

    class Config:
        from_attributes = True


# ===== Cart Schemas =====

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductBasic

    class Config:
        from_attributes = True


# ===== Wishlist Schemas =====

class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    product: ProductBasic
    price_at_save: Optional[int] = None

    class Config:
        from_attributes = True


# ===== Review Schemas =====

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: str
    comment: str
    verified_purchase: bool = False


class ReviewUpdate(BaseModel):
    rating: int
    title: str
    comment: str


class ReviewOut(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_exp: Optional[int] = 0
    product_id: int
    rating: int
    title: str
    comment: str
    verified_purchase: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Order Schemas (NEW) =====

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    shipping_address: str
    shipping_mobile: str
    shipping_name: str
    order_items: List[OrderItemCreate]


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: int
    quantity: int

    class Config:
        from_attributes = True


class OrderEventOut(BaseModel):
    id: int
    order_id: int
    status: str
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    user_id: int
    order_number: str
    shipping_address: str
    shipping_mobile: str
    shipping_name: str
    total_amount: int
    status: str
    payment_method: str
    order_items: List[OrderItemOut] = []
    events: List[OrderEventOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListOut(BaseModel):
    id: int
    order_number: str
    total_amount: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
