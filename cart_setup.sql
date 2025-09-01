-- Cart System Database Setup
-- Run this in your Supabase SQL editor to ensure cart functionality works properly

-- Create cart table if it doesn't exist (using profiles.id as foreign key)
CREATE TABLE IF NOT EXISTS cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES cart(id) ON DELETE CASCADE,
    product_id UUID,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cart_items_product_id_fkey' 
        AND table_name = 'cart_items'
    ) THEN
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cart" ON cart;
DROP POLICY IF EXISTS "Users can create their own cart" ON cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON cart;

DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;

-- Cart policies (simplified for profiles.id)
CREATE POLICY "Users can view their own cart" ON cart
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cart" ON cart
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart" ON cart
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cart" ON cart
    FOR DELETE USING (user_id = auth.uid());

-- Cart items policies (simplified)
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_cart_updated_at ON cart;
CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 
    'Cart tables created successfully' as status,
    COUNT(*) as cart_count
FROM cart
UNION ALL
SELECT 
    'Cart items table created successfully' as status,
    COUNT(*) as cart_items_count
FROM cart_items;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('cart', 'cart_items')
ORDER BY tablename, policyname;
