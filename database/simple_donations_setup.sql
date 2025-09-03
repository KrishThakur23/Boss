-- Simple Donations System Setup for existing profiles table
-- Run this in your Supabase SQL Editor

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

-- 3. Create pickup_schedules table
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

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_donation_id ON pickup_schedules(donation_id);

-- 5. Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for donations
CREATE POLICY "Users can view own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donations" ON donations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations" ON donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all donations" ON donations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 7. Create RLS policies for donation_items
CREATE POLICY "Users can view own donation items" ON donation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own donation items" ON donation_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = donation_items.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all donation items" ON donation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 8. Create RLS policies for pickup_schedules
CREATE POLICY "Users can view own pickup schedules" ON pickup_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE donations.id = pickup_schedules.donation_id 
            AND donations.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all pickup schedules" ON pickup_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 9. Create views
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
    p.name as user_full_name,
    p.email as user_email
FROM donations d
LEFT JOIN pickup_schedules ps ON d.id = ps.donation_id
LEFT JOIN profiles p ON d.user_id = p.id;

-- 10. Grant permissions
GRANT ALL ON donations TO authenticated;
GRANT ALL ON donation_items TO authenticated;
GRANT ALL ON pickup_schedules TO authenticated;
GRANT SELECT ON user_donations_view TO authenticated;
GRANT SELECT ON admin_donations_view TO authenticated;

-- 11. Add "my_donations" column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'my_donations'
    ) THEN
        ALTER TABLE orders ADD COLUMN my_donations TEXT DEFAULT 'No donations';
    END IF;
END $$;

PRINT '✅ Simple donations system setup completed!';
PRINT '📋 Tables created: donations, donation_items, pickup_schedules';
PRINT '🔒 RLS policies configured for security';
PRINT '👥 Views created: user_donations_view, admin_donations_view';
PRINT '📦 Orders table updated with "my_donations" column';

