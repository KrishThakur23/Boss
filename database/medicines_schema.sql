-- =====================================================
-- MEDICINES TABLE SCHEMA FOR FLICKXIR HEALTHCARE
-- =====================================================

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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_price ON medicines(price);
CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at);

-- Enable Row Level Security
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read, admin write)
CREATE POLICY "Anyone can view medicines" ON medicines
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify medicines" ON medicines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- =====================================================
-- SAMPLE MEDICINES DATA
-- =====================================================

-- Insert sample medicines with realistic Indian prices and descriptions
INSERT INTO medicines (name, description, price, dosage_limit, image_url) VALUES
(
    'Paracetamol 500mg',
    'Paracetamol is a common pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers. It works by inhibiting the synthesis of prostaglandins in the central nervous system.',
    25.00,
    'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
    'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center'
),
(
    'Amoxicillin 500mg',
    'Amoxicillin is a penicillin antibiotic that fights bacteria in the body. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.',
    85.00,
    'Take 1 capsule 3 times daily for 7-10 days. Complete the full course of treatment.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center'
),
(
    'Ibuprofen 400mg',
    'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.',
    35.00,
    'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 6 tablets in 24 hours.',
    'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center'
),
(
    'Cetirizine 10mg',
    'Cetirizine is an antihistamine that reduces the effects of natural chemical histamine in the body. It is used to treat cold or allergy symptoms such as sneezing, itching, watery eyes, or runny nose.',
    45.00,
    'Take 1 tablet once daily. Best taken in the evening to avoid drowsiness.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center'
),
(
    'Metformin 500mg',
    'Metformin is an oral diabetes medicine that helps control blood sugar levels. It is used together with diet and exercise to improve blood sugar control in adults with type 2 diabetes mellitus.',
    120.00,
    'Take 1 tablet twice daily with meals. Start with 500mg and gradually increase as directed by your doctor.',
    'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center'
),
(
    'Omeprazole 20mg',
    'Omeprazole is a proton pump inhibitor that decreases the amount of acid produced in the stomach. It is used to treat certain stomach and esophagus problems such as acid reflux and ulcers.',
    95.00,
    'Take 1 capsule once daily before breakfast. Swallow whole, do not crush or chew.',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center'
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Medicines Table Successfully Created!';
    RAISE NOTICE '📊 Table: medicines';
    RAISE NOTICE '🔐 RLS Policies: Enabled';
    RAISE NOTICE '📝 Sample Data: 6 medicines with realistic Indian prices';
    RAISE NOTICE '🚀 Ready for API integration!';
END $$;
