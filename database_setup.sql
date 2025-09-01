-- Create the medicine_donations table
CREATE TABLE IF NOT EXISTS medicine_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Medicine Details
  medicine_name TEXT NOT NULL,
  medicine_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair')),
  description TEXT,
  
  -- Donor Information
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Pickup Information
  pickup_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  
  -- Status and Timestamps
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'picked_up', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicine_donations_donor_email ON medicine_donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_medicine_donations_status ON medicine_donations(status);
CREATE INDEX IF NOT EXISTS idx_medicine_donations_created_at ON medicine_donations(created_at);
CREATE INDEX IF NOT EXISTS idx_medicine_donations_expiry_date ON medicine_donations(expiry_date);

-- Enable Row Level Security (RLS)
ALTER TABLE medicine_donations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own donations
CREATE POLICY "Users can view own donations" ON medicine_donations
  FOR SELECT USING (donor_email = auth.jwt() ->> 'email');

-- Users can insert their own donations
CREATE POLICY "Users can insert own donations" ON medicine_donations
  FOR INSERT WITH CHECK (donor_email = auth.jwt() ->> 'email');

-- Users can update their own donations
CREATE POLICY "Users can update own donations" ON medicine_donations
  FOR UPDATE USING (donor_email = auth.jwt() ->> 'email');

-- Admins can view all donations
CREATE POLICY "Admins can view all donations" ON medicine_donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = auth.jwt() ->> 'email' 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Admins can update all donations
CREATE POLICY "Admins can update all donations" ON medicine_donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = auth.jwt() ->> 'email' 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_medicine_donations_updated_at 
  BEFORE UPDATE ON medicine_donations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO medicine_donations (
  medicine_name, medicine_type, quantity, expiry_date, condition,
  donor_name, donor_email, donor_phone, pickup_address, city, state, pincode
) VALUES 
(
  'Paracetamol 500mg', 'Pain Relief', '20 tablets', '2025-12-31', 'excellent',
  'John Doe', 'john@example.com', '9876543210', '123 Main St', 'Mumbai', 'Maharashtra', '400001'
),
(
  'Vitamin C 1000mg', 'Vitamins & Supplements', '30 tablets', '2025-10-15', 'good',
  'Jane Smith', 'jane@example.com', '9876543211', '456 Oak Ave', 'Delhi', 'Delhi', '110001'
);
