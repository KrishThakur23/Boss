import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from './services/productService';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingComponents';
import './ProductSections.css';

const ProductSections = () => {
  const navigate = useNavigate();
  const [productSections, setProductSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productLoadingStates, setProductLoadingStates] = useState(new Map());
  const { addToCart, updateQuantity, removeFromCart, items, operationLoading } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch products immediately wh
    // 
    //en component mounts
  
    // No need to wait for authentication
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Call ProductService to get all products with categories
      const result = await ProductService.getProducts({ limit: 50 });

  
      if (result.error) {
        console.error('❌ Supabase returned an error:', result.error);
        throw result.error;
      }
  
      const { data } = result;
  
      if (data && data.length > 0) {
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

  // Helper function to check if product is in cart
  const getCartItem = useCallback((productId) => {
    return items.find(item => item.product_id === productId);
  }, [items]);

  // Helper function to get quantity of product in cart
  const getCartQuantity = useCallback((productId) => {
    const cartItem = getCartItem(productId);
    return cartItem ? cartItem.quantity : 0;
  }, [getCartItem]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    
    // Set loading state for this specific product
    setProductLoadingStates(prev => new Map(prev).set(product.id, 'adding'));
    
    try {
      await addToCart(product);
    } finally {
      // Remove loading state after operation completes
      setTimeout(() => {
        setProductLoadingStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(product.id);
          return newMap;
        });
      }, 300); // Small delay for smooth UX
    }
  };

  const handleUpdateQuantity = useCallback(async (productId, newQuantity) => {
    const cartItem = getCartItem(productId);
    if (cartItem) {
      // Set loading state for this specific product
      const operationType = newQuantity <= 0 ? 'removing' : 'updating';
      setProductLoadingStates(prev => new Map(prev).set(productId, operationType));
      
      try {
        if (newQuantity <= 0) {
          await removeFromCart(cartItem.id);
        } else {
          await updateQuantity(cartItem.id, newQuantity);
        }
      } finally {
        // Remove loading state after operation completes
        setTimeout(() => {
          setProductLoadingStates(prev => {
            const newMap = new Map(prev);
            newMap.delete(productId);
            return newMap;
          });
        }, 300);
      }
    }
  }, [getCartItem, updateQuantity, removeFromCart]);

  // Quantity Controls Component
  const QuantityControls = ({ product, quantity, isLoading }) => {
    const productLoadingState = productLoadingStates.get(product.id);
    const isUpdating = productLoadingState === 'updating';
    const isRemoving = productLoadingState === 'removing';
    
    return (
      <div className="quantity-controls-card">
        <button 
          className="quantity-btn decrease"
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateQuantity(product.id, quantity - 1);
          }}
          aria-label="Decrease quantity"
          disabled={isUpdating || isRemoving}
        >
          {isRemoving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"/>
            </svg>
          )}
        </button>
        
        <div className="quantity-display">
          <span className="quantity-number">{quantity}</span>
        </div>
        
        <button 
          className="quantity-btn increase"
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateQuantity(product.id, quantity + 1);
          }}
          aria-label="Increase quantity"
          disabled={isUpdating || isRemoving}
        >
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          )}
        </button>
      </div>
    );
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
            ].map((product, index) => {
              const fallbackProduct = { ...product, id: `fallback-${index}` };
              const cartQuantity = getCartQuantity(fallbackProduct.id);
              const isInCart = cartQuantity > 0;
              const productLoadingState = productLoadingStates.get(fallbackProduct.id);
              const isProductLoading = productLoadingState === 'adding';
              
              return (
                <div 
                  key={index} 
                  className="product-card"
                  onClick={() => navigate(`/product/${fallbackProduct.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">₹{product.price}</div>
                  
                  {isInCart ? (
                    <QuantityControls 
                      product={fallbackProduct}
                      quantity={cartQuantity}
                      isLoading={isProductLoading}
                    />
                  ) : (
                    <button 
                      className="add-to-cart" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleAddToCart(fallbackProduct);
                      }}
                      disabled={isProductLoading}
                    >
                      {isProductLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Adding...</span>
                        </>
                      ) : 'Add to Cart'}
                    </button>
                  )}
                </div>
              );
            })}
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
            <div className="section-title-container">
              <h2 className="section-title">{section.title}</h2>
              {section.title === 'Essential Medicines' && (
                <p className="section-tagline">Everyday medicines you can't miss</p>
              )}
            </div>
            <button className="view-all-btn">
              <span>View All</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <div className="product-grid">
              {section.products.map((product, productIndex) => {
                const cartQuantity = getCartQuantity(product.id);
                const isInCart = cartQuantity > 0;
                const productLoadingState = productLoadingStates.get(product.id);
                const isProductLoading = productLoadingState === 'adding';
                
                return (
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
                    
                    {/* Conditional rendering: Show quantity controls if in cart, otherwise show Add to Cart button */}
                    {isInCart ? (
                      <QuantityControls 
                        product={product}
                        quantity={cartQuantity}
                        isLoading={isProductLoading}
                      />
                    ) : (
                      <button 
                        className="add-to-cart"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleAddToCart(product);
                        }}
                        disabled={!product.inStock || isProductLoading}
                      >
                        {!product.inStock ? 'Out of Stock' : 
                         isProductLoading ? (
                           <>
                             <LoadingSpinner size="sm" />
                             <span>Adding...</span>
                           </>
                         ) : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button 
              className="scroll-btn next-btn" 
              aria-label="Next products"
              onClick={(e) => {
                const containerRef = { current: e.target.closest('.product-scroll-container') };
                scrollProducts(containerRef, 'next');
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </section>
      ))}
    </>
  );
};

export default ProductSections;
