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

  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState('');

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  
  // Donations state
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationsError, setDonationsError] = useState(null);
  const [showDonationsSection, setShowDonationsSection] = useState(false);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Temporary admin access for testing
  const [tempAdminAccess, setTempAdminAccess] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load products and categories on component mount
  useEffect(() => {
    console.log('🔄 Component mount useEffect triggered');
    console.log('📦 Loading products...');
    loadProducts();
    console.log('🏷️ Loading categories...');
    loadCategories();
    console.log('📋 Loading orders...');
    loadOrders();
    console.log('📋 Loading donations...');
    loadDonations();
  }, []);

  // Update dashboard stats
  useEffect(() => {
    updateDashboardStats();
  }, [products, categories, orders]);

  const updateDashboardStats = () => {
    setDashboardStats({
      totalProducts: products.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'delivered').length
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

  const loadOrders = async () => {
    try {
      console.log('🔄 loadOrders called - starting to fetch orders...');
      console.log('🔗 Supabase client:', supabase);
      console.log('🔑 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
      console.log('🔑 Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
      console.log('👤 Current user:', user);
      console.log('🔐 Is authenticated:', isAuthenticated);
      console.log('👑 Is admin:', isAdminUser);
      
      // Check what tables are available
      console.log('📋 Checking available tables...');
      try {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        console.log('📋 Available tables:', tables?.map(t => t.table_name) || 'Error fetching tables');
      } catch (tableErr) {
        console.log('📋 Could not check tables (normal for non-admin users):', tableErr.message);
      }
      
      setOrdersLoading(true);
      setOrdersError(null);
      
      // Test simple query first to check permissions
      console.log('🧪 Testing basic orders table access...');
      const { data: testData, error: testError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      console.log('🧪 Test query result:', { testData, testError });
      
      if (testError) {
        console.error('❌ Test query failed - permission issue:', testError);
        throw new Error(`Database access denied: ${testError.message}`);
      }
      
      // Check if there are any orders at all (without any filters)
      console.log('🔍 Checking total orders count...');
      const { count: totalCount, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔍 Total orders count:', { totalCount, countError });
      
      // Check table structure to see what columns exist
      console.log('🏗️ Checking orders table structure...');
      const { data: sampleOrder, error: sampleError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      console.log('🏗️ Sample order structure:', sampleOrder?.[0] || 'No orders found');
      
      // Simple query like MyOrders.jsx but without user_id filter
      console.log('📡 Making full Supabase query to orders table...');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Orders fetched successfully:', data);
      console.log('📈 Setting orders state with:', data?.length || 0, 'orders');
      setOrders(data || []);
      console.log('✅ Orders state updated');
    } catch (err) {
      console.error('❌ Error in loadOrders:', err);
      setOrdersError('Failed to load orders. Please try again.');
    } finally {
      console.log('🏁 Setting ordersLoading to false');
      setOrdersLoading(false);
    }
  };

  const loadDonations = async () => {
    try {
      setDonationsLoading(true);
      setDonationsError(null);
      
      // Load all donations with user info
      const { data, error } = await supabase
        .from('admin_donations_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If view doesn't exist, try direct table query
        console.log('View not found, trying direct table query...');
        const { data: directData, error: directError } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        setDonations(directData || []);
      } else {
        setDonations(data || []);
      }
    } catch (err) {
      console.error('Error loading donations:', err);
      setDonationsError('Failed to load donations. Please try again.');
    } finally {
      setDonationsLoading(false);
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

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryMessage('');
    setIsCategorySubmitting(true);
    
    try {
      const category = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        is_active: true
      };

      const { error } = await supabase
        .from('categories')
        .insert([category]);

      if (error) throw error;

      setCategoryMessage('✅ Category added successfully!');
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowCategoryForm(false);
      
      showToast('Category added successfully!', 'success');
      loadCategories(); // Refresh categories
    } catch (error) {
      console.error('Error creating category:', error);
      setCategoryMessage(`❌ Error: ${error.message}`);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Products in this category will be affected.')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        showToast('Category deleted successfully!', 'success');
        loadCategories();
      } catch (error) {
        showToast(`Error deleting category: ${error.message}`, 'error');
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingOrder(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      showToast(`Order status updated to ${newStatus}!`, 'success');
      loadOrders();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (error) {
      showToast(`Error updating order: ${error.message}`, 'error');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setShowOrderModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'processing': 'purple',
      'shipped': 'indigo',
      'delivered': 'green',
      'cancelled': 'red',
      'refunded': 'gray'
    };
    return statusColors[status] || 'gray';
  };

  // Donations management functions
  const updateDonationStatus = async (donationId, newStatus, adminNotes = '') => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ 
          status: newStatus, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) throw error;

      // Reload donations
      await loadDonations();
      showToast(`Donation status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast(`Failed to update status: ${error.message}`, 'error');
    }
  };

  const getDonationStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'collected': return '📦';
      case 'completed': return '🎉';
      default: return '❓';
    }
  };

  const getDonationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'blue';
      case 'rejected': return 'red';
      case 'collected': return 'purple';
      case 'completed': return 'green';
      default: return 'gray';
    }
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
                <button 
                  className="btn-primary orders-button" 
                  onClick={() => navigate('/orders')}
                >
                  <span className="btn-icon">📋</span>
                  View All Orders
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
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.pendingOrders}</div>
                <div className="stat-label">Pending Orders</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.completedOrders}</div>
                <div className="stat-label">Completed Orders</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{donations.length}</div>
                <div className="stat-label">Total Donations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{donations.filter(d => d.status === 'pending').length}</div>
                <div className="stat-label">Pending Donations</div>
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

          {/* Category Management Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Category Management</h2>
              <p className="section-subtitle">Add and manage product categories</p>
            </div>

            {/* Add Category Form */}
            {showCategoryForm && (
              <div className="admin-card">
                <form onSubmit={handleCategorySubmit} className="admin-form">
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">🏷️</div>
                      <h3>Add New Category</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-row">
                        <div className="form-field">
                          <label className="form-label">Category Name</label>
                          <input 
                            className="form-input" 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            required 
                            placeholder="e.g., Pain Relief, Vitamins, Antibiotics" 
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Description</label>
                          <textarea 
                            className="form-textarea" 
                            value={newCategoryDescription} 
                            onChange={(e) => setNewCategoryDescription(e.target.value)} 
                            rows={3} 
                            placeholder="Brief description of the category..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button 
                      className="btn-secondary" 
                      type="button" 
                      onClick={() => setShowCategoryForm(false)}
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      type="submit" 
                      disabled={isCategorySubmitting}
                    >
                      {isCategorySubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">✅</span>
                          Add Category
                        </>
                      )}
                    </button>
                  </div>

                  {categoryMessage && (
                    <div className={`status-message ${categoryMessage.startsWith('✅') ? 'success' : 'error'}`}>
                      {categoryMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="categories-section">
              <div className="categories-header">
                <div className="categories-title">
                  <h3>Current Categories</h3>
                  <span className="categories-count">({categories.length})</span>
                </div>
                <button 
                  className="btn-primary floating-action"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                >
                  <span className="btn-icon">+</span>
                  {showCategoryForm ? 'Cancel' : 'Add New Category'}
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏷️</div>
                  <h4>No categories found</h4>
                  <p>Add your first category to organize your products!</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowCategoryForm(true)}
                  >
                    <span className="btn-icon">+</span>
                    Add First Category
                  </button>
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div key={category.id} className="category-card">
                      <div className="category-info">
                        <h4 className="category-name">{category.name}</h4>
                        <p className="category-description">{category.description || 'No description'}</p>
                        <div className="category-meta">
                          <span className="category-status">
                            {category.is_active ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="category-actions">
                        <button 
                          className="btn-danger"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <span className="btn-icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>









          {/* Orders Management Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Orders Management</h2>
              <p className="section-subtitle">View and manage all orders across all accounts</p>
              <button 
                onClick={loadOrders}
                className="btn-secondary"
                style={{marginTop: '0.5rem'}}
              >
                🔄 Reload Orders Manually
              </button>
            </div>

            {ordersLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="error-state">
                <div className="error-icon">❌</div>
                <h4>Error loading orders</h4>
                <p>{ordersError}</p>
                <button 
                  onClick={loadOrders}
                  className="btn-primary"
                  style={{marginTop: '1rem'}}
                >
                  🔄 Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No orders found</h4>
                <p>Orders will appear here once customers start placing them!</p>
              </div>
            ) : (
              <div className="orders-container">
                <div className="orders-header">
                  <h3>All Orders ({orders.length})</h3>
                </div>
                <div className="orders-grid">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4 className="order-number">#{order.order_number}</h4>
                          <p className="order-customer">
                            {order.shipping_address?.name || 'Unknown Customer'}
                          </p>
                          <p className="order-date">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="order-status">
                          <span 
                            className={`status-badge status-${getStatusColor(order.status)}`}
                            onClick={() => openOrderModal(order)}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-summary">
                        <div className="order-summary-row">
                          <span className="summary-label">Payment Status:</span>
                          <span className={`status-badge status-${order.payment_status === 'paid' ? 'green' : 'orange'}`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                        <div className="order-summary-row">
                          <span className="summary-label">Payment Method:</span>
                          <span className="summary-value">{order.payment_method || 'Not specified'}</span>
                        </div>
                        <div className="order-summary-row">
                          <span className="summary-label">Location:</span>
                          <span className="summary-value">
                            {order.shipping_address?.city}, {order.shipping_address?.state}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-total">
                          <strong>Total: {formatCurrency(order.final_amount)}</strong>
                          {order.discount_amount > 0 && (
                            <span className="discount-info">
                              (Saved: {formatCurrency(order.discount_amount)})
                            </span>
                          )}
                        </div>
                        <div className="order-actions">
                          <button 
                            className="btn-primary btn-sm"
                            onClick={() => openOrderModal(order)}
                          >
                            <span className="btn-icon">👁️</span>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Donations Management Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Donations Management</h2>
              <p className="section-subtitle">Manage medicine donations and schedule pickups</p>
              <button 
                onClick={loadDonations}
                className="btn-secondary"
                style={{marginTop: '0.5rem'}}
              >
                🔄 Reload Donations
              </button>
            </div>

            {donationsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading donations...</p>
              </div>
            ) : donationsError ? (
              <div className="error-state">
                <div className="error-icon">❌</div>
                <h4>Error loading donations</h4>
                <p>{donationsError}</p>
                <button 
                  onClick={loadDonations}
                  className="btn-primary"
                  style={{marginTop: '1rem'}}
                >
                  🔄 Try Again
                </button>
              </div>
            ) : donations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No donations found</h4>
                <p>Donations will appear here once users start submitting them!</p>
              </div>
            ) : (
              <div className="donations-container">
                <div className="donations-header">
                  <h3>All Donations ({donations.length})</h3>
                </div>
                <div className="donations-grid">
                  {donations.map((donation) => (
                    <div key={donation.id} className="donation-card">
                      <div className="donation-header">
                        <div className="donation-info">
                          <h4 className="donor-name">{donation.donor_name}</h4>
                          <p className="donor-email">{donation.donor_email}</p>
                          <p className="donor-phone">{donation.donor_phone}</p>
                        </div>
                        <div className="donation-status">
                          <span 
                            className={`status-badge status-${getDonationStatusColor(donation.status)}`}
                          >
                            {getDonationStatusIcon(donation.status)} {donation.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="donation-summary">
                        <div className="donation-summary-row">
                          <span className="summary-label">Address:</span>
                          <span className="summary-value">{donation.donor_address}</span>
                        </div>
                        <div className="donation-summary-row">
                          <span className="summary-label">Total Items:</span>
                          <span className="summary-value">{donation.total_items}</span>
                        </div>
                        <div className="donation-summary-row">
                          <span className="summary-label">Submitted:</span>
                          <span className="summary-value">
                            {new Date(donation.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {donation.message && (
                          <div className="donation-summary-row">
                            <span className="summary-label">Message:</span>
                            <span className="summary-value">{donation.message}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="donation-footer">
                        <div className="donation-actions">
                          {donation.status === 'pending' && (
                            <>
                              <button 
                                className="btn-primary btn-sm"
                                onClick={() => updateDonationStatus(donation.id, 'approved')}
                              >
                                <span className="btn-icon">✅</span>
                                Approve
                              </button>
                              <button 
                                className="btn-secondary btn-sm"
                                onClick={() => {
                                  const notes = prompt('Enter rejection reason:');
                                  if (notes !== null) {
                                    updateDonationStatus(donation.id, 'rejected', notes);
                                  }
                                }}
                              >
                                <span className="btn-icon">❌</span>
                                Reject
                              </button>
                            </>
                          )}
                          {donation.status === 'approved' && (
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => updateDonationStatus(donation.id, 'collected')}
                            >
                              <span className="btn-icon">📦</span>
                              Mark Collected
                            </button>
                          )}
                          {donation.status === 'collected' && (
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => updateDonationStatus(donation.id, 'completed')}
                            >
                              <span className="btn-icon">🎉</span>
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.order_number}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowOrderModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="order-detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedOrder.shipping_address?.name || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {selectedOrder.shipping_address?.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Order Date:</span>
                    <span className="detail-value">
                      {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h4>Order Summary</h4>
                  <div className="detail-row">
                    <span className="detail-label">Order Number:</span>
                    <span className="detail-value">#{selectedOrder.order_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge status-${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge status-${selectedOrder.payment_status === 'paid' ? 'green' : 'orange'}`}>
                        {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedOrder.payment_method || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">{formatCurrency(selectedOrder.final_amount)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Discount:</span>
                      <span className="detail-value discount-amount">-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shipping-address-section">
                <h4>Shipping Address</h4>
                <div className="address-details">
                  <div className="address-line">
                    <strong>{selectedOrder.shipping_address?.name}</strong>
                  </div>
                  <div className="address-line">
                    {selectedOrder.shipping_address?.address_line1}
                    {selectedOrder.shipping_address?.address_line2 && (
                      <span>, {selectedOrder.shipping_address.address_line2}</span>
                    )}
                  </div>
                  <div className="address-line">
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}
                  </div>
                  <div className="address-line">
                    Phone: {selectedOrder.shipping_address?.phone}
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="order-notes-section">
                  <h4>Order Notes</h4>
                  <div className="notes-content">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              <div className="order-actions-section">
                <h4>Update Order Status</h4>
                <div className="status-update-form">
                  <select 
                    value={orderStatus} 
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button 
                    className="btn-primary"
                    onClick={() => updateOrderStatus(selectedOrder.id, orderStatus)}
                    disabled={isUpdatingOrder || orderStatus === selectedOrder.status}
                  >
                    {isUpdatingOrder ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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


