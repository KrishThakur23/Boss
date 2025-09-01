import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  // You can change this email to your own admin email
  const ADMIN_EMAIL = 'bhalackdhebil@gmail.com'; // Change this to your email
  const isAdminUser = user?.email ? user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : false;

  // Product state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [categories, setCategories] = useState([]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalCategories: 0
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Update dashboard stats
  useEffect(() => {
    updateDashboardStats();
  }, [products, categories]);

  const updateDashboardStats = () => {
    setDashboardStats({
      totalProducts: products.length,
      totalCategories: categories.length
    });
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };



  useEffect(() => {
    // Only redirect if we're done loading
    if (!loading) {
      if (!isAuthenticated || !isAdminUser) {
        navigate('/');
      }
    }
  }, [loading, isAuthenticated, isAdminUser, navigate]);

  // Product handlers
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductMessage('');
    setIsProductSubmitting(true);
    
    try {
      let imageUrl = null;
      if (productImage) {
        // For now, use a placeholder image URL
        // In production, you'd want to implement proper image upload
        imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
      }

      // Find category ID from selected category name
      const selectedCategory = categories.find(cat => cat.name === productCategory);
      const categoryId = selectedCategory ? selectedCategory.id : null;

      const product = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        category_id: categoryId,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center',
        in_stock: true,
        is_active: true
      };

      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) throw error;

      setProductMessage('✅ Product added successfully!');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductCategory('');
      setProductImage(null);
      setShowProductForm(false);
      
      showToast('Product added successfully!', 'success');
      loadProducts();
    } catch (error) {
      setProductMessage(`❌ Error: ${error.message}`);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        showToast('Product deleted successfully!', 'success');
        loadProducts();
      } catch (error) {
        showToast(`Error deleting product: ${error.message}`, 'error');
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logging
  console.log('AdminDashboard - Auth State:', { 
    loading, 
    isAuthenticated, 
    userEmail: user?.email,
    isAdminUser,
    adminEmail: ADMIN_EMAIL
  });
  
  // Show current user email for debugging
  console.log('🔍 Current user email:', user?.email);
  console.log('🔍 Admin email:', ADMIN_EMAIL);
  console.log('🔍 Is admin?', isAdminUser);

  if (loading) {
    return (
      <div className="admin-page">
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card">
              <div className="loading-state">
                <div className="loading-spinner-large"></div>
                <h3>Loading Dashboard...</h3>
                <p>Please wait while we load your admin dashboard.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Checking authentication status...
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // For development/testing - allow access if user is authenticated
  // In production, you should have proper admin role management
  const allowAccess = isAuthenticated && (isAdminUser || process.env.NODE_ENV === 'development');
  
  // Temporary admin access for testing
  const [tempAdminAccess, setTempAdminAccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card unauthorized-card">
              <div className="unauthorized-content">
                <div className="unauthorized-icon">🔐</div>
                <h2>Authentication Required</h2>
                <p>Please sign in to access the admin dashboard.</p>
                <button className="btn-primary" onClick={() => navigate('/signin')}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!allowAccess && !tempAdminAccess) {
    return (
      <div className="admin-page">
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card unauthorized-card">
              <div className="unauthorized-content">
                <div className="unauthorized-icon">🚫</div>
                <h2>Access Denied</h2>
                <p>You are not authorized to view this page.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Admin access required. Contact administrator if you believe this is an error.
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => navigate('/')}>
                    Return to Home
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setTempAdminAccess(true)}
                    style={{ fontSize: '0.875rem' }}
                  >
                    🔓 Demo Access (Testing)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : ''}`}>
      <main className="admin-main">
        <div className="admin-container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="dashboard-title">Product Management Dashboard</h1>
                <p className="dashboard-subtitle">Add and manage products in your store</p>
              </div>
              <div className="header-actions">
                <button 
                  className="dark-mode-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                  <span className="btn-icon">👁️</span>
                  View Site
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.totalProducts}</div>
                <div className="stat-label">Total Products</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.totalCategories}</div>
                <div className="stat-label">Total Categories</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Product Management Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Product Management</h2>
              <p className="section-subtitle">Add and manage products in your store</p>
            </div>

            {/* Add Product Form */}
            {showProductForm && (
              <div className="admin-card">
                <form onSubmit={handleProductSubmit} className="admin-form">
                  {/* Basic Info Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">📦</div>
                      <h3>Product Information</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-row">
                        <div className="form-field">
                          <label className="form-label">Product Name</label>
                          <input 
                            className="form-input" 
                            value={productName} 
                            onChange={(e) => setProductName(e.target.value)} 
                            required 
                            placeholder="e.g., Paracetamol 500mg" 
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Description</label>
                          <textarea 
                            className="form-textarea" 
                            value={productDescription} 
                            onChange={(e) => setProductDescription(e.target.value)} 
                            rows={4} 
                            placeholder="Detailed description of the product..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Category Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">💰</div>
                      <h3>Pricing & Category</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-row two-col">
                        <div className="form-field">
                          <label className="form-label">Price (₹)</label>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={productPrice} 
                            onChange={(e) => setProductPrice(e.target.value)} 
                            required 
                            placeholder="e.g., 25.00" 
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Category</label>
                          <select 
                            className="form-input" 
                            value={productCategory} 
                            onChange={(e) => setProductCategory(e.target.value)} 
                            required
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">🖼️</div>
                      <h3>Product Image</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-field">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProductImageChange}
                          className="file-input-simple"
                        />
                        <div className="helper-text">Upload a clear image of the product (optional)</div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button 
                      className="btn-secondary" 
                      type="button" 
                      onClick={() => setShowProductForm(false)}
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      type="submit" 
                      disabled={isProductSubmitting}
                    >
                      {isProductSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">✅</span>
                          Add Product
                        </>
                      )}
                    </button>
                  </div>

                  {productMessage && (
                    <div className={`status-message ${productMessage.startsWith('✅') ? 'success' : 'error'}`}>
                      {productMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="products-section">
              <div className="products-header">
                <div className="products-title">
                  <h3>Current Products</h3>
                  <span className="products-count">({filteredProducts.length})</span>
                </div>
                <button 
                  className="btn-primary floating-action"
                  onClick={() => setShowProductForm(!showProductForm)}
                >
                  <span className="btn-icon">+</span>
                  {showProductForm ? 'Cancel' : 'Add New Product'}
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h4>No products found</h4>
                  <p>{searchTerm ? 'Try adjusting your search terms' : 'Add your first product to get started!'}</p>
                  {!searchTerm && (
                    <button 
                      className="btn-primary"
                      onClick={() => setShowProductForm(true)}
                    >
                      <span className="btn-icon">+</span>
                      Add First Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="product-card"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-price">₹{product.price}</p>
                        <p className="product-description">{product.description}</p>
                        {product.categories?.name && (
                          <p className="product-category">
                            <strong>Category:</strong> {product.categories.name}
                          </p>
                        )}
                        <div className="product-actions">
                          <button 
                            className="btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduct(product.id);
                            }}
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button 
            className="toast-close"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


