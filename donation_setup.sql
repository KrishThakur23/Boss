-- Donation System Database Setup
-- Run this in your Supabase SQL editor

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(20) NOT NULL,
    donor_address TEXT NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'collected', 'completed', 'cancelled')),
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donation_items table
CREATE TABLE IF NOT EXISTS donation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_product_id ON donation_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations table
-- Users can view their own donations
CREATE POLICY "Users can view own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own donations
CREATE POLICY "Users can create donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own donations (only certain fields)
CREATE POLICY "Users can update own donations" ON donations
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all donations (replace with your admin email)
CREATE POLICY "Admin can view all donations" ON donations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'bhalackdhebil@gmail.com'
        )
    );

-- RLS Policies for donation_items table
-- Users can view donation items for their own donations
CREATE POLICY "Users can view own donation items" ON donation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

-- Users can insert donation items for their own donations
CREATE POLICY "Users can create donation items" ON donation_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

-- Admin can view all donation items
CREATE POLICY "Admin can view all donation items" ON donation_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'bhalackdhebil@gmail.com'
        )
    );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample donation statuses for reference
COMMENT ON COLUMN donations.status IS 'Donation status: pending (submitted), confirmed (verified), collected (picked up), completed (distributed), cancelled';

-- Grant necessary permissions
GRANT ALL ON donations TO authenticated;
GRANT ALL ON donation_items TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;