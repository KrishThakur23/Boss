import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { supabase } from './config/supabase';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState(null);
  const [categoryIdsFilter, setCategoryIdsFilter] = useState([]);
  const [keywordsFilter, setKeywordsFilter] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

      // Load products and categories on component mount
  useEffect(() => {
    // Handle URL parameters for filtering
    const urlCategory = searchParams.get('category');
    const urlDisease = searchParams.get('disease');
    const urlCategoryIds = searchParams.get('categoryIds');
    const urlKeywords = searchParams.get('keywords');
    const urlSearch = searchParams.get('search');
    
    if (urlCategory) {
      // Map URL category to actual category name
      if (urlCategory === 'medicines') {
        setSelectedCategory('Medicine');
      } else if (urlCategory === 'healthcare') {
        setSelectedCategory('Healthcare');
      } else {
        setSelectedCategory(urlCategory);
      }
    }
    if (urlDisease) {
      setDiseaseFilter(urlDisease);
    }
    if (urlCategoryIds) {
      setCategoryIdsFilter(urlCategoryIds.split(','));
    }
    if (urlKeywords) {
      setKeywordsFilter(urlKeywords.split(','));
    }
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000); // 10 second timeout



    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*");

        if (error) {
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (err) {
        setCategories([]);
      }
    };

    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            categories(name, description)
          `);
    
        if (error) {
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };
    
    loadCategories();
    loadProducts();
    
    // Load cart if user is authenticated
    if (isAuthenticated) {
  
    }
    
    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [isAuthenticated]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    try {
      await addToCart(product);
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart');
    }
  };

  // Helper functions
  const getProductCategoryName = (product) => {
    return product.categories?.name || 'Uncategorized';
  };

  // Helper function to get product image
  const getProductImage = (product) => {
    return product.image_url || '';
  };

  const getCategoryName = (categoryId) => {
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Uncategorized';
    }
    return 'Uncategorized';
  };

  // Filter products based on category, search, and disease filters
  const filteredProducts = products.filter(product => {
    // Basic category and search filtering
    let matchesCategory = true;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'Medicine') {
      // For Medicine category, show all products (no category restriction)
      matchesCategory = true;
    } else {
      matchesCategory = getProductCategoryName(product) === selectedCategory;
    }
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Disease-based filtering
    let matchesDisease = true;
    if (diseaseFilter || categoryIdsFilter.length > 0 || keywordsFilter.length > 0) {
      // Check if product matches category IDs
      if (categoryIdsFilter.length > 0) {
        matchesDisease = categoryIdsFilter.includes(product.category_id);
      }
      
      // Check if product matches keywords
      if (keywordsFilter.length > 0 && matchesDisease) {
        const productText = `${product.name} ${product.description}`.toLowerCase();
        matchesDisease = keywordsFilter.some(keyword => 
          productText.includes(keyword.toLowerCase())
        );
      }
    }
    
    return matchesCategory && matchesSearch && matchesDisease;
  });

  // Clear disease filters
  const clearDiseaseFilters = () => {
    setDiseaseFilter(null);
    setCategoryIdsFilter([]);
    setKeywordsFilter([]);
    // Update URL to remove disease parameters
    const params = new URLSearchParams(searchParams);
    params.delete('disease');
    params.delete('categoryIds');
    params.delete('keywords');
    navigate(`/products?${params.toString()}`);
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Enhanced Hero Section */}
      <div className="products-hero">
        <div className="hero-content">
          <h1>Our Products</h1>
          <p>Discover our comprehensive range of healthcare products and medicines</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{products.length}</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">{products.filter(p => p.in_stock).length}</span>
              <span className="stat-label">In Stock</span>
            </div>
          </div>
        </div>
      </div>

      <div className="products-container">
        {/* Enhanced Search and Controls */}
        <div className="products-controls">
          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products, medicines, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

                     <div className="controls-row">
             <button 
               className="filter-toggle"
               onClick={() => setShowFilters(!showFilters)}
             >
               <span>🔧</span> Filters
             </button>
             
             {isAuthenticated && (
               <button 
                 className="refresh-cart-btn"
                 onClick={() => {
                   console.log('🔄 Manually refreshing cart...');
                   refreshCart();
                 }}
                 style={{
                   background: '#0891b2',
                   color: 'white',
                   border: 'none',
                   padding: '8px 16px',
                   borderRadius: '8px',
                   cursor: 'pointer',
                   fontSize: '0.8rem'
                 }}
               >
                 🔄 Refresh Cart
               </button>
             )}
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>

            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        <div className={`products-filters ${showFilters ? 'show' : ''}`}>
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products ({products.length})
              </button>
              {categories.map(category => {
                const count = products.filter(p => getProductCategoryName(p) === category.name).length;
                return (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-filter">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="price-slider"
              />
              <div className="price-display">
                ₹0 - ₹{priceRange[1]}
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Availability</h3>
            <div className="availability-filters">
              <label className="filter-checkbox">
                <input type="checkbox" /> In Stock Only
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" /> On Sale
              </label>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(diseaseFilter || categoryIdsFilter.length > 0 || keywordsFilter.length > 0) && (
          <div className="filter-summary">
            <div className="active-filters">
              {diseaseFilter && (
                <span className="filter-tag">
                  Disease: {diseaseFilter}
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
              {categoryIdsFilter.length > 0 && (
                <span className="filter-tag">
                  Categories: {categoryIdsFilter.length} selected
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
              {keywordsFilter.length > 0 && (
                <span className="filter-tag">
                  Keywords: {keywordsFilter.join(', ')}
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
            </div>
            <button onClick={clearDiseaseFilters} className="clear-all-filters-btn">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-count">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {/* Enhanced Products Grid */}
        <div className={`products-grid ${viewMode}`}>
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  clearDiseaseFilters();
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredProducts
              .sort((a, b) => {
                switch (sortBy) {
                  case 'price-low':
                    return a.price - b.price;
                  case 'price-high':
                    return b.price - a.price;
                  case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                  default:
                    return a.name.localeCompare(b.name);
                }
              })
              .filter(product => product.price <= priceRange[1])
              .map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-image">
                  {getProductImage(product) ? (
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      onError={(e) => {
                        console.log('Image failed to load:', getProductImage(product));
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', getProductImage(product));
                      }}
                    />
                  ) : null}
                  <div className="placeholder-image" style={{ display: getProductImage(product) ? 'none' : 'flex' }}>
                    <span>💊</span>
                  </div>
                  
                  <div className="product-badges">
                    <span className="category-badge">{getProductCategoryName(product)}</span>
                    {!product.in_stock && <span className="stock-badge out-of-stock">Out of Stock</span>}
                    {product.prescription_required && <span className="prescription-badge">Rx</span>}
                  </div>

                  <div className="product-actions-overlay">
                    <button 
                      className="quick-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      👁️ Quick View
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  {product.manufacturer && (
                    <div className="product-manufacturer">
                      by {product.manufacturer}
                    </div>
                  )}

                  <div className="product-rating">
                    <div className="stars">
                      {'★'.repeat(5)}
                    </div>
                    <span className="rating-text">(4.5) 120 reviews</span>
                  </div>
                  
                  <div className="product-meta">
                    <div className="price-section">
                      <span className="product-price">₹{product.price}</span>
                      {product.original_price && product.original_price > product.price && (
                        <>
                          <span className="original-price">₹{product.original_price}</span>
                          <span className="discount-badge">
                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="stock-info">
                      {product.in_stock ? (
                        <span className="in-stock">✅ In Stock</span>
                      ) : (
                        <span className="out-of-stock">❌ Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="product-buttons">
                    <button
                      className={`add-to-cart-btn ${!product.in_stock ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.in_stock}
                    >
                      {product.in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <button 
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist functionality
                      }}
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


      </div>
    </div>
  );
};

export default Products;

