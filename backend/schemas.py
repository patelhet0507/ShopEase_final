from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional


# ===== User Schemas =====

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    mobile_number: Optional[str] = Field(None, min_length=5, max_length=20)


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
    password: str = Field(..., min_length=1, max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class EmailRequest(BaseModel):
    email: EmailStr


class RoleUpdate(BaseModel):
    role: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


# ===== Category Schemas =====

class CategoryBasic(BaseModel):
    id: int
    name: str
    slug: str
    view_token: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = Field(None, max_length=50)


class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = Field(None, max_length=50)


class SubCategoryBasic(BaseModel):
    id: int
    name: str
    slug: str
    view_token: Optional[str] = None
    category_id: int

    class Config:
        from_attributes = True


class SubCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    category_id: int = Field(..., ge=1)
    description: Optional[str] = Field(None, max_length=500)


class SubCategoryUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    category_id: int = Field(..., ge=1)
    description: Optional[str] = Field(None, max_length=500)


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
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    price: int = Field(..., ge=0)
    description: str = Field(..., max_length=2000)
    images: Optional[List[str]] = []
    stock: int = Field(0, ge=0)
    category_id: int = Field(..., ge=1)
    subcategory_id: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=2000)
    images: Optional[List[str]] = None
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = Field(None, ge=1)
    subcategory_id: Optional[int] = Field(None, ge=0)


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
    view_token: Optional[str] = None
    subcategories: List[SubCategoryBasic] = []
    products: List[ProductBasic] = []

    class Config:
        from_attributes = True


# ===== Cart Schemas =====

class CartItemCreate(BaseModel):
    product_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=99)


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
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=200)
    comment: str = Field(..., min_length=1, max_length=2000)


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
    product_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1, le=99)


class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=5, max_length=500)
    shipping_mobile: str = Field(..., min_length=5, max_length=20)
    shipping_name: str = Field(..., min_length=1, max_length=100)
    order_items: List[OrderItemCreate] = Field(..., min_length=1)


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
