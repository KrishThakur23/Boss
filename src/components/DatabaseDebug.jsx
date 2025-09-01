import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ProductService from '../services/productService';
import MedicineService from '../services/medicineService';

const DatabaseDebug = () => {
  const [results, setResults] = useState({
    products: { data: null, error: null, loading: true },
    medicines: { data: null, error: null, loading: true }
  });

  useEffect(() => {
    checkBothTables();
  }, []);

  const checkBothTables = async () => {
    // Check products table
    try {
      const productResult = await ProductService.getProducts({ limit: 10 });
      setResults(prev => ({
        ...prev,
        products: { 
          data: productResult.data, 
          error: productResult.error, 
          loading: false 
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        products: { 
          data: null, 
          error: error.message, 
          loading: false 
        }
      }));
    }

    // Check medicines table
    try {
      const medicineResult = await MedicineService.getAllMedicines();
      setResults(prev => ({
        ...prev,
        medicines: { 
          data: medicineResult.data, 
          error: medicineResult.error, 
          loading: false 
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        medicines: { 
          data: null, 
          error: error.message, 
          loading: false 
        }
      }));
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '20px' }}>
      <h2>🔍 Database Debug Info</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Products Table:</h3>
        {results.products.loading ? (
          <p>Loading...</p>
        ) : results.products.error ? (
          <p style={{ color: 'red' }}>Error: {results.products.error}</p>
        ) : (
          <div>
            <p style={{ color: 'green' }}>✅ Found {results.products.data?.length || 0} products</p>
            {results.products.data?.slice(0, 3).map(product => (
              <div key={product.id} style={{ marginLeft: '20px' }}>
                • {product.name} - ₹{product.price}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>Medicines Table:</h3>
        {results.medicines.loading ? (
          <p>Loading...</p>
        ) : results.medicines.error ? (
          <p style={{ color: 'red' }}>Error: {results.medicines.error}</p>
        ) : (
          <div>
            <p style={{ color: 'green' }}>✅ Found {results.medicines.data?.length || 0} medicines</p>
            {results.medicines.data?.slice(0, 3).map(medicine => (
              <div key={medicine.id} style={{ marginLeft: '20px' }}>
                • {medicine.name} - ₹{medicine.price}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={checkBothTables} style={{ marginTop: '10px' }}>
        🔄 Refresh Check
      </button>
    </div>
  );
};

export default DatabaseDebug;