-- Medicines Table Setup for FlickXir Healthcare Platform
-- This script creates the medicines table and sets up the necessary structure

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    dosage_limit TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_price ON medicines(price);
CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view medicines
CREATE POLICY "Anyone can view medicines" ON medicines FOR SELECT USING (true);

-- Only authenticated users can insert medicines (for admin purposes)
CREATE POLICY "Authenticated users can insert medicines" ON medicines FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update medicines
CREATE POLICY "Authenticated users can update medicines" ON medicines FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete medicines
CREATE POLICY "Authenticated users can delete medicines" ON medicines FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample medicines data
INSERT INTO medicines (name, description, price, dosage_limit, image_url) VALUES
(
    'Paracetamol 500mg',
    'Paracetamol is a common pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
    25.00,
    'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
    'https://mjsxgsriufscurbpfkwp.supabase.co/storage/v1/object/public/image/paracetamol.webp'
),
(
    'Amoxicillin 500mg',
    'Amoxicillin is a penicillin antibiotic that fights bacteria in the body. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.',
    45.00,
    'Take 1 capsule 3 times daily with or without food. Complete the full course of treatment.',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center'
),
(
    'Ibuprofen 400mg',
    'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.',
    35.00,
    'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 6 tablets in 24 hours.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center'
),
(
    'Cetirizine 10mg',
    'Cetirizine is an antihistamine that reduces the effects of natural chemical histamine in the body. It is used to treat cold or allergy symptoms such as sneezing, itching, watery eyes, or runny nose.',
    30.00,
    'Take 1 tablet once daily with or without food. Best taken in the evening.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center'
),
(
    'Metformin 500mg',
    'Metformin is used to treat high blood sugar levels caused by type 2 diabetes. It works by helping to restore your body''s proper response to the insulin you naturally produce.',
    55.00,
    'Take 1 tablet twice daily with meals. Start with 500mg once daily and gradually increase.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center'
),
(
    'Omeprazole 20mg',
    'Omeprazole is used to treat certain stomach and esophagus problems such as acid reflux and ulcers. It works by decreasing the amount of acid your stomach makes.',
    40.00,
    'Take 1 capsule once daily before breakfast. Swallow whole, do not crush or chew.',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center'
);

-- Display the created medicines
SELECT * FROM medicines ORDER BY created_at DESC;
