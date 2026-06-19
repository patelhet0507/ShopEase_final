from database import SessionLocal, engine, Base
import models
import auth
import random

Base.metadata.create_all(bind=engine)

db = SessionLocal()

db.query(models.Product).delete()
db.query(models.SubCategory).delete()
db.query(models.Category).delete()
db.query(models.User).delete()
db.commit()

def slugify(value):
    return value.lower().replace("&", "and").replace("'", "").replace("/", "-").replace(" ", "-")

# ── 100 Categories ──
category_names = [
    "Mobiles", "Laptops", "Tablets", "Headphones", "Speakers", "Cameras", "Smartwatches",
    "Gaming Consoles", "Printers", "Monitors", "Keyboards", "Mice", "USB Drives",
    "Hard Drives", "SSD", "RAM", "Graphics Cards", "Motherboards", "Processors",
    "Cooling Fans", "Power Banks", "Chargers", "Cables", "Phone Cases",
    "Screen Protectors", "Smart Home", "Security Cameras", "Doorbells", "Light Bulbs",
    "Power Strips", "Men's T-Shirts", "Men's Shirts", "Men's Jeans", "Men's Shorts",
    "Men's Jackets", "Men's Suits", "Men's Ethnic Wear", "Men's Footwear",
    "Men's Sandals", "Men's Watches", "Women's Tops", "Women's Dresses",
    "Women's Jeans", "Women's Kurtis", "Women's Sarees", "Women's Footwear",
    "Women's Sandals", "Women's Watches", "Women's Handbags", "Women's Jewelry",
    "Kids Clothing", "Kids Footwear", "Kids Toys", "Kids Books", "Kids School Bags",
    "Sofa Sets", "Dining Tables", "Beds", "Wardrobes", "Bookshelves",
    "Office Chairs", "Study Tables", "Coffee Tables", "Shoe Racks", "TV Units",
    "Cookware Sets", "Frying Pans", "Pressure Cookers", "Mixer Grinders",
    "Induction Cooktops", "Microwaves", "Refrigerators", "Washing Machines",
    "Air Conditioners", "Water Purifiers", "Vacuum Cleaners", "Irons",
    "Towels", "Bed Sheets", "Pillows", "Blankets", "Curtains",
    "Bathroom Fittings", "Shampoos", "Soaps", "Sunscreens", "Deodorants",
    "Perfumes", "Lipsticks", "Face Creams", "Serums", "Hair Oils",
    "Protein Powders", "Vitamins", "Yoga Mats", "Dumbbells", "Treadmills",
    "Bicycles", "Car Accessories", "Bike Helmets", "Pet Food", "Pet Toys"
]

categories = []
for i, name in enumerate(category_names, 1):
    c = models.Category(name=name, slug=slugify(name))
    db.add(c)
    categories.append(c)
db.commit()
for c in categories:
    db.refresh(c)

# ── 100 Subcategories (1 per category) ──
subcategory_names = [
    "Smartphones", "Ultrabooks", "Android Tablets", "Over-Ear", "Bluetooth Speakers",
    "DSLR Cameras", "Fitness Bands", "Handheld Consoles", "Inkjet Printers",
    "LED Monitors", "Mechanical Keyboards", "Wireless Mice", "Pen Drives",
    "External HDD", "NVMe SSD", "DDR5 RAM", "NVIDIA GPUs", "ATX Boards",
    "Intel Processors", "CPU Coolers", "Portable Banks", "Fast Chargers",
    "USB Cables", "Silicone Cases", "Tempered Glass", "Smart Plugs",
    "Indoor Cameras", "Video Doorbells", "LED Bulbs", "Extension Cords",
    "Casual T-Shirts", "Formal Shirts", "Slim Jeans", "Cargo Shorts",
    "Denim Jackets", "Blazers", "Kurta Sets", "Sports Shoes",
    "Flip Flops", "Chronograph", "Crop Tops", "Maxi Dresses",
    "Skinny Jeans", "Cotton Kurtis", "Silk Sarees", "Heels",
    "Flat Sandals", "Analog Watches", "Tote Bags", "Gold Plated",
    "T-Shirts Kids", "School Shoes", "Action Figures", "Picture Books",
    "Backpacks", "Fabric Sofas", "Wooden Tables", "Queen Beds",
    "Sliding Wardrobes", "Wall Shelves", "Ergonomic Chairs", "Writing Desks",
    "Glass Tables", "Metal Racks", "Entertainment Units",
    "Non-Stick Sets", "Cast Iron", "Aluminum Cookers", "Juicer Mixer",
    "Portable Cooktops", "Convection Ovens", "French Door", "Front Load",
    "Split ACs", "RO Purifiers", "Robot Vacuums", "Steam Irons",
    "Bath Towels", "Cotton Sheets", "Memory Foam", "Comforters", "Blackout",
    "Shower Heads", "Anti-Dandruff", "Organic Soaps", "SPF 50",
    "Roll-On", "Eau de Parfum", "Matte Lipsticks", "Anti-Aging",
    "Vitamin C Serum", "Coconut Oil", "Whey Isolate", "Multivitamins",
    "Exercise Mats", "Adjustable Weights", "Electric Treadmills", "Mountain Bikes",
    "Dash Cams", "Full Face", "Dog Food", "Chew Toys"
]

subcategories = []
for i, name in enumerate(subcategory_names, 1):
    cat = categories[i % len(categories)]
    s = models.SubCategory(name=name, slug=slugify(name), category_id=cat.id)
    db.add(s)
    subcategories.append(s)
db.commit()
for s in subcategories:
    db.refresh(s)

# ── 500 Products ──
brands = ["Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Lenovo", "Asus", "Acer", "Xiaomi",
          "OnePlus", "Realme", "Vivo", "Oppo", "Boat", "Noise", "Mivi", "pTron", "Zebronics",
          "JBL", "Bose", "Sennheiser", "Skullcandy", "Whirlpool", "Bosch", "IFB", "Haier",
          "Panasonic", "Toshiba", "Voltas", "Usha", "Bajaj", "Prestige", "Hawkins", "Puma",
          "Nike", "Adidas", "Reebok", "Levis", "Wrangler", "US Polo", "Louis Philippe",
          "Van Heusen", "Arrow", "Blackberry", "Mango", "H&M", "Zara", "Max", "Westside"]

product_adjectives = ["Premium", "Ultra", "Pro", "Elite", "Smart", "Classic", "Essential",
                      "Advanced", "Deluxe", "Slim", "Compact", "Portable", "Heavy Duty",
                      "Elegant", "Modern", "Trendy", "Stylish", "Comfort", "Performance"]

product_nouns = ["Edition", "Series", "Plus", "Max", "Lite", "Air", "Mini", "Prime", "Neo"]

prices = [299, 399, 499, 599, 699, 799, 899, 999, 1299, 1499, 1799, 1999, 2499, 2999, 3499,
          3999, 4499, 4999, 5999, 6999, 7999, 8999, 9999, 11999, 14999, 17999, 19999, 24999,
          29999, 34999, 39999, 44999, 49999, 59999, 69999, 79999, 89999, 99999, 119999, 149999]

products = []
used_slugs = set()

for i in range(500):
    brand = random.choice(brands)
    adj = random.choice(product_adjectives)
    noun = random.choice(product_nouns) if random.random() > 0.3 else ""
    cat = random.choice(categories)
    subs_for_cat = [s for s in subcategories if s.category_id == cat.id]
    if not subs_for_cat:
        sub = random.choice(subcategories)
    else:
        sub = random.choice(subs_for_cat)
    name = f"{brand} {adj} {cat.name} {noun}".strip()
    base_slug = slugify(name)
    slug = base_slug
    while slug in used_slugs:
        slug = f"{base_slug}-{random.randint(1,999)}"
    used_slugs.add(slug)
    price = random.choice(prices)
    stock = random.randint(5, 200)
    description = f"{adj} product from {brand}. Perfect for everyday use with great quality and performance. Ideal for those who appreciate quality."
    products.append(models.Product(
        name=name, slug=slug, price=price, description=description,
        category_id=cat.id, subcategory_id=sub.id, stock=stock
    ))

db.add_all(products)
db.commit()

# ── Multiple Users with varied profiles ──
first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Ananya", "Rajesh", "Neha",
               "Deepak", "Kavita", "Arjun", "Pooja", "Suresh", "Meera", "Rohan"]
last_names = ["Sharma", "Patel", "Verma", "Gupta", "Singh", "Reddy", "Joshi", "Das",
              "Kumar", "Nair", "Menon", "Kapoor", "Malhotra", "Chopra", "Thakur"]
streets = ["MG Road", "Park Street", "Main Road", "Sector 18", "Lake View Road",
           "Church Street", "Commercial Street", "Banjara Hills", "Jubilee Hills",
           "Koramangala", "Indiranagar", "Whitefield", "Hauz Khas", "Connaught Place",
           "Salt Lake"]
cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
          "Ahmedabad", "Jaipur", "Lucknow"]

users = []
for i, (fn, ln) in enumerate(zip(first_names[:10], last_names[:10])):
    street = random.choice(streets)
    city = random.choice(cities)
    users.append(models.User(
        email=f"{fn.lower()}.{ln.lower()}@email.com",
        hashed_password=auth.hash_password("password123"),
        role="user" if i > 0 else "admin",
        first_name=fn, last_name=ln,
        address=f"{random.randint(1,999)}, {street}, {city} - {random.randint(100000,999999)}",
        mobile_number=f"+91-{random.randint(7000000000, 9999999999)}"
    ))

# Add the default admin and demo user too
users.append(models.User(
    email="admin@shopease.com",
    hashed_password=auth.hash_password("admin123"),
    role="admin",
    first_name="Admin", last_name="User",
    address="1, Admin Office, Mumbai - 400001",
    mobile_number="+91-9876543210"
))
users.append(models.User(
    email="user@shopease.com",
    hashed_password=auth.hash_password("user123"),
    role="user",
    first_name="Demo", last_name="User",
    address="2, Demo Street, Delhi - 110001",
    mobile_number="+91-9876543211"
))

db.add_all(users)
db.commit()

db.close()

print("Database seeded successfully!")
print(f"  Categories: {len(categories)}")
print(f"  Subcategories: {len(subcategories)}")
print(f"  Products: {len(products)}")
print(f"  Users: {len(users)}")
