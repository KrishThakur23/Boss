-- Database Optimization for Prescription Medicine Matching
-- Run this script to optimize the products table for better search performance

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_generic_name_gin ON products USING gin(to_tsvector('english', generic_name));
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products (lower(name));
CREATE INDEX IF NOT EXISTS idx_products_generic_name_lower ON products (lower(generic_name));
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products (manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products (is_active, in_stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_search_composite ON products (is_active, in_stock, name);
CREATE INDEX IF NOT EXISTS idx_products_generic_search_composite ON products (is_active, in_stock, generic_name);

-- Index for prescription-related queries
CREATE INDEX IF NOT EXISTS idx_products_prescription ON products (requires_prescription, is_active);

-- Create cart_items table if it doesn't exist (for prescription cart functionality)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 10),
    prescription_context JSONB,
    is_prescription_item BOOLEAN DEFAULT FALSE,
    requires_prescription_verification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Indexes for cart_items table
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_prescription ON cart_items (user_id, is_prescription_item);
CREATE INDEX IF NOT EXISTS idx_cart_items_prescription_context ON cart_items USING gin(prescription_context);

-- Create prescription_cart_logs table for monitoring
CREATE TABLE IF NOT EXISTS prescription_cart_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    prescription_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for prescription logs
CREATE INDEX IF NOT EXISTS idx_prescription_logs_user_id ON prescription_cart_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_logs_prescription_id ON prescription_cart_logs (prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_logs_timestamp ON prescription_cart_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_prescription_logs_activity_type ON prescription_cart_logs (activity_type);

-- Create performance monitoring table
CREATE TABLE IF NOT EXISTS prescription_performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type TEXT NOT NULL, -- 'ocr', 'matching', 'cart', 'full_pipeline'
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    context JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance logs
CREATE INDEX IF NOT EXISTS idx_performance_logs_operation_type ON prescription_performance_logs (operation_type);
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON prescription_performance_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_logs_success ON prescription_performance_logs (success);

-- Create search cache table for frequently searched terms
CREATE TABLE IF NOT EXISTS medicine_search_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term TEXT NOT NULL,
    normalized_term TEXT NOT NULL,
    search_results JSONB NOT NULL,
    hit_count INTEGER DEFAULT 1,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Indexes for search cache
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_cache_term ON medicine_search_cache (lower(search_term));
CREATE INDEX IF NOT EXISTS idx_search_cache_normalized ON medicine_search_cache (lower(normalized_term));
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON medicine_search_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_search_cache_hit_count ON medicine_search_cache (hit_count DESC);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_search_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM medicine_search_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update search cache hit count
CREATE OR REPLACE FUNCTION update_search_cache_hit(search_term_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE medicine_search_cache 
    SET hit_count = hit_count + 1,
        last_accessed = NOW(),
        expires_at = NOW() + INTERVAL '1 hour'
    WHERE lower(search_term) = lower(search_term_param);
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions based on popular searches
CREATE OR REPLACE FUNCTION get_search_suggestions(partial_term TEXT, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(suggestion TEXT, hit_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT search_term, medicine_search_cache.hit_count
    FROM medicine_search_cache
    WHERE lower(search_term) LIKE lower(partial_term) || '%'
       OR lower(normalized_term) LIKE lower(partial_term) || '%'
    ORDER BY medicine_search_cache.hit_count DESC, search_term
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log performance metrics
CREATE OR REPLACE FUNCTION log_prescription_performance(
    operation_type_param TEXT,
    duration_ms_param INTEGER,
    success_param BOOLEAN,
    error_message_param TEXT DEFAULT NULL,
    context_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO prescription_performance_logs (
        operation_type,
        duration_ms,
        success,
        error_message,
        context
    ) VALUES (
        operation_type_param,
        duration_ms_param,
        success_param,
        error_message_param,
        context_param
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance statistics
CREATE OR REPLACE FUNCTION get_performance_stats(
    operation_type_param TEXT DEFAULT NULL,
    hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    operation_type TEXT,
    total_operations BIGINT,
    success_rate NUMERIC,
    avg_duration_ms NUMERIC,
    min_duration_ms INTEGER,
    max_duration_ms INTEGER,
    p95_duration_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ppl.operation_type,
        COUNT(*) as total_operations,
        ROUND((COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*)), 2) as success_rate,
        ROUND(AVG(duration_ms), 2) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 2) as p95_duration_ms
    FROM prescription_performance_logs ppl
    WHERE (operation_type_param IS NULL OR ppl.operation_type = operation_type_param)
      AND timestamp >= NOW() - (hours_back || ' hours')::INTERVAL
    GROUP BY ppl.operation_type
    ORDER BY total_operations DESC;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp for cart_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for new tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_cart_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_search_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prescription_cart_logs
CREATE POLICY "Users can view own prescription logs" ON prescription_cart_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescription logs" ON prescription_cart_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for search cache (public read, authenticated write)
CREATE POLICY "Anyone can read search cache" ON medicine_search_cache
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write search cache" ON medicine_search_cache
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for performance logs (admin only)
CREATE POLICY "Admins can view performance logs" ON prescription_performance_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "System can insert performance logs" ON prescription_performance_logs
    FOR INSERT WITH CHECK (true);

-- Create materialized view for search analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS medicine_search_analytics AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(CASE WHEN activity_data->>'success' = 'true' THEN 1 ELSE 0 END) as success_rate,
    COUNT(*) FILTER (WHERE activity_type = 'add_to_cart') as cart_additions
FROM prescription_cart_logs
WHERE activity_type IN ('search', 'add_to_cart')
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_search_analytics_date ON medicine_search_analytics (date);

-- Function to refresh search analytics
CREATE OR REPLACE FUNCTION refresh_search_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY medicine_search_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup of old logs (you might want to set up a cron job for this)
-- This is just the function - actual scheduling would be done outside SQL
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS TABLE(
    performance_logs_deleted BIGINT,
    cart_logs_deleted BIGINT,
    cache_entries_deleted INTEGER
) AS $$
DECLARE
    perf_deleted BIGINT;
    cart_deleted BIGINT;
    cache_deleted INTEGER;
BEGIN
    -- Delete performance logs older than 30 days
    DELETE FROM prescription_performance_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS perf_deleted = ROW_COUNT;
    
    -- Delete cart logs older than 90 days
    DELETE FROM prescription_cart_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS cart_deleted = ROW_COUNT;
    
    -- Clean expired cache entries
    SELECT clean_expired_search_cache() INTO cache_deleted;
    
    RETURN QUERY SELECT perf_deleted, cart_deleted, cache_deleted;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for better full-text search if using PostgreSQL extensions
-- Uncomment if you have pg_trgm extension available
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_products_generic_name_trgm ON products USING gin(generic_name gin_trgm_ops);

-- Analyze tables to update statistics
ANALYZE products;
ANALYZE cart_items;
ANALYZE prescription_cart_logs;
ANALYZE prescription_performance_logs;
ANALYZE medicine_search_cache;