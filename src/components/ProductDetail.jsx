import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, removeFromCart, items, operationLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [viewCount, setViewCount] = useState(0);

  // Helper functions for cart management
  const getCartItem = useCallback((productId) => {
    return items.find(item => item.product_id === productId);
  }, [items]);

  const getCartQuantity = useCallback((productId) => {
    const cartItem = getCartItem(productId);
    return cartItem ? cartItem.quantity : 0;
  }, [getCartItem]);

  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    const cartItem = getCartItem(productId);
    if (cartItem) {
      if (newQuantity <= 0) {
        removeFromCart(cartItem.id);
      } else {
        updateQuantity(cartItem.id, newQuantity);
      }
    }
  }, [getCartItem, updateQuantity, removeFromCart]);

  const handleAddToCart = useCallback((productToAdd) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    
    // If no product is passed, use the current product with selected quantity
    const productData = productToAdd || (product ? { ...product, quantity } : null);
    
    if (productData) {
      addToCart(productData);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  }, [addToCart, isAuthenticated, navigate, product, quantity]);

  // Horizontal Quantity Controls Component for Recommended Products
  const HorizontalQuantityControls = ({ product, quantity, isLoading }) => (
    <div className="horizontal-quantity-controls">
      <button 
        className="quantity-btn-horizontal decrease"
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateQuantity(product.id, quantity - 1);
        }}
        disabled={isLoading || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14"/>
        </svg>
      </button>
      
      <div className="quantity-display-horizontal">
        <span className="quantity-number-horizontal">{quantity}</span>
      </div>
      
      <button 
        className="quantity-btn-horizontal increase"
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateQuantity(product.id, quantity + 1);
        }}
        disabled={isLoading}
        aria-label="Increase quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
      fetchRecommendedProducts();
      incrementViewCount();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (*)
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Product not found');
        } else {
          throw error;
        }
      } else {
        setProduct(data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = useCallback(async () => {
    if (!product?.category_id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .eq('in_stock', true)
        .neq('id', productId)
        .limit(4);

      if (!error && data) {
        setRelatedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  }, [product?.category_id, productId]);

  const fetchRecommendedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('in_stock', true)
        .neq('id', productId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setRecommendedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching recommended products:', err);
    }
  };

  const incrementViewCount = async () => {
    try {
      // Simulate view count increment
      const currentViews = Math.floor(Math.random() * 1000) + 100;
      setViewCount(currentViews);
      
      // In a real app, you would increment the view count in the database
      // await supabase.rpc('increment_view_count', { product_id: productId });
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };



  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleImageZoom = () => {
    setShowImageModal(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, you would save this to the backend
  };

  // Mock reviews data (in real app, fetch from database)
  useEffect(() => {
    const fetchReviews = async () => {
      // Simulate API call delay
      setTimeout(() => {
        setReviews([
          {
            id: 1,
            user: 'John D.',
            rating: 5,
            date: '2024-01-15',
            comment: 'Excellent product! Fast delivery and great quality. The medicine worked exactly as prescribed and arrived in perfect condition.',
            verified: true,
            helpful: 12
          },
          {
            id: 2,
            user: 'Sarah M.',
            rating: 4,
            date: '2024-01-10',
            comment: 'Good medicine, works as expected. Packaging could be better but the product quality is solid.',
            verified: true,
            helpful: 8
          },
          {
            id: 3,
            user: 'Mike R.',
            rating: 5,
            date: '2024-01-05',
            comment: 'Very effective and reasonably priced. Will order again. Customer service was also very helpful.',
            verified: false,
            helpful: 5
          },
          {
            id: 4,
            user: 'Priya S.',
            rating: 4,
            date: '2024-01-02',
            comment: 'Fast delivery and authentic product. Exactly what I needed for my prescription.',
            verified: true,
            helpful: 15
          }
        ]);
      }, 500);
    };
    
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Handle multiple images (if product has image_urls array)
  const productImages = product.image_urls && Array.isArray(product.image_urls)
    ? product.image_urls
    : [product.image_url];

  return (
    <div className="product-detail-page">
      <main className="product-detail-main">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span onClick={() => navigate(`/category/${product.categories?.name?.toLowerCase().replace(/\s+/g, '-')}`)} className="breadcrumb-link">
              {product.categories?.name || 'Uncategorized'}
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="product-detail-container">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image" onClick={handleImageZoom}>
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=500&h=500&fit=crop&crop=center';
                  }}
                />
                <div className="zoom-indicator">🔍</div>
              </div>
              {productImages.length > 1 && (
                <div className="thumbnail-images">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => handleImageClick(index)}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=100&h=100&fit=crop&crop=center';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>

              <div className="product-meta">
                <div className="product-category">
                  <span className="category-tag">{product.categories?.name || 'Uncategorized'}</span>
                </div>
                <div className="product-stats">
                  <span className="view-count">👁️ {viewCount} views</span>
                  <span className="rating-summary">⭐ 4.7 (24 reviews)</span>
                </div>
              </div>

              <div className="product-price-section">
                <span className="current-price">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="original-price">₹{product.original_price}</span>
                )}
                {product.original_price && product.original_price > product.price && (
                  <span className="discount">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              {/* Product Specifications */}
              <div className="product-specs">
                {product.strength && (
                  <div className="spec-item">
                    <span className="spec-label">Strength:</span>
                    <span className="spec-value">{product.strength}</span>
                  </div>
                )}
                {product.dosage_form && (
                  <div className="spec-item">
                    <span className="spec-label">Dosage Form:</span>
                    <span className="spec-value">{product.dosage_form}</span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="spec-item">
                    <span className="spec-label">Manufacturer:</span>
                    <span className="spec-value">{product.manufacturer}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="spec-item">
                    <span className="spec-label">SKU:</span>
                    <span className="spec-value">{product.sku}</span>
                  </div>
                )}
              </div>

              {/* Big Description Section */}
              {product.big_description && (
                <div className="product-big-description">
                  <h3>Product Details</h3>
                  <div className="big-description-content">
                    {product.big_description.split('\n').map((paragraph, index) => (
                      <p key={index} className="description-paragraph">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="stock-status">
                {product.in_stock ? (
                  <span className="in-stock">✅ In Stock</span>
                ) : (
                  <span className="out-of-stock">❌ Out of Stock</span>
                )}
                {product.stock_quantity > 0 && (
                  <span className="stock-quantity">({product.stock_quantity} available)</span>
                )}
              </div>

              {/* Prescription Required */}
              {product.prescription_required && (
                <div className="prescription-notice">
                  <span className="prescription-icon">📋</span>
                  <span>Prescription Required</span>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock_quantity || 10}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (product.stock_quantity || 10)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="add-to-cart-btn"
                >
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Product Actions */}
              <div className="product-actions">
                <button 
                  className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                  onClick={handleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <span>{isWishlisted ? '❤️' : '🤍'}</span> 
                  {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
                <button className="share-btn" onClick={handleShare} aria-label="Share product">
                  <span>📤</span> Share
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span>Product added to cart successfully!</span>
            </div>
          )}

          {/* Product Details Tabs */}
          <section className="product-tabs">
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                  {product.big_description && (
                    <div className="detailed-description">
                      {product.big_description.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel">
                  <h3>Product Specifications</h3>
                  <div className="specifications-table">
                    {product.strength && (
                      <div className="spec-row">
                        <span className="spec-label">Strength</span>
                        <span className="spec-value">{product.strength}</span>
                      </div>
                    )}
                    {product.dosage_form && (
                      <div className="spec-row">
                        <span className="spec-label">Dosage Form</span>
                        <span className="spec-value">{product.dosage_form}</span>
                      </div>
                    )}
                    {product.manufacturer && (
                      <div className="spec-row">
                        <span className="spec-label">Manufacturer</span>
                        <span className="spec-value">{product.manufacturer}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="spec-row">
                        <span className="spec-label">SKU</span>
                        <span className="spec-value">{product.sku}</span>
                      </div>
                    )}
                    <div className="spec-row">
                      <span className="spec-label">Category</span>
                      <span className="spec-value">{product.categories?.name || 'Uncategorized'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Prescription Required</span>
                      <span className="spec-value">{product.prescription_required ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-panel">
                  <h3>Customer Reviews</h3>
                  <div className="reviews-summary">
                    <div className="average-rating">
                      <span className="rating-number">4.7</span>
                      <div className="stars">
                        {'★'.repeat(5)}
                      </div>
                      <span className="total-reviews">Based on {reviews.length} reviews</span>
                    </div>
                  </div>
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.user}</span>
                            <div className="review-rating">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                          <div className="review-meta">
                            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                            {review.verified && <span className="verified-badge">✓ Verified Purchase</span>}
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <div className="review-actions">
                          <button className="helpful-btn">
                            👍 Helpful ({review.helpful || 0})
                          </button>
                          <button className="report-btn">
                            🚩 Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="write-review-section">
                    <h4>Write a Review</h4>
                    <p>Share your experience with this product</p>
                    <button className="write-review-btn">
                      ✍️ Write Review
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="tab-panel">
                  <h3>Shipping & Returns</h3>
                  <div className="shipping-info">
                    <div className="shipping-section">
                      <h4>🚚 Shipping Information</h4>
                      <ul>
                        <li>Free shipping on orders above ₹500</li>
                        <li>Standard delivery: 2-5 business days</li>
                        <li>Express delivery: 1-2 business days (additional charges apply)</li>
                        <li>Same-day delivery available in select cities</li>
                      </ul>
                    </div>
                    <div className="shipping-section">
                      <h4>📦 Return Policy</h4>
                      <ul>
                        <li>30-day return policy for unopened medicines</li>
                        <li>Prescription medicines cannot be returned</li>
                        <li>Original packaging and receipt required</li>
                        <li>Refund processed within 5-7 business days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Product Recommendations */}
          <div className="product-recommendations">
            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="related-products">
                <h2>Related Products</h2>
                <div className="products-carousel">
                  <div className="related-products-grid">
                    {relatedProducts.map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="related-product-card"
                        onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      >
                        <div className="product-image-container">
                          <img
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=200&h=200&fit=crop&crop=center';
                            }}
                          />
                          <div className="quick-add-overlay">
                            <button className="quick-add-btn">Quick Add</button>
                          </div>
                        </div>
                        <div className="product-card-info">
                          <h3>{relatedProduct.name}</h3>
                          <div className="product-card-rating">
                            <span className="stars">★★★★☆</span>
                            <span className="rating-count">(12)</span>
                          </div>
                          <p className="related-product-price">₹{relatedProduct.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <section className="recommended-products">
                <div className="section-header">
                  <div className="section-title-container">
                    <h2>You Might Also Like</h2>
                    <p className="section-subtitle">Handpicked recommendations based on your interests</p>
                  </div>
                  <button className="view-all-btn" onClick={() => navigate('/products')}>
                    View All Products →
                  </button>
                </div>
                <div className="products-carousel">
                  <div className="recommended-products-grid">
                    {recommendedProducts.slice(0, 6).map((recommendedProduct, index) => {
                      const cartQuantity = getCartQuantity(recommendedProduct.id);
                      const isInCart = cartQuantity > 0;
                      const isProductLoading = operationLoading.add || operationLoading.update || operationLoading.remove;
                      
                      return (
                        <div
                          key={recommendedProduct.id}
                          className="recommended-product-card"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                        <div className="product-badge-container">
                          {index === 0 && <span className="trending-badge">🔥 Trending</span>}
                          {index === 1 && <span className="bestseller-badge">⭐ Best Seller</span>}
                          {index === 2 && <span className="new-badge">✨ New</span>}
                        </div>
                        
                        <div className="product-image-container">
                          <img
                            src={recommendedProduct.image_url}
                            alt={recommendedProduct.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=300&h=300&fit=crop&crop=center';
                            }}
                          />
                          <div className="product-actions-overlay">
                            <div className="action-buttons">
                              <button 
                                className="action-btn quick-view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/product/${recommendedProduct.id}`);
                                }}
                                title="Quick View"
                              >
                                <span className="btn-icon">👁️</span>
                                <span className="btn-text">Quick View</span>
                              </button>
                              
                              {/* Conditional rendering: Show quantity controls if in cart, otherwise show Add to Cart button */}
                              {isInCart ? (
                                <div className="action-btn quantity-control-wrapper">
                                  <HorizontalQuantityControls 
                                    product={recommendedProduct}
                                    quantity={cartQuantity}
                                    isLoading={isProductLoading}
                                  />
                                </div>
                              ) : (
                                <button 
                                  className="action-btn quick-add-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart({ ...recommendedProduct, quantity: 1 });
                                  }}
                                  disabled={isProductLoading}
                                  title="Add to Cart"
                                >
                                  <span className="btn-icon">🛒</span>
                                  <span className="btn-text">
                                    {isProductLoading ? 'Adding...' : 'Add to Cart'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                          <button 
                            className="wishlist-heart"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle wishlist toggle
                            }}
                            title="Add to Wishlist"
                          >
                            🤍
                          </button>
                        </div>
                        
                        <div className="product-card-info">
                          <div className="product-category-tag">
                            {recommendedProduct.categories?.name || 'Medicine'}
                          </div>
                          <h3 
                            className="product-name"
                            onClick={() => navigate(`/product/${recommendedProduct.id}`)}
                          >
                            {recommendedProduct.name}
                          </h3>
                          
                          <div className="product-card-rating">
                            <div className="stars-container">
                              <span className="stars">★★★★★</span>
                              <span className="rating-number">4.8</span>
                            </div>
                            <span className="rating-count">(127 reviews)</span>
                          </div>
                          
                          <div className="price-container">
                            <span className="current-price">₹{recommendedProduct.price}</span>
                            {recommendedProduct.original_price && recommendedProduct.original_price > recommendedProduct.price && (
                              <>
                                <span className="original-price">₹{recommendedProduct.original_price}</span>
                                <span className="discount-badge">
                                  {Math.round(((recommendedProduct.original_price - recommendedProduct.price) / recommendedProduct.original_price) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="product-features">
                            <span className="feature-tag">✅ In Stock</span>
                            <span className="feature-tag">🚚 Fast Delivery</span>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="recommendations-footer">
                  <p className="recommendations-note">
                    💡 These recommendations are based on similar products and customer preferences
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Image Modal */}
          {showImageModal && (
            <div className="image-modal" onClick={() => setShowImageModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowImageModal(false)}>×</button>
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="modal-image"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
