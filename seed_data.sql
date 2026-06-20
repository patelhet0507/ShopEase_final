-- =============================================================
-- WARNING: This DELETES all existing data from these tables
-- =============================================================

BEGIN;

-- Delete in order to respect foreign key constraints
DELETE FROM order_items;
DELETE FROM reviews;
DELETE FROM wishlist_items;
DELETE FROM cart_items;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM subcategories;
DELETE FROM categories;

-- Reset sequences (PostgreSQL)
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE subcategories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- =============================================================
-- CATEGORIES (5)
-- =============================================================
INSERT INTO categories (name, slug, description, color) VALUES
('Electronics',         'electronics',          'Latest gadgets, phones, laptops and tech accessories',                '#2563EB'),
('Clothing',            'clothing',             'Trendy fashion for men and women across all seasons',                 '#EC4899'),
('Home & Kitchen',      'home-kitchen',         'Everything to make your home smarter and your kitchen better',        '#D97706'),
('Sports & Outdoors',   'sports-outdoors',      'Gear up for fitness, adventure and the great outdoors',              '#16A34A'),
('Books & Stationery',  'books-stationery',     'Books, notebooks, pens and all your study essentials',               '#7C3AED');

-- =============================================================
-- SUBCATEGORIES (10 — 2 per category)
-- =============================================================
INSERT INTO subcategories (name, slug, category_id, description) VALUES
-- Electronics (cat 1)
('Mobile & Accessories',   'mobile-accessories',   1, 'Smartphones, cases, chargers and phone accessories'),
('Laptops & Computers',    'laptops-computers',    1, 'Laptops, desktops, monitors and computer peripherals'),
-- Clothing (cat 2)
("Men's Fashion",          'mens-fashion',         2, 'Shirts, jeans, jackets and footwear for men'),
("Women's Fashion",        'womens-fashion',       2, 'Dresses, tops, ethnic wear and accessories for women'),
-- Home & Kitchen (cat 3)
('Kitchen Appliances',     'kitchen-appliances',   3, 'Mixers, cookware, refrigerators and kitchen gadgets'),
('Home Decor',             'home-decor',           3, 'Furniture, lighting, curtains and decorative items'),
-- Sports & Outdoors (cat 4)
('Fitness Equipment',      'fitness-equipment',    4, 'Gym gear, yoga mats, dumbbells and workout accessories'),
('Outdoor Gear',           'outdoor-gear',         4, 'Camping tents, backpacks, hiking shoes and adventure gear'),
-- Books & Stationery (cat 5)
('Academic Books',         'academic-books',       5, 'Textbooks, reference books and exam guides'),
('Office Supplies',        'office-supplies',      5, 'Pens, notebooks, organizers and printer supplies');

-- =============================================================
-- PRODUCTS (100)
-- Distribution: Electronics 24, Clothing 22, Home & Kitchen 20,
--               Sports 18, Books 16
-- =============================================================

-- ── Electronics > Mobile & Accessories (subcat 1) ── 12 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('iPhone 15 Pro Max 256GB',       'iphone-15-pro-max-256gb-1',        124999, 'Apple A17 Pro chip, 48MP camera, titanium design', 25, 1, 1),
('Samsung Galaxy S24 Ultra',      'samsung-galaxy-s24-ultra-2',        109999, 'Snapdragon 8 Gen 3, S Pen, 200MP camera', 30, 1, 1),
('OnePlus 12 5G',                 'oneplus-12-5g-3',                   69999, 'Flagship killer with Hasselblad cameras', 40, 1, 1),
('Pixel 8 Pro',                   'pixel-8-pro-4',                     79999, 'Google Tensor G3, pure Android, amazing camera', 20, 1, 1),
('Nothing Phone 2',               'nothing-phone-2-5',                 44999, 'Glyph interface, Snapdragon 8+ Gen 1', 35, 1, 1),
('MagSafe Charger Apple',         'magsafe-charger-apple-6',           4499, '15W wireless fast charging puck', 100, 1, 1),
('Samsung Galaxy Buds2 Pro',      'samsung-galaxy-buds2-pro-7',        15999, 'ANC, 360 audio, IPX7 waterproof', 50, 1, 1),
('Spigen Rugged Armor Case',      'spigen-rugged-armor-case-8',        2499, 'Shockproof case for iPhone 15 series', 80, 1, 1),
('Anker 20000mAh Power Bank',     'anker-20000mah-power-bank-9',       2999, 'Fast charging 22.5W, dual USB-C', 60, 1, 1),
('OnePlus Nord Buds 3',           'oneplus-nord-buds-3-10',            2999, 'ANC, 12.4mm drivers, 30hr battery', 70, 1, 1),
('Apple Watch Series 9',          'apple-watch-series-9-11',           41999, 'S9 chip, double tap, blood oxygen monitoring', 20, 1, 1),
('UAG Scout Case',                 'uag-scout-case-12',                3499, 'Military-grade drop protection for Samsung', 45, 1, 1);

-- ── Electronics > Laptops & Computers (subcat 2) ── 12 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('MacBook Pro 16 M3 Max',         'macbook-pro-16-m3-max-13',          249999, 'M3 Max chip, 48GB unified memory, 22hr battery', 15, 1, 2),
('Dell XPS 15 OLED',              'dell-xps-15-oled-14',               189999, 'Intel i9, 32GB RAM, OLED 3.5K touch', 12, 1, 2),
('HP Spectre x360 14',            'hp-spectre-x360-14-15',             149999, '2-in-1 convertible, Intel i7, 16GB RAM', 18, 1, 2),
('Lenovo ThinkPad X1 Carbon',     'lenovo-thinkpad-x1-carbon-16',      169999, 'Ultralight business laptop, Intel i7 vPro', 10, 1, 2),
('ASUS ROG Zephyrus G16',         'asus-rog-zephyrus-g16-17',          179999, 'RTX 4070, Intel i9, 240Hz gaming laptop', 8, 1, 2),
('Samsung 27" 4K Monitor',        'samsung-27-4k-monitor-18',          34999, '4K UHD, HDR10, USB-C 90W charging', 25, 1, 2),
('Logitech MX Master 3S',         'logitech-mx-master-3s-19',          7499, 'Ergonomic wireless mouse, 8K DPI', 40, 1, 2),
('Apple Magic Keyboard',          'apple-magic-keyboard-20',           10999, 'Wireless with Touch ID, full-size', 30, 1, 2),
('Samsung T7 Portable SSD 2TB',    'samsung-t7-portable-ssd-21',       16999, 'USB 3.2, 1050MB/s read, shock resistant', 35, 1, 2),
('Dell 27" 1080p Monitor',        'dell-27-1080p-monitor-22',          15999, 'IPS panel, 75Hz, built-in speakers', 22, 1, 2),
('Razer Kraken V3 Pro',           'razer-kraken-v3-pro-23',            12999, 'Wireless gaming headset, haptic feedback', 20, 1, 2),
('Microsoft Surface Laptop 5',    'microsoft-surface-laptop-5-24',     134999, 'Intel i7, 16GB RAM, 13.5" PixelSense touch', 14, 1, 2);

-- ── Clothing > Men''s Fashion (subcat 3) ── 11 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Classic Oxford Blue Shirt',     'classic-oxford-blue-shirt-25',       2499, 'Premium cotton, slim fit, button-down collar', 50, 2, 3),
('Slim Fit Black Jeans',          'slim-fit-black-jeans-26',            2999, 'Stretch denim, tapered fit, 5-pocket design', 45, 2, 3),
('Wool Blend Navy Blazer',        'wool-blend-navy-blazer-27',          7999, 'Single breasted, notch lapel, two-button closure', 20, 2, 3),
('Leather Brown Boots',           'leather-brown-boots-28',             5499, 'Genuine leather, chunky sole, lace-up', 30, 2, 3),
('Casual Linen Shirt White',      'casual-linen-shirt-white-29',        1999, 'Breathable linen, regular fit, chest pocket', 60, 2, 3),
('Performance Running Shoes',     'performance-running-shoes-30',       5999, 'Mesh upper, cushioned sole, lightweight', 35, 2, 3),
('Merino Wool V-Neck Sweater',    'merino-wool-v-neck-sweater-31',      3999, 'Soft merino wool, ribbed cuffs, charcoal grey', 25, 2, 3),
('Cotton Chinos Beige',           'cotton-chinos-beige-32',             2799, 'Stretch cotton twill, chino fit, beige', 40, 2, 3),
('Leather Belt Black',            'leather-belt-black-33',              1499, 'Genuine leather, 35mm width, brushed buckle', 55, 2, 3),
('Aviator Sunglasses Gold',       'aviator-sunglasses-gold-34',         3499, 'Polarized lenses, gold frame, UV400 protection', 65, 2, 3),
('Canvas Messenger Bag',          'canvas-messenger-bag-35',            3299, 'Waxed canvas, leather trim, fits 15" laptop', 28, 2, 3);

-- ── Clothing > Women''s Fashion (subcat 4) ── 11 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Floral Midi Dress',             'floral-midi-dress-36',               3499, 'Printed midi dress, V-neck, elastic waist', 35, 2, 4),
('Tailored Blazer Cream',         'tailored-blazer-cream-37',           6499, 'Single breasted, notched lapel, crepe fabric', 20, 2, 4),
('High-Waist Straight Jeans',     'high-waist-straight-jeans-38',       2799, 'Non-stretch denim, button fly, vintage wash', 40, 2, 4),
('Silk Blend Scarf',              'silk-blend-scarf-39',                1899, 'Luxury silk-cotton blend, 180x70cm', 50, 2, 4),
('Leather Crossbody Bag',         'leather-crossbody-bag-40',           4999, 'Genuine leather, adjustable strap, gold hardware', 25, 2, 4),
('Cashmere Wrap Cardigan',        'cashmere-wrap-cardigan-41',          5999, 'Luxury cashmere blend, open front, grey', 18, 2, 4),
('Kurti Set Ethnic Embroidered',  'kurti-set-ethnic-embroidered-42',    2299, 'Cotton kurti with palazzo and dupatta set', 45, 2, 4),
('White Sneakers Platform',       'white-sneakers-platform-43',         4499, 'Canvas upper, platform sole, cushioned insole', 38, 2, 4),
('Denim Jacket Oversized',        'denim-jacket-oversized-44',          3999, 'Oversized fit, distressed wash, button front', 22, 2, 4),
('Gold Hoop Earrings',            'gold-hoop-earrings-45',              1499, 'Gold-plated stainless steel, hypoallergenic', 70, 2, 4),
('Tote Bag Printed',              'tote-bag-printed-46',                1999, 'Heavy-duty canvas, inner zip pocket, floral print', 42, 2, 4);

-- ── Home & Kitchen > Kitchen Appliances (subcat 5) ── 10 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Philips Air Fryer XXL',         'philips-air-fryer-xxl-47',           8999, '7.3L capacity, fat removal tech, 14 presets', 25, 3, 5),
('Bosch Mixer Grinder 750W',      'bosch-mixer-grinder-750w-48',        5999, '3 stainless steel jars, 750W motor, 3 speeds', 30, 3, 5),
('Prestige Pressure Cooker 5L',   'prestige-pressure-cooker-5l-49',     3499, 'Aluminum, 5L, 4-layer safety valve', 40, 3, 5),
('Keurig Coffee Maker',           'keurig-coffee-maker-50',             7999, 'Single-serve pod system, 48oz reservoir', 20, 3, 5),
('Ninja Blender Pro',             'ninja-blender-pro-51',               6999, '1400W, 72oz pitcher, Auto-iQ technology', 22, 3, 5),
('Butterfly Induction Cooktop',   'butterfly-induction-cooktop-52',     3999, '1900W, 10 presets, child lock, touch panel', 35, 3, 5),
('Cuckoo Rice Cooker 1.8L',      'cuckoo-rice-cooker-1-8l-53',         5999, 'High-pressure cooking, 13 menu options', 18, 3, 5),
('Breville Toaster 4-Slice',      'breville-toaster-4-slice-54',        4999, 'Extra-wide slots, defrost/reheat, cancel', 28, 3, 5),
('Milton Thermosteel Flask 1L',   'milton-thermosteel-flask-1l-55',     1299, 'Stainless steel, vacuum insulation, 24hr hot', 80, 3, 5),
('Hawkins Cookware Set 3-Piece',  'hawkins-cookware-set-3-piece-56',    7499, 'Hard anodized, induction compatible, 3 pans', 15, 3, 5);

-- ── Home & Kitchen > Home Decor (subcat 6) ── 10 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Minimalist Desk Lamp LED',      'minimalist-desk-lamp-led-57',        2499, 'Touch dimmable, USB charging, eye-care LED', 30, 3, 6),
('Scented Candle Set Vanilla',    'scented-candle-set-vanilla-58',      1299, '3 soy wax candles, vanilla & lavender, 200g each', 45, 3, 6),
('Abstract Wall Art Canvas',     'abstract-wall-art-canvas-59',         3499, 'Large 120x80cm, gallery wrap, gold accents', 20, 3, 6),
('Bohemian Throw Blanket',        'bohemian-throw-blanket-60',          1999, 'Cotton woven tassel blanket, 150x200cm', 35, 3, 6),
('Metal Wall Shelf Set',          'metal-wall-shelf-set-61',            2999, 'Set of 3, black metal, floating design', 25, 3, 6),
('Macrame Plant Hanger',          'macrame-plant-hanger-62',            699, 'Handmade cotton, fits 6-8" pots', 60, 3, 6),
('Photo Frame Collage 6-Pack',    'photo-frame-collage-6-pack-63',      1799, 'Rustic wood finish, 4x6 each, collage wall', 32, 3, 6),
('Ceramic Vase Set',              'ceramic-vase-set-64',                2199, '3 matte ceramic vases, varying heights', 28, 3, 6),
('Faux Monstera Plant 120cm',     'faux-monstera-plant-120cm-65',       3299, 'Lifelike artificial plant, pot included', 22, 3, 6),
('Ribbon Curtain Sheer White',    'ribbon-curtain-sheer-white-66',      1499, 'Sheer voile, 2 panels, 140x240cm each', 40, 3, 6);

-- ── Sports & Outdoors > Fitness Equipment (subcat 7) ── 9 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Adjustable Dumbbell Set 20kg',  'adjustable-dumbbell-set-20kg-67',    12499, 'Space-saving, 2.5-20kg each, quick-change dial', 15, 4, 7),
('Yoga Mat Premium TPE',          'yoga-mat-premium-tpe-68',            2499, '6mm thick, non-slip, eco-friendly TPE', 50, 4, 7),
('Resistance Bands Set 5-Pack',   'resistance-bands-set-5-pack-69',     1499, 'Different resistance levels, with door anchor', 60, 4, 7),
('Exercise Bike Magnetic',        'exercise-bike-magnetic-70',          24999, 'Magnetic resistance, LCD display, heart rate', 10, 4, 7),
('Jump Rope Speed',                'jump-rope-speed-71',                599, 'Ball bearing, adjustable 3m cable, foam handles', 100, 4, 7),
('Kettlebell Cast Iron 12kg',     'kettlebell-cast-iron-12kg-72',       2499, 'Single cast iron, flat base, powder coated', 30, 4, 7),
('Foam Roller Muscle Recovery',   'foam-roller-muscle-recovery-73',    1499, 'High-density EVA, 45cm, muscle release', 40, 4, 7),
('Pull Up Bar Doorway',           'pull-up-bar-doorway-74',             1999, 'Adjustable, no drilling, 3 grip positions', 25, 4, 7),
('Ab Roller Wheel Knee Pad',      'ab-roller-wheel-knee-pad-75',        899, 'Dual wheel, knee pad included, stable design', 55, 4, 7);

-- ── Sports & Outdoors > Outdoor Gear (subcat 8) ── 9 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Camping Tent 4-Person',         'camping-tent-4-person-76',           9999, 'Waterproof, easy setup, with carry bag', 12, 4, 8),
('Hiking Backpack 60L',           'hiking-backpack-60l-77',             5499, 'Waterproof, ergonomic, multiple compartments', 20, 4, 8),
('Sleeping Bag Cold Weather',     'sleeping-bag-cold-weather-78',       3999, 'Rated to -10°C, mummy shape, compression sack', 18, 4, 8),
('Portable Camping Stove',        'portable-camping-stove-79',          2499, 'Butane gas, 9000 BTU, foldable stand', 25, 4, 8),
('Trekking Pole Set Aluminum',    'trekking-pole-set-aluminum-80',       3499, 'Adjustable 65-135cm, anti-shock, cork grip', 15, 4, 8),
('Insulated Water Bottle 1L',     'insulated-water-bottle-1l-81',       1799, 'Double-wall vacuum, copper lined, 24hr cold', 50, 4, 8),
('Headlamp LED Rechargeable',     'headlamp-led-rechargeable-82',       1299, '300 lumens, USB-C charging, waterproof', 35, 4, 8),
('Cooler Bag 30L Insulated',      'cooler-bag-30l-insulated-83',        2999, 'Thick insulation, waterproof lining, shoulder strap', 22, 4, 8),
('First Aid Kit Outdoor',         'first-aid-kit-outdoor-84',           999, '85 pieces, waterproof case, compact', 70, 4, 8);

-- ── Books & Stationery > Academic Books (subcat 9) ── 8 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Mathematics for JEE Advanced',  'mathematics-for-jee-advanced-85',    1299, 'Comprehensive guide with solved examples', 40, 5, 9),
('Organic Chemistry NCERT Guide', 'organic-chemistry-ncert-guide-86',   899, 'Reaction mechanisms, practice problems', 45, 5, 9),
('University Physics Vol 1',      'university-physics-vol-1-87',        1499, 'Calculus-based physics for science students', 30, 5, 9),
('Data Structures & Algorithms',  'data-structures-algorithms-88',      1799, 'Cormen, Leiserson, Rivest classic textbook', 25, 5, 9),
('English Grammar in Use',        'english-grammar-in-use-89',          799, 'Intermediate level, with answers and CD', 55, 5, 9),
('Introduction to Economics',     'introduction-to-economics-90',       999, 'Micro and macro fundamentals for beginners', 35, 5, 9),
('Calculus Early Transcendentals','calculus-early-transcendentals-91',  1899, 'Stewart, 9th edition, full-color', 20, 5, 9),
('GRE Verbal Reasoning Guide',    'gre-verbal-reasoning-guide-92',      1099, '3000+ words, practice tests, strategies', 28, 5, 9);

-- ── Books & Stationery > Office Supplies (subcat 10) ── 8 products
INSERT INTO products (name, slug, price, description, stock, category_id, subcategory_id) VALUES
('Classmate Notebook A4 7-Subject','classmate-notebook-a4-7-subject-93', 399, '792 pages, hard cover, long lasting', 200, 5, 10),
('Parker Jotter Ball Pen',         'parker-jotter-ball-pen-94',         599, 'Stainless steel, medium tip, blue ink refill', 150, 5, 10),
('Sharpie Permanent Markers 12pk','sharpie-permanent-markers-12pk-95',  799, 'Fine point, assorted colors, waterproof', 80, 5, 10),
('Staples A4 Laminator',           'staples-a4-laminator-96',           2499, 'A4 max, 2-min warm up, 10 sheet capacity', 20, 5, 10),
('Post-it Notes 100 Sheet 12pk',  'post-it-notes-100-sheet-12pk-97',    899, '12 pads, assorted neon colors, 76x76mm', 100, 5, 10),
('BIC Ball Pen Pack 20',          'bic-ball-pen-pack-20-98',            399, '20 blue pens, medium point, 1.6mm tip', 300, 5, 10),
('Desk Organizer Mesh',            'desk-organizer-mesh-99',            899, 'Metal mesh, 8 compartments, black', 45, 5, 10),
('Whiteboard Magnetic 2x3 Feet',  'whiteboard-magnetic-2x3-feet-100',   1999, 'Magnetic surface, marker tray, wall mount', 30, 5, 10);

COMMIT;
