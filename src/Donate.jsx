import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import Header from './Header';
import './Donate.css';

const Donate = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [donationItems, setDonationItems] = useState([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  });
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories(name, description)
          `)
          .eq('in_stock', true); // Only show available products

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        alert('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get category name from product
  const getProductCategoryName = (product) => {
    return product.categories?.name || 'Uncategorized';
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      getProductCategoryName(product) === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Add medicine to donation list
  const addToDonation = (product) => {
    const existingItem = donationItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setDonationItems(donationItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setDonationItems([...donationItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove medicine from donation list
  const removeFromDonation = (productId) => {
    setDonationItems(donationItems.filter(item => item.id !== productId));
  };

  // Update quantity in donation list
  const updateDonationQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromDonation(productId);
      return;
    }
    
    setDonationItems(donationItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Handle donor info change
  const handleDonorInfoChange = (field, value) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
  };

  // Submit donation
  const submitDonation = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (donationItems.length === 0) {
      alert('Please select at least one medicine to donate.');
      return;
    }

    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone || !donorInfo.address) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      // Create donation record
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          donor_name: donorInfo.name,
          donor_email: donorInfo.email,
          donor_phone: donorInfo.phone,
          donor_address: donorInfo.address,
          message: donorInfo.message,
          status: 'pending',
          total_items: donationItems.reduce((sum, item) => sum + item.quantity, 0),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Create donation items
      const donationItemsData = donationItems.map(item => ({
        donation_id: donationData.id,
        product_id: item.id,
        quantity: item.quantity,
        product_name: item.name,
        product_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('donation_items')
        .insert(donationItemsData);

      if (itemsError) throw itemsError;

      // Reset form
      setDonationItems([]);
      setDonorInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        message: ''
      });
      setShowDonationForm(false);

      alert('Thank you for your donation! We will contact you soon to arrange pickup.');
    } catch (error) {
      alert('Failed to submit donation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="donate">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donate">
      <Header />
      <main className="donate-main">
        {/* Hero Section */}
        <section className="donate-hero">
          <div className="container">
            <h1>Donate Medicines</h1>
            <p>Help your community by donating unused medicines. Your generosity can save lives and make healthcare accessible to those in need.</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Lives Helped</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Medicines Donated</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Active Donors</span>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Cart */}
        {donationItems.length > 0 && (
          <section className="donation-cart">
            <div className="container">
              <div className="cart-header">
                <h3>Selected Medicines for Donation ({donationItems.length})</h3>
                <button 
                  className="proceed-btn"
                  onClick={() => setShowDonationForm(true)}
                >
                  Proceed to Donate
                </button>
              </div>
              <div className="cart-items">
                {donationItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                    </div>
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateDonationQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateDonationQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromDonation(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Medicine Selection */}
        <section className="medicine-selection">
          <div className="container">
            <h2>Select Medicines to Donate</h2>
            
            {/* Filters */}
            <div className="selection-filters">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-filters">
                <button
                  className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>No medicines found matching your criteria.</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-image">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      ) : (
                        <div className="placeholder-image">
                          <span>💊</span>
                        </div>
                      )}
                      <div className="product-category">
                        {getProductCategoryName(product)}
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      
                      <div className="product-meta">
                        <span className="product-price">₹{product.price}</span>
                      </div>

                      <button
                        className="donate-btn"
                        onClick={() => addToDonation(product)}
                      >
                        Add to Donation
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="modal-overlay">
            <div className="donation-form-modal">
              <div className="modal-header">
                <h3>Complete Your Donation</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowDonationForm(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="donation-summary">
                  <h4>Donation Summary</h4>
                  <p>Total Items: {donationItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  <div className="summary-items">
                    {donationItems.map(item => (
                      <div key={item.id} className="summary-item">
                        <span>{item.name}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form className="donor-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={donorInfo.name}
                      onChange={(e) => handleDonorInfoChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => handleDonorInfoChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={donorInfo.phone}
                      onChange={(e) => handleDonorInfoChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Pickup Address *</label>
                    <textarea
                      value={donorInfo.address}
                      onChange={(e) => handleDonorInfoChange('address', e.target.value)}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Message (Optional)</label>
                    <textarea
                      value={donorInfo.message}
                      onChange={(e) => handleDonorInfoChange('message', e.target.value)}
                      rows="3"
                      placeholder="Any special instructions or message..."
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowDonationForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      className="submit-btn"
                      onClick={submitDonation}
                    >
                      Submit Donation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <section className="how-it-works">
          <div className="container">
            <h2>How Medicine Donation Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-icon">1</div>
                <h3>Select Medicines</h3>
                <p>Choose the medicines you want to donate from our available list</p>
              </div>
              <div className="step">
                <div className="step-icon">2</div>
                <h3>Fill Details</h3>
                <p>Provide your contact information and pickup address</p>
              </div>
              <div className="step">
                <div className="step-icon">3</div>
                <h3>We Collect</h3>
                <p>Our team will contact you to arrange pickup at your convenience</p>
              </div>
              <div className="step">
                <div className="step-icon">4</div>
                <h3>Help Others</h3>
                <p>Your donated medicines will help those who need them most</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Donate;