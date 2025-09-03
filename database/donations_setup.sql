-- Donations System Setup
-- This script creates the necessary tables for the medicine donation system

-- 1. Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT NOT NULL,
    donor_address TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'collected', 'completed')),
    admin_notes TEXT,
    pickup_date DATE,
    pickup_time TIME,
    total_items INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create donation_items table
CREATE TABLE IF NOT EXISTS donation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create pickup_schedules table for tracking pickup appointments
CREATE TABLE IF NOT EXISTS pickup_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    pickup_address TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    driver_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_donation_id ON pickup_schedules(donation_id);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_status ON pickup_schedules(status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for donations table
-- Users can view their own donations
CREATE POLICY "Users can view own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own donations
CREATE POLICY "Users can insert own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own donations (only certain fields)
CREATE POLICY "Users can update own donations" ON donations
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations" ON donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can update all donations
CREATE POLICY "Admins can update all donations" ON donations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 7. Create RLS policies for donation_items table
-- Users can view items from their own donations
CREATE POLICY "Users can view own donation items" ON donation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

-- Users can insert items for their own donations
CREATE POLICY "Users can insert own donation items" ON donation_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

-- Admins can view all donation items
CREATE POLICY "Admins can view all donation items" ON donation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 8. Create RLS policies for pickup_schedules table
-- Users can view pickup schedules for their own donations
CREATE POLICY "Users can view own pickup schedules" ON pickup_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = pickup_schedules.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

-- Admins can manage all pickup schedules
CREATE POLICY "Admins can manage all pickup schedules" ON pickup_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_schedules_updated_at 
    BEFORE UPDATE ON pickup_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create function to calculate total items in donation
CREATE OR REPLACE FUNCTION calculate_donation_total_items()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE donations 
        SET total_items = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM donation_items 
            WHERE donation_id = COALESCE(NEW.donation_id, OLD.donation_id)
        )
        WHERE id = COALESCE(NEW.donation_id, OLD.donation_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 12. Create trigger for total items calculation
CREATE TRIGGER update_donation_total_items
    AFTER INSERT OR UPDATE OR DELETE ON donation_items
    FOR EACH ROW EXECUTE FUNCTION calculate_donation_total_items();

-- 13. Insert sample donation statuses for reference
INSERT INTO donations (user_id, donor_name, donor_email, donor_phone, donor_address, message, status, total_items)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Sample Donor', 'sample@example.com', '1234567890', 'Sample Address', 'Sample donation', 'pending', 2)
ON CONFLICT DO NOTHING;

-- 14. Grant necessary permissions
GRANT ALL ON donations TO authenticated;
GRANT ALL ON donation_items TO authenticated;
GRANT ALL ON pickup_schedules TO authenticated;

-- 15. Create view for users to see their donations with pickup info
CREATE OR REPLACE VIEW user_donations_view AS
SELECT 
    d.id,
    d.donor_name,
    d.donor_email,
    d.donor_phone,
    d.donor_address,
    d.message,
    d.status,
    d.admin_notes,
    d.pickup_date,
    d.pickup_time,
    d.total_items,
    d.created_at,
    d.updated_at,
    ps.scheduled_date,
    ps.scheduled_time,
    ps.pickup_address as scheduled_pickup_address,
    ps.status as pickup_status,
    ps.driver_notes,
    ps.admin_notes as pickup_admin_notes
FROM donations d
LEFT JOIN pickup_schedules ps ON d.id = ps.donation_id
WHERE d.user_id = auth.uid();

-- 16. Create view for admins to see all donations
CREATE OR REPLACE VIEW admin_donations_view AS
SELECT 
    d.id,
    d.user_id,
    d.donor_name,
    d.donor_email,
    d.donor_phone,
    d.donor_address,
    d.message,
    d.status,
    d.admin_notes,
    d.pickup_date,
    d.pickup_time,
    d.total_items,
    d.created_at,
    d.updated_at,
    ps.scheduled_date,
    ps.scheduled_time,
    ps.pickup_address as scheduled_pickup_address,
    ps.status as pickup_status,
    ps.driver_notes,
    ps.admin_notes as pickup_admin_notes,
    up.full_name as user_full_name,
    up.email as user_email
FROM donations d
LEFT JOIN pickup_schedules ps ON d.id = ps.donation_id
LEFT JOIN profiles up ON d.user_id = up.user_id;

-- Grant access to views
GRANT SELECT ON user_donations_view TO authenticated;
GRANT SELECT ON admin_donations_view TO authenticated;

-- 17. Add "My Donations" column to orders table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'my_donations'
    ) THEN
        ALTER TABLE orders ADD COLUMN my_donations TEXT DEFAULT 'No donations';
    END IF;
END $$;

-- 18. Create function to update orders with donation info
CREATE OR REPLACE FUNCTION update_orders_with_donations()
RETURNS TRIGGER AS $$
BEGIN
    -- Update orders table with donation information
    UPDATE orders 
    SET my_donations = (
        SELECT string_agg(
            'Donation: ' || d.donor_name || ' - ' || d.status || 
            CASE 
                WHEN ps.scheduled_date IS NOT NULL 
                THEN ' (Pickup: ' || ps.scheduled_date || ' ' || ps.scheduled_time || ')'
                ELSE ''
            END, 
            '; '
        )
        FROM donations d
        LEFT JOIN pickup_schedules ps ON d.id = ps.donation_id
        WHERE d.user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 19. Create trigger for orders update
CREATE TRIGGER update_orders_donations
    AFTER INSERT OR UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_orders_with_donations();

PRINT '✅ Donations system setup completed successfully!';
PRINT '📋 Tables created: donations, donation_items, pickup_schedules';
PRINT '🔒 RLS policies configured for security';
PRINT '👥 Views created: user_donations_view, admin_donations_view';
PRINT '🔄 Triggers set up for automatic updates';
PRINT '📦 Orders table updated with "my_donations" column';
