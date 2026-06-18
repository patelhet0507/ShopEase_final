"""
Seed script for ShopEase backend.

Run with:
    python seed.py
"""

from database import SessionLocal, engine, Base
import models
import auth

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data in dependency order
db.query(models.Product).delete()
db.query(models.SubCategory).delete()
db.query(models.Category).delete()
db.query(models.User).delete()
db.commit()


def slugify(value: str) -> str:
    return (
        value.lower()
        .replace("&", "and")
        .replace("'", "")
        .replace("/", "-")
        .replace(" ", "-")
    )


# Default users
admin_user = models.User(
    email="admin@shopease.com",
    hashed_password=auth.hash_password("admin123"),
    role="admin",
)
demo_user = models.User(
    email="user@shopease.com",
    hashed_password=auth.hash_password("user123"),
    role="user",
)
db.add_all([admin_user, demo_user])
db.commit()

# Categories
electronics = models.Category(name="Electronics", slug="electronics")
fashion = models.Category(name="Fashion", slug="fashion")
home_kitchen = models.Category(name="Home & Kitchen", slug="home-kitchen")
db.add_all([electronics, fashion, home_kitchen])
db.commit()
db.refresh(electronics)
db.refresh(fashion)
db.refresh(home_kitchen)

# Subcategories
mobiles = models.SubCategory(name="Mobiles", slug="mobiles", category_id=electronics.id)
laptops = models.SubCategory(name="Laptops", slug="laptops", category_id=electronics.id)
audio = models.SubCategory(name="Audio", slug="audio", category_id=electronics.id)
mens_wear = models.SubCategory(name="Men's Wear", slug="mens-wear", category_id=fashion.id)
womens_wear = models.SubCategory(name="Women's Wear", slug="womens-wear", category_id=fashion.id)
footwear = models.SubCategory(name="Footwear", slug="footwear", category_id=fashion.id)
cookware = models.SubCategory(name="Cookware", slug="cookware", category_id=home_kitchen.id)
furniture = models.SubCategory(name="Furniture", slug="furniture", category_id=home_kitchen.id)
db.add_all([mobiles, laptops, audio, mens_wear, womens_wear, footwear, cookware, furniture])
db.commit()

for sub in [mobiles, laptops, audio, mens_wear, womens_wear, footwear, cookware, furniture]:
    db.refresh(sub)

# Products
products = [
    models.Product(
        name="Galaxy Z Fold 6",
        slug="galaxy-z-fold-6",
        price=149999,
        description="Premium foldable smartphone with a large flexible display and top-tier performance.",
        category_id=electronics.id,
        subcategory_id=mobiles.id,
    ),
    models.Product(
        name="Pixel 9",
        slug="pixel-9",
        price=79999,
        description="Google's flagship phone with a clean Android experience and excellent camera.",
        category_id=electronics.id,
        subcategory_id=mobiles.id,
    ),
    models.Product(
        name="MacBook Air M3",
        slug="macbook-air-m3",
        price=114900,
        description="Lightweight laptop with Apple's M3 chip, all-day battery life, and a stunning display.",
        category_id=electronics.id,
        subcategory_id=laptops.id,
    ),
    models.Product(
        name="Dell XPS 13",
        slug="dell-xps-13",
        price=99990,
        description="Compact ultrabook with a sleek design and powerful Intel processor.",
        category_id=electronics.id,
        subcategory_id=laptops.id,
    ),
    models.Product(
        name="Sony WH-1000XM5",
        slug="sony-wh-1000xm5",
        price=29990,
        description="Industry-leading noise cancelling headphones with rich, detailed sound.",
        category_id=electronics.id,
        subcategory_id=audio.id,
    ),
    models.Product(
        name="Boat Airdopes 141",
        slug="boat-airdopes-141",
        price=1299,
        description="Affordable true wireless earbuds with long battery backup.",
        category_id=electronics.id,
        subcategory_id=audio.id,
    ),
    models.Product(
        name="Men's Cotton Shirt",
        slug="mens-cotton-shirt",
        price=899,
        description="Casual cotton shirt, breathable fabric, perfect for everyday wear.",
        category_id=fashion.id,
        subcategory_id=mens_wear.id,
    ),
    models.Product(
        name="Men's Denim Jacket",
        slug="mens-denim-jacket",
        price=2499,
        description="Classic denim jacket with a comfortable regular fit.",
        category_id=fashion.id,
        subcategory_id=mens_wear.id,
    ),
    models.Product(
        name="Women's Floral Dress",
        slug="womens-floral-dress",
        price=1599,
        description="Lightweight floral dress, ideal for summer outings.",
        category_id=fashion.id,
        subcategory_id=womens_wear.id,
    ),
    models.Product(
        name="Women's Kurti",
        slug="womens-kurti",
        price=999,
        description="Elegant printed kurti made from soft, breathable fabric.",
        category_id=fashion.id,
        subcategory_id=womens_wear.id,
    ),
    models.Product(
        name="Running Shoes",
        slug="running-shoes",
        price=3499,
        description="Lightweight running shoes with cushioned soles for all-day comfort.",
        category_id=fashion.id,
        subcategory_id=footwear.id,
    ),
    models.Product(
        name="Leather Loafers",
        slug="leather-loafers",
        price=2999,
        description="Premium leather loafers, perfect for formal and casual occasions.",
        category_id=fashion.id,
        subcategory_id=footwear.id,
    ),
    models.Product(
        name="Non-Stick Frying Pan",
        slug="non-stick-frying-pan",
        price=799,
        description="Durable non-stick frying pan, ideal for everyday cooking.",
        category_id=home_kitchen.id,
        subcategory_id=cookware.id,
    ),
    models.Product(
        name="Stainless Steel Cookware Set",
        slug="stainless-steel-cookware-set",
        price=3999,
        description="5-piece stainless steel cookware set, induction compatible.",
        category_id=home_kitchen.id,
        subcategory_id=cookware.id,
    ),
    models.Product(
        name="Wooden Study Table",
        slug="wooden-study-table",
        price=5499,
        description="Sturdy wooden study table with spacious storage drawers.",
        category_id=home_kitchen.id,
        subcategory_id=furniture.id,
    ),
    models.Product(
        name="Ergonomic Office Chair",
        slug="ergonomic-office-chair",
        price=7999,
        description="Adjustable ergonomic chair with lumbar support for long working hours.",
        category_id=home_kitchen.id,
        subcategory_id=furniture.id,
    ),
]

db.add_all(products)
db.commit()
db.close()

print("Database seeded successfully!")
