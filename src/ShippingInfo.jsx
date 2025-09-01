import React, { useEffect, useState } from 'react';
import Header from './Header';
import './ShippingInfo.css';

const ShippingInfo = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  const deliveryOptions = [
    {
      id: 'standard',
      icon: '🚚',
      title: 'Standard Delivery',
      time: '24-48 Hours',
      price: '₹49',
      description: 'Regular medicines and healthcare products',
      features: ['Order tracking', 'SMS updates', 'Contactless delivery']
    },
    {
      id: 'express',
      icon: '⚡',
      title: 'Express Delivery',
      time: '4-6 Hours',
      price: '₹99',
      description: 'Urgent medicine requirements',
      features: ['Priority processing', 'Real-time tracking', 'Dedicated support']
    },
    {
      id: 'coldchain',
      icon: '❄️',
      title: 'Cold Chain',
      time: '24-48 Hours',
      price: '₹149',
      description: 'Temperature-sensitive medicines',
      features: ['Temperature monitoring', 'Insulated packaging', 'Quality assurance']
    }
  ];

  const serviceableCities = [
    { name: 'Mumbai', zones: 15, deliveryTime: '4-24 hours' },
    { name: 'Delhi', zones: 12, deliveryTime: '4-24 hours' },
    { name: 'Bangalore', zones: 10, deliveryTime: '6-24 hours' },
    { name: 'Chennai', zones: 8, deliveryTime: '6-24 hours' },
    { name: 'Hyderabad', zones: 7, deliveryTime: '6-24 hours' },
    { name: 'Pune', zones: 6, deliveryTime: '8-24 hours' },
    { name: 'Kolkata', zones: 5, deliveryTime: '8-24 hours' },
    { name: 'Ahmedabad', zones: 4, deliveryTime: '12-24 hours' }
  ];

  const shippingPolicies = [
    {
      icon: '📦',
      title: 'Free Shipping',
      description: 'On orders above ₹499',
      details: 'Applicable on standard delivery across all serviceable areas'
    },
    {
      icon: '🔒',
      title: 'Secure Packaging',
      description: 'Tamper-proof & discreet',
      details: 'All medicines packed in sealed, unmarked packages for privacy'
    },
    {
      icon: '📱',
      title: 'Real-time Tracking',
      description: 'Track your order live',
      details: 'Get SMS and app notifications at every step of delivery'
    },
    {
      icon: '🏥',
      title: 'Prescription Verification',
      description: 'Licensed pharmacist review',
      details: 'All prescriptions verified by qualified pharmacists before dispatch'
    }
  ];

  return (
    <div className="shipping-page">
      <Header />
      <main className="shipping-main">
        {/* Hero Section */}
        <section className="shipping-hero">
          <div className="hero-background">
            <div className="hero-pattern"></div>
          </div>
          <div className="hero-content">
            <div className="hero-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5"></path>
                <path d="M8 3H3v5"></path>
                <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
                <path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.657V22"></path>
              </svg>
            </div>
            <h1>Shipping & Delivery</h1>
            <p>Fast, secure, and reliable medicine delivery across India</p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">24-48</div>
                <div className="stat-label">Hours Delivery</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Cities Covered</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.5%</div>
                <div className="stat-label">On-time Delivery</div>
              </div>
            </div>
          </div>
        </section>

        <div className="shipping-container">
          {/* Tab Navigation */}
          <div className="shipping-tabs">
            <button 
              className={`tab-button ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              <span className="tab-icon">🚚</span>
              Delivery Options
            </button>
            <button 
              className={`tab-button ${activeTab === 'coverage' ? 'active' : ''}`}
              onClick={() => setActiveTab('coverage')}
            >
              <span className="tab-icon">📍</span>
              Service Areas
            </button>
            <button 
              className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              <span className="tab-icon">📋</span>
              Shipping Policies
            </button>
          </div>

          {/* Delivery Options Tab */}
          {activeTab === 'delivery' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Choose Your Delivery Option</h2>
                <p>Select the delivery method that best suits your needs</p>
              </div>
              
              <div className="delivery-options">
                {deliveryOptions.map((option) => (
                  <div key={option.id} className="delivery-card">
                    <div className="delivery-header">
                      <div className="delivery-icon">{option.icon}</div>
                      <div className="delivery-info">
                        <h3>{option.title}</h3>
                        <div className="delivery-time">{option.time}</div>
                      </div>
                      <div className="delivery-price">{option.price}</div>
                    </div>
                    <p className="delivery-description">{option.description}</p>
                    <div className="delivery-features">
                      {option.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="delivery-note">
                <div className="note-icon">💡</div>
                <div className="note-content">
                  <h4>Important Note</h4>
                  <p>Delivery times may vary based on location, weather conditions, and product availability. Cold chain medicines require special handling and may take additional time.</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas Tab */}
          {activeTab === 'coverage' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Service Coverage Areas</h2>
                <p>We deliver medicines across major Indian cities with expanding coverage</p>
              </div>

              <div className="city-search">
                <div className="search-container">
                  <div className="search-icon">🔍</div>
                  <input
                    type="text"
                    placeholder="Search your city..."
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="city-search-input"
                  />
                </div>
              </div>

              <div className="cities-grid">
                {serviceableCities
                  .filter(city => city.name.toLowerCase().includes(selectedCity.toLowerCase()))
                  .map((city, index) => (
                    <div key={index} className="city-card">
                      <div className="city-header">
                        <h3>{city.name}</h3>
                        <div className="city-status">✅ Available</div>
                      </div>
                      <div className="city-details">
                        <div className="city-stat">
                          <span className="stat-label">Service Zones:</span>
                          <span className="stat-value">{city.zones}</span>
                        </div>
                        <div className="city-stat">
                          <span className="stat-label">Delivery Time:</span>
                          <span className="stat-value">{city.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="expansion-notice">
                <div className="expansion-icon">🚀</div>
                <div className="expansion-content">
                  <h4>Expanding Soon</h4>
                  <p>We're rapidly expanding to more cities. Don't see your city? Contact us to know when we'll be available in your area.</p>
                  <button className="expansion-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Request Coverage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Policies Tab */}
          {activeTab === 'policies' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Shipping Policies & Guidelines</h2>
                <p>Everything you need to know about our shipping process</p>
              </div>

              <div className="policies-grid">
                {shippingPolicies.map((policy, index) => (
                  <div key={index} className="policy-card">
                    <div className="policy-icon">{policy.icon}</div>
                    <h3>{policy.title}</h3>
                    <p className="policy-description">{policy.description}</p>
                    <p className="policy-details">{policy.details}</p>
                  </div>
                ))}
              </div>

              <div className="shipping-guidelines">
                <h3>Shipping Guidelines</h3>
                <div className="guidelines-grid">
                  <div className="guideline-section">
                    <h4>📋 Order Processing</h4>
                    <ul>
                      <li>Orders placed before 6 PM are processed the same day</li>
                      <li>Prescription verification may take 2-4 hours</li>
                      <li>Out-of-stock items will be notified within 2 hours</li>
                    </ul>
                  </div>
                  <div className="guideline-section">
                    <h4>📦 Packaging Standards</h4>
                    <ul>
                      <li>Tamper-evident sealing for all medicines</li>
                      <li>Temperature-controlled packaging for sensitive items</li>
                      <li>Discreet packaging to maintain privacy</li>
                    </ul>
                  </div>
                  <div className="guideline-section">
                    <h4>🚚 Delivery Process</h4>
                    <ul>
                      <li>SMS and email notifications at each step</li>
                      <li>Contactless delivery available</li>
                      <li>ID verification required for certain medicines</li>
                    </ul>
                  </div>
                  <div className="guideline-section">
                    <h4>❄️ Special Handling</h4>
                    <ul>
                      <li>Cold chain medicines in insulated boxes</li>
                      <li>Temperature monitoring throughout transit</li>
                      <li>Immediate delivery upon arrival</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="shipping-help">
            <div className="help-card">
              <h3>Need Help with Shipping?</h3>
              <p>Our customer support team is available 24/7 to assist you with any shipping-related queries.</p>
              <div className="help-actions">
                <a href="/help-center" className="help-button primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Help Center
                </a>
                <a href="tel:+911234567890" className="help-button secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call Support
                </a>
                <a href="/order-tracking" className="help-button secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 3h5v5"></path>
                    <path d="M8 3H3v5"></path>
                    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
                    <path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.657V22"></path>
                  </svg>
                  Track Order
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShippingInfo;


