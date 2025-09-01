-- =====================================================
-- SUPABASE DATABASE SETUP FOR REAL PRODUCT DATA
-- =====================================================
-- Run these commands in your Supabase SQL Editor
-- Make sure you have the necessary tables created first

-- =====================================================
-- 1. CREATE CATEGORIES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) UNIQUE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE PRODUCTS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  manufacturer VARCHAR(200),
  dosage_form VARCHAR(100),
  strength VARCHAR(100),
  prescription_required BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INSERT CATEGORIES
-- =====================================================

INSERT INTO categories (name, description, slug, image_url) VALUES
('Essential Medicines', 'Basic medicines for common ailments and pain relief', 'essential-medicines', 'https://dummyimage.com/400x200/eff6ff/1e293b&text=Essential+Medicines'),
('Supplements & Vitamins', 'Nutritional supplements and vitamin products', 'supplements-vitamins', 'https://dummyimage.com/400x200/f0fdf4/1e293b&text=Supplements+%26+Vitamins'),
('Medical Equipment', 'Medical devices and diagnostic equipment', 'medical-equipment', 'https://dummyimage.com/400x200/f0f9ff/1e293b&text=Medical+Equipment'),
('Personal Care', 'Hygiene and personal care products', 'personal-care', 'https://dummyimage.com/400x200/fefce8/1e293b&text=Personal+Care'),
('Ayurvedic & Herbal', 'Traditional Indian medicines and herbal products', 'ayurvedic-herbal', 'https://dummyimage.com/400x200/fdf4ff/1e293b&text=Ayurvedic+%26+Herbal'),
('Baby Care', 'Products specifically for infants and children', 'baby-care', 'https://dummyimage.com/400x200/f0f9ff/1e293b&text=Baby+Care')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. INSERT ESSENTIAL MEDICINES
-- =====================================================

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Paracetamol 500mg',
  'Effective pain reliever and fever reducer. Safe for most adults and children.',
  45.00,
  c.id,
  'https://dummyimage.com/300x300/eff6ff/1e293b&text=Paracetamol+500mg',
  'MED001',
  'Generic Pharmaceuticals',
  'Tablet',
  '500mg',
  false
FROM categories c WHERE c.name = 'Essential Medicines';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Ibuprofen 400mg',
  'Anti-inflammatory pain reliever for headaches, muscle pain, and arthritis.',
  60.00,
  c.id,
  'https://dummyimage.com/300x300/fef3c7/1e293b&text=Ibuprofen+400mg',
  'MED002',
  'Generic Pharmaceuticals',
  'Tablet',
  '400mg',
  false
FROM categories c WHERE c.name = 'Essential Medicines';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Azithromycin 500mg',
  'Antibiotic for bacterial infections. Take as prescribed by your doctor.',
  120.00,
  c.id,
  'https://dummyimage.com/300x300/e0f2fe/1e293b&text=Azithromycin+500mg',
  'MED003',
  'Generic Pharmaceuticals',
  'Tablet',
  '500mg',
  true
FROM categories c WHERE c.name = 'Essential Medicines';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Cetirizine 10mg',
  'Antihistamine for allergy relief. Reduces sneezing, runny nose, and itchy eyes.',
  35.00,
  c.id,
  'https://dummyimage.com/300x300/faf5ff/1e293b&text=Cetirizine+10mg',
  'MED004',
  'Generic Pharmaceuticals',
  'Tablet',
  '10mg',
  false
FROM categories c WHERE c.name = 'Essential Medicines';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Pantoprazole 40mg',
  'Proton pump inhibitor for acid reflux and stomach ulcers.',
  85.00,
  c.id,
  'https://dummyimage.com/300x300/f5f5f5/1e293b&text=Pantoprazole+40mg',
  'MED005',
  'Generic Pharmaceuticals',
  'Tablet',
  '40mg',
  true
FROM categories c WHERE c.name = 'Essential Medicines';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Metformin 500mg',
  'Oral diabetes medicine for type 2 diabetes management.',
  95.00,
  c.id,
  'https://dummyimage.com/300x300/fef2f2/1e293b&text=Metformin+500mg',
  'MED006',
  'Generic Pharmaceuticals',
  'Tablet',
  '500mg',
  true
FROM categories c WHERE c.name = 'Essential Medicines';

-- =====================================================
-- 5. INSERT SUPPLEMENTS & VITAMINS
-- =====================================================

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Vitamin D3 1000IU',
  'Essential vitamin for bone health and immune system support.',
  180.00,
  c.id,
  'https://dummyimage.com/300x300/f0fdf4/1e293b&text=Vitamin+D3+1000IU',
  'SUP001',
  'Health Supplements Ltd',
  'Softgel',
  '1000IU',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Omega-3 Fish Oil',
  'Rich source of essential fatty acids for heart and brain health.',
  220.00,
  c.id,
  'https://dummyimage.com/300x300/fefce8/1e293b&text=Omega-3+Fish+Oil',
  'SUP002',
  'Health Supplements Ltd',
  'Softgel',
  '1000mg',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Multivitamin Tablets',
  'Complete daily multivitamin with minerals for overall health.',
  150.00,
  c.id,
  'https://dummyimage.com/300x300/fdf4ff/1e293b&text=Multivitamin+Tablets',
  'SUP003',
  'Health Supplements Ltd',
  'Tablet',
  'Daily',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Calcium + D3',
  'Calcium supplement with Vitamin D for strong bones and teeth.',
  120.00,
  c.id,
  'https://dummyimage.com/300x300/f0f9ff/1e293b&text=Calcium+%2B+D3',
  'SUP004',
  'Health Supplements Ltd',
  'Tablet',
  '500mg+200IU',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Iron Supplements',
  'Iron supplement for treating and preventing iron deficiency anemia.',
  95.00,
  c.id,
  'https://dummyimage.com/300x300/fef2f2/1e293b&text=Iron+Supplements',
  'SUP005',
  'Health Supplements Ltd',
  'Tablet',
  '100mg',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Probiotics Capsules',
  'Beneficial bacteria for gut health and digestive support.',
  280.00,
  c.id,
  'https://dummyimage.com/300x300/f0fdf4/1e293b&text=Probiotics+Capsules',
  'SUP006',
  'Health Supplements Ltd',
  'Capsule',
  '10B CFU',
  false
FROM categories c WHERE c.name = 'Supplements & Vitamins';

-- =====================================================
-- 6. INSERT MEDICAL EQUIPMENT
-- =====================================================

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Digital Thermometer',
  'Accurate digital thermometer for body temperature measurement.',
  350.00,
  c.id,
  'https://dummyimage.com/300x300/f0f9ff/1e293b&text=Digital+Thermometer',
  'EQUIP001',
  'Medical Devices Inc',
  'Device',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Blood Pressure Monitor',
  'Digital BP monitor for home use with memory function.',
  1200.00,
  c.id,
  'https://dummyimage.com/300x300/fef2f2/1e293b&text=BP+Monitor',
  'EQUIP002',
  'Medical Devices Inc',
  'Device',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Pulse Oximeter',
  'Finger pulse oximeter for measuring blood oxygen levels.',
  450.00,
  c.id,
  'https://dummyimage.com/300x300/f0fdf4/1e293b&text=Pulse+Oximeter',
  'EQUIP003',
  'Medical Devices Inc',
  'Device',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Glucose Monitor',
  'Blood glucose monitoring system with test strips.',
  850.00,
  c.id,
  'https://dummyimage.com/300x300/fefce8/1e293b&text=Glucose+Monitor',
  'EQUIP004',
  'Medical Devices Inc',
  'Device',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Nebulizer Machine',
  'Portable nebulizer for respiratory treatments.',
  1800.00,
  c.id,
  'https://dummyimage.com/300x300/f0f9ff/1e293b&text=Nebulizer',
  'EQUIP005',
  'Medical Devices Inc',
  'Device',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'First Aid Kit',
  'Comprehensive first aid kit for home and travel use.',
  280.00,
  c.id,
  'https://dummyimage.com/300x300/fef2f2/1e293b&text=First+Aid+Kit',
  'EQUIP006',
  'Medical Devices Inc',
  'Kit',
  'N/A',
  false
FROM categories c WHERE c.name = 'Medical Equipment';

-- =====================================================
-- 7. INSERT PERSONAL CARE PRODUCTS
-- =====================================================

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Hand Sanitizer 500ml',
  'Alcohol-based hand sanitizer for effective hand hygiene.',
  120.00,
  c.id,
  'https://dummyimage.com/300x300/f0fdf4/1e293b&text=Hand+Sanitizer',
  'CARE001',
  'Personal Care Ltd',
  'Liquid',
  '70% Alcohol',
  false
FROM categories c WHERE c.name = 'Personal Care';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Face Masks (Pack of 10)',
  '3-ply surgical face masks for daily protection.',
  85.00,
  c.id,
  'https://dummyimage.com/300x300/f0f9ff/1e293b&text=Face+Masks',
  'CARE002',
  'Personal Care Ltd',
  'Pack',
  '10 Masks',
  false
FROM categories c WHERE c.name = 'Personal Care';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Antiseptic Solution',
  'Antiseptic solution for wound cleaning and disinfection.',
  65.00,
  c.id,
  'https://dummyimage.com/300x300/fefce8/1e293b&text=Antiseptic',
  'CARE003',
  'Personal Care Ltd',
  'Liquid',
  '5% Povidone',
  false
FROM categories c WHERE c.name = 'Personal Care';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Cotton Wool 100g',
  'Sterile cotton wool for medical and personal care use.',
  45.00,
  c.id,
  'https://dummyimage.com/300x300/f5f5f5/1e293b&text=Cotton+Wool',
  'CARE004',
  'Personal Care Ltd',
  'Pack',
  '100g',
  false
FROM categories c WHERE c.name = 'Personal Care';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Bandages (Assorted)',
  'Assorted adhesive bandages in various sizes.',
  75.00,
  c.id,
  'https://dummyimage.com/300x300/fef2f2/1e293b&text=Bandages',
  'CARE005',
  'Personal Care Ltd',
  'Pack',
  'Assorted',
  false
FROM categories c WHERE c.name = 'Personal Care';

INSERT INTO products (name, description, price, category_id, image_url, sku, manufacturer, dosage_form, strength, prescription_required) 
SELECT 
  'Surgical Tape',
  'Medical adhesive tape for securing dressings and bandages.',
  55.00,
  c.id,
  'https://dummyimage.com/300x300/f0f9ff/1e293b&text=Surgical+Tape',
  'CARE006',
  'Personal Care Ltd',
  'Roll',
  '1 inch',
  false
FROM categories c WHERE c.name = 'Personal Care';

-- =====================================================
-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE RLS POLICIES
-- =====================================================

-- Categories: Allow public read access
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Products: Allow public read access to active products
CREATE POLICY "Active products are viewable by everyone" ON products
  FOR SELECT USING (is_active = true);

-- =====================================================
-- 11. VERIFY DATA INSERTION
-- =====================================================

-- Check total products
SELECT 'Total Products' as metric, COUNT(*) as count FROM products
UNION ALL
SELECT 'Total Categories' as metric, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products by Category' as metric, COUNT(*) as count FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY metric;

-- =====================================================
-- COMMANDS COMPLETED SUCCESSFULLY!
-- =====================================================
-- Your Supabase database now contains real product data
-- The frontend will automatically fetch and display these products
-- Make sure your ProductService is properly configured to connect to Supabase
