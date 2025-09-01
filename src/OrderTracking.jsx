import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import OrderService from './services/orders';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  // Check for order_id in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      // Automatically track the order
      setTimeout(() => {
        trackOrderWithId(orderIdFromUrl);
      }, 100);
    }
  }, [location.search]);

  const trackOrderWithId = async (id) => {
    setLoading(true);
    setError('');
    setOrderData(null);

    // Simulate API call with mock data
    setTimeout(() => {
      const order = mockOrderData[id];
      if (order) {
        setOrderData(order);
        setError('');
      } else {
        setError('Order not found. Please check your Order ID and try again.');
        setOrderData(null);
      }
      setLoading(false);
    }, 1500);
  };

  // Mock order data for demonstration
  const mockOrderData = {
    'ORD123456': {
      id: 'ORD123456',
      status: 'in_transit',
      orderDate: '2024-01-15',
      estimatedDelivery: '2024-01-18',
      currentLocation: 'Mumbai Distribution Center',
      items: [
        { name: 'Paracetamol 500mg', quantity: 2, price: 50 },
        { name: 'Vitamin C 1000mg', quantity: 1, price: 120 }
      ],
      total: 220,
      shippingAddress: '123 Main Street, Andheri West, Mumbai - 400058',
      trackingSteps: [
        { status: 'order_placed', label: 'Order Placed', date: '2024-01-15', time: '10:30 AM', completed: true },
        { status: 'confirmed', label: 'Order Confirmed', date: '2024-01-15', time: '11:15 AM', completed: true },
        { status: 'packed', label: 'Packed', date: '2024-01-16', time: '09:45 AM', completed: true },
        { status: 'in_transit', label: 'In Transit', date: '2024-01-17', time: '08:20 AM', completed: true, current: true },
        { status: 'out_for_delivery', label: 'Out for Delivery', date: '2024-01-18', time: 'Expected', completed: false },
        { status: 'delivered', label: 'Delivered', date: '2024-01-18', time: 'Expected', completed: false }
      ]
    },
    'ORD789012': {
      id: 'ORD789012',
      status: 'delivered',
      orderDate: '2024-01-10',
      estimatedDelivery: '2024-01-13',
      deliveredDate: '2024-01-13',
      currentLocation: 'Delivered',
      items: [
        { name: 'Crocin Advance', quantity: 1, price: 45 },
        { name: 'Dolo 650mg', quantity: 3, price: 90 }
      ],
      total: 135,
      shippingAddress: '456 Park Avenue, Bandra East, Mumbai - 400051',
      trackingSteps: [
        { status: 'order_placed', label: 'Order Placed', date: '2024-01-10', time: '02:15 PM', completed: true },
        { status: 'confirmed', label: 'Order Confirmed', date: '2024-01-10', time: '02:45 PM', completed: true },
        { status: 'packed', label: 'Packed', date: '2024-01-11', time: '10:30 AM', completed: true },
        { status: 'in_transit', label: 'In Transit', date: '2024-01-12', time: '07:15 AM', completed: true },
        { status: 'out_for_delivery', label: 'Out for Delivery', date: '2024-01-13', time: '09:00 AM', completed: true },
        { status: 'delivered', label: 'Delivered', date: '2024-01-13', time: '03:30 PM', completed: true, current: true }
      ]
    }
  };

  const trackOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter a valid Order ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    // Simulate API call
    setTimeout(() => {
      const order = mockOrderData[orderId.toUpperCase()];
      if (order) {
        setOrderData(order);
        setError('');
      } else {
        setError('Order not found. Please check your Order ID and try again.');
        setOrderData(null);
      }
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      trackOrder();
    }
  };

  const getStatusIcon = (status, completed, current) => {
    if (completed) {
      return (
        <div className={`status-icon completed ${current ? 'current' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </div>
      );
    } else {
      return <div className="status-icon pending"></div>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in_transit': return '#3b82f6';
      case 'out_for_delivery': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="order-tracking-page">
      <Header />
      <main className="order-tracking-main">
        {/* Hero Section */}
        <section className="tracking-hero">
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
            <h1>Track Your Order</h1>
            <p>Get real-time updates on your medicine delivery</p>
          </div>
        </section>

        {/* Search Section */}
        <section className="tracking-search">
          <div className="search-container">
            <div className="search-card">
              <h2>Enter Order Details</h2>
              <p>Enter your Order ID to track your package</p>
              
              <div className="search-form">
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter Order ID (e.g., ORD123456)"
                    className="track-input"
                    disabled={loading}
                  />
                  <button 
                    onClick={trackOrder} 
                    className="track-button"
                    disabled={loading || !orderId.trim()}
                  >
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 3h5v5"></path>
                          <path d="M8 3H3v5"></path>
                          <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
                          <path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.657V22"></path>
                        </svg>
                        Track Order
                      </>
                    )}
                  </button>
                </div>
                
                {error && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <div className="demo-orders">
                <p>Try these demo Order IDs:</p>
                <div className="demo-buttons">
                  <button 
                    onClick={() => setOrderId('ORD123456')}
                    className="demo-button"
                  >
                    ORD123456 (In Transit)
                  </button>
                  <button 
                    onClick={() => setOrderId('ORD789012')}
                    className="demo-button"
                  >
                    ORD789012 (Delivered)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Details Section */}
        {orderData && (
          <section className="order-details">
            <div className="details-container">
              {/* Order Summary Card */}
              <div className="order-summary-card">
                <div className="card-header">
                  <h3>Order Summary</h3>
                  <div className="order-status" style={{ backgroundColor: getStatusColor(orderData.status) }}>
                    {orderData.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">Order ID:</span>
                    <span className="value">{orderData.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Order Date:</span>
                    <span className="value">{formatDate(orderData.orderDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">₹{orderData.total}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Delivery Address:</span>
                    <span className="value">{orderData.shippingAddress}</span>
                  </div>
                  {orderData.status === 'delivered' ? (
                    <div className="info-row">
                      <span className="label">Delivered On:</span>
                      <span className="value delivered">{formatDate(orderData.deliveredDate)}</span>
                    </div>
                  ) : (
                    <div className="info-row">
                      <span className="label">Expected Delivery:</span>
                      <span className="value">{formatDate(orderData.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>

                <div className="order-items">
                  <h4>Items Ordered</h4>
                  {orderData.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-details">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="tracking-timeline-card">
                <div className="card-header">
                  <h3>Tracking Timeline</h3>
                  <div className="current-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Current: {orderData.currentLocation}
                  </div>
                </div>

                <div className="timeline">
                  {orderData.trackingSteps.map((step, index) => (
                    <div key={index} className={`timeline-item ${step.completed ? 'completed' : 'pending'} ${step.current ? 'current' : ''}`}>
                      <div className="timeline-marker">
                        {getStatusIcon(step.status, step.completed, step.current)}
                        {index < orderData.trackingSteps.length - 1 && (
                          <div className={`timeline-line ${step.completed ? 'completed' : 'pending'}`}></div>
                        )}
                      </div>
                      <div className="timeline-content">
                        <h4>{step.label}</h4>
                        <div className="timeline-meta">
                          <span className="date">{formatDate(step.date)}</span>
                          <span className="time">{step.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section className="tracking-help">
          <div className="help-container">
            <div className="help-card">
              <h3>Need Help?</h3>
              <p>If you have any questions about your order, we're here to help!</p>
              <div className="help-actions">
                <a href="/help-center" className="help-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Help Center
                </a>
                <a href="tel:+911234567890" className="help-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTracking;


