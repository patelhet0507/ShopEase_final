"""
Safe seed script for production database.
Usage: DATABASE_URL="postgresql://user:pass@host:5432/dbname" python seed_prod.py

Does NOT delete any existing data. Only adds records that don't exist yet.
"""
import os, random, sys

# Ensure backend dir is in path for auth import
sys.path.insert(0, os.path.dirname(__file__))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: Set DATABASE_URL environment variable")
    print("Example:")
    print('  export DATABASE_URL="postgresql://user:pass@host:5432/dbname"')
    print("  python seed_prod.py")
    exit(1)

import auth  # for proper bcrypt hashing
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

def slugify(value):
    return value.lower().replace("&","and").replace("'","").replace("/","-").replace(" ","-")

# ── Get existing slugs/emails ──
existing_cat_slugs = {r[0] for r in db.execute(text("SELECT slug FROM categories")).fetchall()}
existing_sub_slugs = {r[0] for r in db.execute(text("SELECT slug FROM subcategories")).fetchall()}
existing_product_slugs = {r[0] for r in db.execute(text("SELECT slug FROM products")).fetchall()}
existing_emails = {r[0] for r in db.execute(text("SELECT email FROM users")).fetchall()}

print(f"Existing: {len(existing_cat_slugs)} cats, {len(existing_sub_slugs)} subs, {len(existing_product_slugs)} products, {len(existing_emails)} users")

inserted_cats = 0
inserted_subs = 0
inserted_products = 0
inserted_users = 0

# ── 100 Categories ──
category_names = [
    "Mobiles","Laptops","Tablets","Headphones","Speakers","Cameras","Smartwatches",
    "Gaming Consoles","Printers","Monitors","Keyboards","Mice","USB Drives",
    "Hard Drives","SSD","RAM","Graphics Cards","Motherboards","Processors",
    "Cooling Fans","Power Banks","Chargers","Cables","Phone Cases",
    "Screen Protectors","Smart Home","Security Cameras","Doorbells","Light Bulbs",
    "Power Strips","Men's T-Shirts","Men's Shirts","Men's Jeans","Men's Shorts",
    "Men's Jackets","Men's Suits","Men's Ethnic Wear","Men's Footwear",
    "Men's Sandals","Men's Watches","Women's Tops","Women's Dresses",
    "Women's Jeans","Women's Kurtis","Women's Sarees","Women's Footwear",
    "Women's Sandals","Women's Watches","Women's Handbags","Women's Jewelry",
    "Kids Clothing","Kids Footwear","Kids Toys","Kids Books","Kids School Bags",
    "Sofa Sets","Dining Tables","Beds","Wardrobes","Bookshelves",
    "Office Chairs","Study Tables","Coffee Tables","Shoe Racks","TV Units",
    "Cookware Sets","Frying Pans","Pressure Cookers","Mixer Grinders",
    "Induction Cooktops","Microwaves","Refrigerators","Washing Machines",
    "Air Conditioners","Water Purifiers","Vacuum Cleaners","Irons",
    "Towels","Bed Sheets","Pillows","Blankets","Curtains",
    "Bathroom Fittings","Shampoos","Soaps","Sunscreens","Deodorants",
    "Perfumes","Lipsticks","Face Creams","Serums","Hair Oils",
    "Protein Powders","Vitamins","Yoga Mats","Dumbbells","Treadmills",
    "Bicycles","Car Accessories","Bike Helmets","Pet Food","Pet Toys"
]

cat_id_map = {}
for name in category_names:
    slug = slugify(name)
    if slug in existing_cat_slugs:
        row = db.execute(text("SELECT id FROM categories WHERE slug = :slug"), {"slug": slug}).fetchone()
        if row:
            cat_id_map[slug] = row[0]
        continue
    result = db.execute(
        text("INSERT INTO categories (name, slug, created_at) VALUES (:name, :slug, NOW()) RETURNING id"),
        {"name": name, "slug": slug}
    )
    cat_id_map[slug] = result.fetchone()[0]
    existing_cat_slugs.add(slug)
    inserted_cats += 1
    if inserted_cats % 20 == 0:
        db.commit()

db.commit()

# ── 100 Subcategories ──
subcategory_names = [
    "Smartphones","Ultrabooks","Android Tablets","Over-Ear","Bluetooth Speakers",
    "DSLR Cameras","Fitness Bands","Handheld Consoles","Inkjet Printers",
    "LED Monitors","Mechanical Keyboards","Wireless Mice","Pen Drives",
    "External HDD","NVMe SSD","DDR5 RAM","NVIDIA GPUs","ATX Boards",
    "Intel Processors","CPU Coolers","Portable Banks","Fast Chargers",
    "USB Cables","Silicone Cases","Tempered Glass","Smart Plugs",
    "Indoor Cameras","Video Doorbells","LED Bulbs","Extension Cords",
    "Casual T-Shirts","Formal Shirts","Slim Jeans","Cargo Shorts",
    "Denim Jackets","Blazers","Kurta Sets","Sports Shoes",
    "Flip Flops","Chronograph","Crop Tops","Maxi Dresses",
    "Skinny Jeans","Cotton Kurtis","Silk Sarees","Heels",
    "Flat Sandals","Analog Watches","Tote Bags","Gold Plated",
    "T-Shirts Kids","School Shoes","Action Figures","Picture Books",
    "Backpacks","Fabric Sofas","Wooden Tables","Queen Beds",
    "Sliding Wardrobes","Wall Shelves","Ergonomic Chairs","Writing Desks",
    "Glass Tables","Metal Racks","Entertainment Units",
    "Non-Stick Sets","Cast Iron","Aluminum Cookers","Juicer Mixer",
    "Portable Cooktops","Convection Ovens","French Door","Front Load",
    "Split ACs","RO Purifiers","Robot Vacuums","Steam Irons",
    "Bath Towels","Cotton Sheets","Memory Foam","Comforters","Blackout",
    "Shower Heads","Anti-Dandruff","Organic Soaps","SPF 50",
    "Roll-On","Eau de Parfum","Matte Lipsticks","Anti-Aging",
    "Vitamin C Serum","Coconut Oil","Whey Isolate","Multivitamins",
    "Exercise Mats","Adjustable Weights","Electric Treadmills","Mountain Bikes",
    "Dash Cams","Full Face","Dog Food","Chew Toys"
]

cat_slugs = list(cat_id_map.keys())
for name in subcategory_names:
    slug = slugify(name)
    if slug in existing_sub_slugs:
        continue
    cat_slug = random.choice(cat_slugs)
    cat_id = cat_id_map[cat_slug]
    db.execute(
        text("INSERT INTO subcategories (name, slug, category_id, created_at) VALUES (:name, :slug, :cat_id, NOW())"),
        {"name": name, "slug": slug, "cat_id": cat_id}
    )
    existing_sub_slugs.add(slug)
    inserted_subs += 1
    if inserted_subs % 20 == 0:
        db.commit()

db.commit()

# ── 500 Products ──
brands = ["Apple","Samsung","Sony","LG","Dell","HP","Lenovo","Asus","Xiaomi",
          "OnePlus","Realme","Boat","JBL","Bose","Puma","Nike","Adidas","Levis"]
adjectives = ["Premium","Ultra","Pro","Elite","Smart","Classic","Advanced","Deluxe","Slim","Modern"]
prices = [299,399,499,599,799,999,1299,1499,1999,2499,2999,3999,4999,6999,7999,9999,
          14999,19999,24999,29999,39999,49999,59999,79999,99999,119999,149999]

cat_sub_pairs = db.execute(text("SELECT c.id, s.id FROM categories c JOIN subcategories s ON s.category_id = c.id")).fetchall()

if cat_sub_pairs:
    for i in range(500):
        name = f"{random.choice(brands)} {random.choice(adjectives)} {random.choice(category_names)}"
        slug = slugify(name)
        if slug in existing_product_slugs:
            slug = f"{slug}-{i}"
        if slug in existing_product_slugs:
            continue
        pair = random.choice(cat_sub_pairs)
        try:
            db.execute(text("""
                INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id, created_at)
                VALUES (:name, :slug, :price, :desc, :stock, :cat_id, :sub_id, NOW())
            """), {
                "name": name, "slug": slug,
                "price": random.choice(prices),
                "desc": f"{random.choice(adjectives)} product. Great quality and performance.",
                "stock": random.randint(5,200),
                "cat_id": pair[0], "sub_id": pair[1]
            })
            existing_product_slugs.add(slug)
            inserted_products += 1
            if inserted_products % 50 == 0:
                db.commit()
        except Exception as e:
            print(f"  Skipped product {i}: {e}")
            continue

db.commit()

# ── 12 Users ──
user_data = [
    ("rahul.sharma","Rahul","Sharma","user","MG Road","Mumbai"),
    ("priya.patel","Priya","Patel","user","Park Street","Delhi"),
    ("amit.verma","Amit","Verma","admin","Sector 18","Bangalore"),
    ("sneha.gupta","Sneha","Gupta","user","Lake View Road","Chennai"),
    ("vikram.singh","Vikram","Singh","user","Church Street","Hyderabad"),
    ("ananya.reddy","Ananya","Reddy","user","Banjara Hills","Hyderabad"),
    ("rajesh.joshi","Rajesh","Joshi","user","MG Road","Pune"),
    ("neha.kapoor","Neha","Kapoor","user","Park Street","Kolkata"),
    ("deepak.nair","Deepak","Nair","user","Sector 18","Noida"),
    ("kavita.malhotra","Kavita","Malhotra","user","Lake View Road","Jaipur"),
    ("admin","Admin","User","admin","Admin Office","Mumbai"),
    ("demo","Demo","User","user","Demo Street","Delhi"),
]

for uid, fn, ln, role, street, city in user_data:
    email = f"{uid}@shopease.com" if uid in ("admin","demo") else f"{uid}@email.com"
    if email in existing_emails:
        continue
    hashed = auth.hash_password("password123" if uid not in ("admin","demo") else (f"{uid}123"))
    db.execute(text("""
        INSERT INTO users (email, hashed_password, role, first_name, last_name, address, mobile_number, created_at)
        VALUES (:email, :pw, :role, :fn, :ln, :addr, :mobile, NOW())
    """), {
        "email": email, "pw": hashed,
        "role": role, "fn": fn, "ln": ln,
        "addr": f"{random.randint(1,999)}, {street}, {city} - {random.randint(100000,999999)}",
        "mobile": f"+91-{random.randint(7000000000,9999999999)}"
    })
    existing_emails.add(email)
    inserted_users += 1

db.commit()
db.close()

print(f"\nInserted: {inserted_cats} categories, {inserted_subs} subcategories, {inserted_products} products, {inserted_users} users")
print("Done! Total now in DB.")
