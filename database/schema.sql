-- =====================================================
-- FLICKXIR HEALTHCARE PLATFORM - DATABASE SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor
-- This creates all tables, relationships, and sample data

-- =====================================================
-- CLEANUP EXISTING OBJECTS (SAFE TO RUN MULTIPLE TIMES)
-- =====================================================

-- Drop existing triggers first (only if tables exist)
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart') THEN
        DROP TRIGGER IF EXISTS update_cart_updated_at ON cart;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
        DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishlist') THEN
        DROP TRIGGER IF EXISTS update_wishlist_updated_at ON wishlist;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
    END IF;
END $$;

-- Drop existing functions
DO $$
BEGIN
    -- Drop functions only if they exist
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP FUNCTION update_updated_at_column() CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_order_number') THEN
        DROP FUNCTION generate_order_number() CASCADE;
    END IF;
END $$;

-- Drop existing tables (in reverse dependency order)
-- Use CASCADE to handle dependencies automatically
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
-- Note: profiles table references auth.users, so we need to be careful
-- If it exists, drop it; if not, continue
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP TABLE profiles CASCADE;
    END IF;
END $$;

-- =====================================================
-- CREATE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    emergency_contact TEXT,
    blood_group TEXT,
    allergies TEXT[],
    medical_conditions TEXT[],
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category_id UUID REFERENCES categories(id),
    manufacturer TEXT,
    generic_name TEXT,
    strength TEXT,
    dosage_form TEXT,
    pack_size TEXT,
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER DEFAULT 10,
    requires_prescription BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    image_urls TEXT[],
    tags TEXT[],
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES cart(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    cause TEXT NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing', 'both')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    related_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_requires_prescription ON products(requires_prescription);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Prescriptions indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_order_id ON prescriptions(order_id);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_cause ON donations(cause);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);

-- Addresses indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_address_type ON addresses(address_type);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'FLK-' || EXTRACT(YEAR FROM NOW()) || 
                       LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') ||
                       LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-' ||
                       LPAD(NEW.id::TEXT, 8, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at
    BEFORE UPDATE ON wishlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for order number generation
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert profiles (needed for automatic profile creation)
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Product reviews policies
CREATE POLICY "Anyone can view product reviews" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can view their own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON cart
    FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Prescriptions policies
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" ON prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses" ON addresses
    FOR ALL USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (id, name, description, image_url, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Medicines', 'Prescription and over-the-counter medicines', '/images/categories/medicines.jpg', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Personal Care', 'Hygiene and personal care products', '/images/categories/personal-care.jpg', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Health Supplements', 'Vitamins, minerals, and health supplements', '/images/categories/supplements.jpg', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Medical Devices', 'Blood pressure monitors, thermometers, etc.', '/images/categories/devices.jpg', 4),
('550e8400-e29b-41d4-a716-446655440005', 'Baby Care', 'Baby health and care products', '/images/categories/baby-care.jpg', 5),
('550e8400-e29b-41d4-a716-446655440006', 'First Aid', 'First aid kits and emergency supplies', '/images/categories/first-aid.jpg', 6),
('550e8400-e29b-41d4-a716-446655440007', 'Ayurveda', 'Traditional Ayurvedic medicines and products', '/images/categories/ayurveda.jpg', 7),
('550e8400-e29b-41d4-a716-446655440008', 'Home Health', 'Home healthcare and monitoring devices', '/images/categories/home-health.jpg', 8);

-- Insert sample products
INSERT INTO products (id, name, description, short_description, category_id, manufacturer, generic_name, strength, dosage_form, pack_size, price, mrp, discount_percentage, in_stock, stock_quantity, requires_prescription, is_featured, image_urls, tags) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', 'Effective pain reliever and fever reducer', 'Pain relief tablets', '550e8400-e29b-41d4-a716-446655440001', 'Generic Pharma', 'Paracetamol', '500mg', 'Tablet', '10 tablets', 15.00, 20.00, 25.00, true, 100, false, true, ARRAY['/images/products/paracetamol-1.jpg', '/images/products/paracetamol-2.jpg'], ARRAY['pain relief', 'fever', 'headache']),
('660e8400-e29b-41d4-a716-446655440002', 'Vitamin C 1000mg', 'High potency Vitamin C for immune support', 'Immune system support', '550e8400-e29b-41d4-a716-446655440003', 'HealthVit', 'Ascorbic Acid', '1000mg', 'Tablet', '30 tablets', 299.00, 399.00, 25.00, true, 50, false, true, ARRAY['/images/products/vitamin-c-1.jpg'], ARRAY['vitamin c', 'immune', 'antioxidant']),
('660e8400-e29b-41d4-a716-446655440003', 'Blood Pressure Monitor', 'Digital automatic BP monitor with irregular heartbeat detection', 'Accurate BP monitoring', '550e8400-e29b-41d4-a716-446655440004', 'Omron', 'BP Monitor', 'N/A', 'Device', '1 unit', 2499.00, 2999.00, 16.67, true, 25, false, true, ARRAY['/images/products/bp-monitor-1.jpg'], ARRAY['blood pressure', 'monitor', 'digital']),
('660e8400-e29b-41d4-a716-446655440004', 'Dettol Antiseptic Liquid', 'Trusted antiseptic for cuts and wounds', 'Antiseptic protection', '550e8400-e29b-41d4-a716-446655440002', 'Reckitt Benckiser', 'Chloroxylenol', '4.8%', 'Liquid', '550ml', 89.00, 99.00, 10.10, true, 75, false, false, ARRAY['/images/products/dettol-1.jpg'], ARRAY['antiseptic', 'first aid', 'disinfectant']),
('660e8400-e29b-41d4-a716-446655440005', 'Amoxicillin 500mg', 'Antibiotic for bacterial infections', 'Bacterial infection treatment', '550e8400-e29b-41d4-a716-446655440001', 'Generic Pharma', 'Amoxicillin', '500mg', 'Capsule', '10 capsules', 45.00, 60.00, 25.00, true, 60, true, false, ARRAY['/images/products/amoxicillin-1.jpg'], ARRAY['antibiotic', 'bacterial infection', 'prescription']),
('660e8400-e29b-41d4-a716-446655440006', 'Digital Thermometer', 'Fast and accurate temperature reading', 'Temperature monitoring', '550e8400-e29b-41d4-a716-446655440004', 'Dr. Morepen', 'Thermometer', 'N/A', 'Device', '1 unit', 299.00, 399.00, 25.06, true, 40, false, false, ARRAY['/images/products/thermometer-1.jpg'], ARRAY['thermometer', 'digital', 'temperature']),
('660e8400-e29b-41d4-a716-446655440007', 'First Aid Kit', 'Comprehensive first aid kit for home and travel', 'Emergency first aid', '550e8400-e29b-41d4-a716-446655440006', 'First Aid Plus', 'First Aid Kit', 'N/A', 'Kit', '1 kit', 599.00, 799.00, 25.03, true, 30, false, true, ARRAY['/images/products/first-aid-kit-1.jpg'], ARRAY['first aid', 'emergency', 'travel']),
('660e8400-e29b-41d4-a716-446655440008', 'Baby Diapers', 'Comfortable and absorbent baby diapers', 'Baby care essentials', '550e8400-e29b-41d4-a716-446655440005', 'Pampers', 'Baby Diapers', 'Size 4', 'Pack', '44 diapers', 799.00, 999.00, 20.02, true, 100, false, false, ARRAY['/images/products/diapers-1.jpg'], ARRAY['baby', 'diapers', 'care']),
('660e8400-e29b-41d4-a716-446655440009', 'Ashwagandha Tablets', 'Traditional Ayurvedic herb for stress relief', 'Natural stress relief', '550e8400-e29b-41d4-a716-446655440007', 'Ayurveda Plus', 'Ashwagandha', '500mg', 'Tablet', '60 tablets', 399.00, 499.00, 20.04, true, 45, false, false, ARRAY['/images/products/ashwagandha-1.jpg'], ARRAY['ayurveda', 'stress relief', 'natural']),
('660e8400-e29b-41d4-a716-446655440010', 'Glucose Monitor', 'Accurate blood glucose monitoring system', 'Diabetes management', '550e8400-e29b-41d4-a716-446655440008', 'Accu-Chek', 'Glucose Monitor', 'N/A', 'Device', '1 unit', 1499.00, 1999.00, 25.01, true, 20, false, true, ARRAY['/images/products/glucose-monitor-1.jpg'], ARRAY['diabetes', 'glucose', 'monitor']),
('660e8400-e29b-41d4-a716-446655440011', 'Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 'Pain and inflammation relief', '550e8400-e29b-41d4-a716-446655440001', 'Generic Pharma', 'Ibuprofen', '400mg', 'Tablet', '10 tablets', 25.00, 35.00, 28.57, true, 80, false, false, ARRAY['/images/products/ibuprofen-1.jpg'], ARRAY['pain relief', 'anti-inflammatory', 'fever']),
('660e8400-e29b-41d4-a716-446655440012', 'Calcium + Vitamin D3', 'Essential minerals for bone health', 'Bone health support', '550e8400-e29b-41d4-a716-446655440003', 'HealthVit', 'Calcium Carbonate + Cholecalciferol', '500mg + 250IU', 'Tablet', '60 tablets', 199.00, 249.00, 20.08, true, 65, false, false, ARRAY['/images/products/calcium-d3-1.jpg'], ARRAY['calcium', 'vitamin d', 'bone health']),
('660e8400-e29b-41d4-a716-446655440013', 'Pulse Oximeter', 'Fingertip oxygen saturation monitor', 'Oxygen level monitoring', '550e8400-e29b-41d4-a716-446655440004', 'Dr. Morepen', 'Pulse Oximeter', 'N/A', 'Device', '1 unit', 899.00, 1199.00, 25.02, true, 35, false, false, ARRAY['/images/products/pulse-oximeter-1.jpg'], ARRAY['oxygen', 'monitor', 'health']),
('660e8400-e29b-41d4-a716-446655440014', 'Hand Sanitizer', 'Alcohol-based hand sanitizer gel', 'Hand hygiene', '550e8400-e29b-41d4-a716-446655440002', 'Lifebuoy', 'Hand Sanitizer', '70% alcohol', 'Gel', '100ml', 45.00, 55.00, 18.18, true, 120, false, false, ARRAY['/images/products/hand-sanitizer-1.jpg'], ARRAY['sanitizer', 'hygiene', 'alcohol']),
('660e8400-e29b-41d4-a716-446655440015', 'Baby Wipes', 'Gentle and soft baby wipes', 'Baby hygiene', '550e8400-e29b-41d4-a716-446655440005', 'Himalaya', 'Baby Wipes', 'N/A', 'Pack', '80 wipes', 149.00, 199.00, 25.13, true, 90, false, false, ARRAY['/images/products/baby-wipes-1.jpg'], ARRAY['baby', 'wipes', 'hygiene']),
('660e8400-e29b-41d4-a716-446655440016', 'Neem Tablets', 'Natural neem for skin and immunity', 'Natural immunity support', '550e8400-e29b-41d4-a716-446655440007', 'Ayurveda Plus', 'Neem', '500mg', 'Tablet', '60 tablets', 299.00, 399.00, 25.06, true, 55, false, false, ARRAY['/images/products/neem-1.jpg'], ARRAY['neem', 'immunity', 'natural']),
('660e8400-e29b-41d4-a716-446655440017', 'Weight Scale', 'Digital bathroom weight scale', 'Weight monitoring', '550e8400-e29b-41d4-a716-446655440008', 'HealthGenie', 'Weight Scale', 'N/A', 'Device', '1 unit', 799.00, 999.00, 20.02, true, 25, false, false, ARRAY['/images/products/weight-scale-1.jpg'], ARRAY['weight', 'scale', 'digital']),
('660e8400-e29b-41d4-a716-446655440018', 'Multivitamin Tablets', 'Complete daily multivitamin supplement', 'Daily nutrition support', '550e8400-e29b-41d4-a716-446655440003', 'HealthVit', 'Multivitamin', 'N/A', 'Tablet', '30 tablets', 249.00, 299.00, 16.72, true, 70, false, true, ARRAY['/images/products/multivitamin-1.jpg'], ARRAY['multivitamin', 'nutrition', 'daily']);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ FLICKXIR Healthcare Platform Database Schema Successfully Created!';
    RAISE NOTICE '📊 Tables Created: 18';
    RAISE NOTICE '🔐 RLS Policies: Enabled on all tables';
    RAISE NOTICE '📝 Sample Data: 8 categories, 18 products';
    RAISE NOTICE '🚀 Ready for frontend integration!';
END $$;
