import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import ProductSearchService from '../services/productSearchService';

const DatabaseDebug = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState(null);

  const testSimpleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log('🧪 Testing simple search for:', searchTerm);
      
      // Test 1: Direct Supabase query
      const { data: directResults, error: directError } = await supabase
        .from('products')
        .select('id, name, price, in_stock, generic_name')
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(5);
      
      if (directError) {
        console.error('❌ Direct Supabase query failed:', directError);
        setError(`Direct query failed: ${directError.message}`);
        return;
      }
      
      console.log('✅ Direct Supabase results:', directResults);
      
      // Test 2: ProductSearchService search
      const { data: serviceResults, error: serviceError } = await ProductSearchService.searchProductsByName(searchTerm);
      
      if (serviceError) {
        console.error('❌ ProductSearchService failed:', serviceError);
        setError(`Service search failed: ${serviceError.message}`);
        return;
      }
      
      console.log('✅ ProductSearchService results:', serviceResults);
      
      // Test 3: Check all products
      const { data: allProductsData, error: allProductsError } = await supabase
        .from('products')
        .select('id, name, price, in_stock')
        .eq('is_active', true)
        .limit(10);
      
      if (allProductsError) {
        console.error('❌ Failed to get all products:', allProductsError);
      } else {
        console.log('✅ All products sample:', allProductsData);
        setAllProducts(allProductsData);
      }
      
      setResults({
        direct: directResults,
        service: serviceResults,
        searchTerm
      });
      
    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMetforminSearch = () => {
    setSearchTerm('Metformin');
    setTimeout(() => testSimpleSearch(), 100);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 Database Search Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term..."
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button 
          onClick={testSimpleSearch}
          disabled={loading || !searchTerm}
          style={{ padding: '8px 16px', marginRight: '10px' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button 
          onClick={testMetforminSearch}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none' }}
        >
          Test Metformin
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          ❌ Error: {error}
        </div>
      )}

      {results && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Search Results for "{results.searchTerm}"</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Direct Supabase Query Results ({results.direct?.length || 0}):</h4>
            {results.direct && results.direct.length > 0 ? (
              <ul>
                {results.direct.map(product => (
                  <li key={product.id}>
                    {product.name} - ${product.price} - {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    {product.generic_name && ` (Generic: ${product.generic_name})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results found</p>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>ProductSearchService Results ({results.service?.length || 0}):</h4>
            {results.service && results.service.length > 0 ? (
              <ul>
                {results.service.map(product => (
                  <li key={product.id}>
                    {product.name} - ${product.price} - {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    {product.generic_name && ` (Generic: ${product.generic_name})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results found</p>
            )}
          </div>
        </div>
      )}

      {allProducts && (
        <div>
          <h3>Sample of All Products ({allProducts.length}):</h3>
          <ul>
            {allProducts.map(product => (
              <li key={product.id}>
                {product.name} - ${product.price} - {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DatabaseDebug;