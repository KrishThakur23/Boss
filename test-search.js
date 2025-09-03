// Simple test script to check if product search is working
import { supabase } from './src/config/supabase.js';

async function testBasicSearch() {
  console.log('🧪 Testing basic product search...');
  
  try {
    // Test 1: Simple search for "metformin"
    console.log('\n🔍 Test 1: Searching for "metformin"');
    const { data: metforminResults, error: metforminError } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .or(`name.ilike.%metformin%,generic_name.ilike.%metformin%`)
      .eq('is_active', true)
      .limit(5);
    
    if (metforminError) {
      console.error('❌ Metformin search error:', metforminError);
    } else {
      console.log('✅ Metformin search results:', metforminResults);
    }
    
    // Test 2: Check what products exist in the database
    console.log('\n🔍 Test 2: Checking all products');
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .eq('is_active', true)
      .limit(10);
    
    if (allProductsError) {
      console.error('❌ All products search error:', allProductsError);
    } else {
      console.log('✅ All products found:', allProducts);
    }
    
    // Test 3: Search for products containing "500mg"
    console.log('\n🔍 Test 3: Searching for products with "500mg"');
    const { data: dosageResults, error: dosageError } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .ilike('name', '%500mg%')
      .eq('is_active', true)
      .limit(5);
    
    if (dosageError) {
      console.error('❌ Dosage search error:', dosageError);
    } else {
      console.log('✅ Dosage search results:', dosageResults);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBasicSearch();
