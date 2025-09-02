-- ========== DELIVERABLE PINCODES TABLE SETUP ==========

-- Create the deliverable_pincodes table
CREATE TABLE IF NOT EXISTS deliverable_pincodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    delivery_charge DECIMAL(10,2) DEFAULT 0.00,
    estimated_delivery_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on pincode for faster lookups
CREATE INDEX IF NOT EXISTS idx_deliverable_pincodes_pincode ON deliverable_pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_deliverable_pincodes_city ON deliverable_pincodes(city);
CREATE INDEX IF NOT EXISTS idx_deliverable_pincodes_state ON deliverable_pincodes(state);

-- Enable Row Level Security (RLS)
ALTER TABLE deliverable_pincodes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read pincodes
CREATE POLICY "Allow authenticated users to read deliverable pincodes" ON deliverable_pincodes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow only admins to insert/update/delete pincodes
CREATE POLICY "Allow admins to manage deliverable pincodes" ON deliverable_pincodes
    FOR ALL USING (auth.jwt() ->> 'email' = 'bhalackdhebil@gmail.com');

-- Insert sample deliverable pincodes for major Indian cities
INSERT INTO deliverable_pincodes (pincode, city, state, district, delivery_charge, estimated_delivery_days) VALUES
-- Delhi NCR
('110001', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110002', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110003', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110004', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110005', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110006', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110007', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110008', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110009', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110010', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110011', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110012', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110013', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110014', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110015', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110016', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110017', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110018', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110019', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110020', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110021', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110022', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110023', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110024', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110025', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110026', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110027', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110028', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110029', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110030', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110031', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110032', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110033', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110034', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110035', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110036', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110037', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110038', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110039', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110040', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110041', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110042', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110043', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110044', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110045', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110046', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110047', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110048', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110049', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110050', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110051', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110052', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110053', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110054', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110055', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110056', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110057', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110058', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110059', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110060', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110061', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110062', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110063', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110064', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110065', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110066', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110067', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110068', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110069', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110070', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110071', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110072', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110073', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110074', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110075', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110076', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110077', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110078', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110079', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110080', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110081', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110082', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110083', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110084', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110085', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110086', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110087', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110088', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110089', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110090', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110091', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110092', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110093', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110094', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110095', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110096', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110097', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110098', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110099', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),
('110100', 'New Delhi', 'Delhi', 'Central Delhi', 0.00, 1),

-- Greater Noida, UP
('201301', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201302', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201303', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201304', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201305', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201306', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201307', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201308', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201309', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201310', 'Greater Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),

-- Noida, UP
('201301', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201302', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201303', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201304', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201305', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201306', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201307', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201308', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201309', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),
('201310', 'Noida', 'Uttar Pradesh', 'Gautam Buddha Nagar', 0.00, 2),

-- Mumbai, Maharashtra
('400001', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400002', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400003', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400004', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400005', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400006', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400007', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400008', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400009', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),
('400010', 'Mumbai', 'Maharashtra', 'Mumbai City', 50.00, 4),

-- Bangalore, Karnataka
('560001', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560002', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560003', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560004', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560005', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560006', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560007', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560008', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560009', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),
('560010', 'Bangalore', 'Karnataka', 'Bangalore Urban', 75.00, 5),

-- Chennai, Tamil Nadu
('600001', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600002', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600003', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600004', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600005', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600006', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600007', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600008', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600009', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),
('600010', 'Chennai', 'Tamil Nadu', 'Chennai', 80.00, 5),

-- Hyderabad, Telangana
('500001', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500002', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500003', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500004', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500005', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500006', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500007', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500008', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500009', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),
('500010', 'Hyderabad', 'Telangana', 'Hyderabad', 70.00, 4),

-- Kolkata, West Bengal
('700001', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700002', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700003', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700004', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700005', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700006', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700007', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700008', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700009', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),
('700010', 'Kolkata', 'West Bengal', 'Kolkata', 60.00, 4),

-- Pune, Maharashtra
('411001', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411002', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411003', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411004', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411005', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411006', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411007', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411008', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411009', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),
('411010', 'Pune', 'Maharashtra', 'Pune', 65.00, 4),

-- Ahmedabad, Gujarat
('380001', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380002', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380003', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380004', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380005', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380006', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380007', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380008', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380009', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4),
('380010', 'Ahmedabad', 'Gujarat', 'Ahmedabad', 70.00, 4)

ON CONFLICT (pincode) DO NOTHING;

-- Create a function to check if a pincode is deliverable
CREATE OR REPLACE FUNCTION is_pincode_deliverable(pincode_to_check VARCHAR(6))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM deliverable_pincodes 
        WHERE pincode = pincode_to_check AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get pincode details
CREATE OR REPLACE FUNCTION get_pincode_details(pincode_to_check VARCHAR(6))
RETURNS TABLE (
    pincode VARCHAR(6),
    city VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    delivery_charge DECIMAL(10,2),
    estimated_delivery_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.pincode,
        dp.city,
        dp.state,
        dp.district,
        dp.delivery_charge,
        dp.estimated_delivery_days
    FROM deliverable_pincodes dp
    WHERE dp.pincode = pincode_to_check AND dp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_pincode_deliverable(VARCHAR(6)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pincode_details(VARCHAR(6)) TO authenticated;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliverable_pincodes_updated_at
    BEFORE UPDATE ON deliverable_pincodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE deliverable_pincodes IS 'Table containing all deliverable pincodes with delivery charges and estimated delivery times';
COMMENT ON COLUMN deliverable_pincodes.pincode IS '6-digit pincode';
COMMENT ON COLUMN deliverable_pincodes.city IS 'City name';
COMMENT ON COLUMN deliverable_pincodes.state IS 'State name';
COMMENT ON COLUMN deliverable_pincodes.district IS 'District name';
COMMENT ON COLUMN deliverable_pincodes.delivery_charge IS 'Delivery charge for this pincode (0 for free delivery)';
COMMENT ON COLUMN deliverable_pincodes.estimated_delivery_days IS 'Estimated delivery time in days';
COMMENT ON COLUMN deliverable_pincodes.is_active IS 'Whether this pincode is currently active for delivery';
