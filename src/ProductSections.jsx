import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from './services/productService';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import './ProductSections.css';

const ProductSections = () => {
  const navigate = useNavigate();
  const [productSections, setProductSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch products immediately wh
    // 
    //en component mounts
  
    // No need to wait for authentication
    console.log('🔍 Component mounted, fetching products immediately...')
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('📡 Starting to fetch products...')
      setLoading(true);
      setError(null);
  
      // Call ProductService to get all products with categories
      const result = await ProductService.getProducts({ limit: 50 });
      console.log('👉 Raw result from Supabase:', result);
  
      if (result.error) {
        console.error('❌ Supabase returned an error:', result.error);
        throw result.error;
      }
  
      const { data } = result;
  
      if (data && data.length > 0) {
        console.log(`✅ Successfully fetched ${data.length} products`)
        const groupedProducts = groupProductsByCategory(data);
        setProductSections(groupedProducts);
      } else {
        console.warn('⚠️ No products returned');
        setProductSections([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      setProductSections([]);
    } finally {
      setLoading(false);
      console.log('🏁 Product fetching complete');
    }
  };
  
  

  const groupProductsByCategory = (products) => {
    const categories = {};
    
    products.forEach(product => {
      const categoryName = product.categories?.name || 'Uncategorized';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      
      categories[categoryName].push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.image_url || 'https://dummyimage.com/300x300/06b6d4/ffffff&text=No+Image',
        description: product.description,
        inStock: product.in_stock
      });
    });

    // Convert to array format and limit products per category
    return Object.entries(categories).map(([title, products]) => ({
      title,
      products: products.slice(0, 6) // Max 6 products per category
    }));
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    addToCart(product);
  };

  const scrollProducts = (containerRef, direction) => {
    if (containerRef.current) {
      const grid = containerRef.current.querySelector('.product-grid');
      const firstCard = grid.querySelector('.product-card');
      const gap = parseFloat(window.getComputedStyle(grid).gap) || 32;
      const scrollAmount = firstCard.offsetWidth + gap;
      
      grid.scrollBy({ 
        left: direction === 'next' ? scrollAmount : -scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Products</h2>
        <p>{error}</p>
        <button onClick={fetchProducts} className="retry-btn">
          Try Again
        </button>
        <div className="fallback-products">
          <h3>Showing Fallback Products</h3>
          <p>Your database connection may need to be configured. Here are some sample products:</p>
          {/* Fallback to basic product display */}
          <div className="fallback-grid">
            {[
              { name: 'Paracetamol 500mg', price: 45, imageUrl: 'https://dummyimage.com/300x300/eff6ff/1e293b&text=Paracetamol+500mg' },
              { name: 'Ibuprofen 400mg', price: 60, imageUrl: 'https://dummyimage.com/300x300/fef3c7/1e293b&text=Ibuprofen+400mg' },
              { name: 'Vitamin D3 1000IU', price: 180, imageUrl: 'https://dummyimage.com/300x300/f0fdf4/1e293b&text=Vitamin+D3+1000IU' }
            ].map((product, index) => (
              <div 
                key={index} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id || 'fallback-${index}'}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">₹{product.price}</div>
                <button 
                  className="add-to-cart" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
        <p className="loading-subtitle">This may take a few seconds</p>
        <button onClick={() => setLoading(false)} className="skip-loading-btn">
          Skip Loading
        </button>
      </div>
    );
  }

  if (productSections.length === 0) {
    return (
      <div className="no-products">
        <h2>No products available</h2>
        <p>Please check back later or contact support if this persists.</p>
        <button onClick={fetchProducts} className="retry-btn">
          Refresh Products
        </button>
      </div>
    );
  }

  return (
    <>
      {productSections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="product-section">
          <div className="section-header">
            <h2 className="section-title">{section.title}</h2>
            <a href="#" className="view-all-btn">View All</a>
          </div>
          <div className="product-scroll-container">
            <button 
              className="scroll-btn prev-btn" 
              aria-label="Previous products"
              onClick={(e) => {
                const containerRef = { current: e.target.closest('.product-scroll-container') };
                scrollProducts(containerRef, 'prev');
              }}
            >
              &lsaquo;
            </button>
            <div className="product-grid">
              {section.products.map((product, productIndex) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">₹{product.price}</div>
                  <button 
                    className="add-to-cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </div>
            <button 
              className="scroll-btn next-btn" 
              aria-label="Next products"
              onClick={(e) => {
                const containerRef = { current: e.target.closest('.product-scroll-container') };
                scrollProducts(containerRef, 'next');
              }}
            >
              &rsaquo;
            </button>
          </div>
        </section>
      ))}
    </>
  );
};

export default ProductSections;
