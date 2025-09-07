import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    
    // Get order details from location state or URL params
    const details = location.state?.orderDetails || location.state?.paymentDetails;
    

    
    if (details) {
      setOrderDetails(details);

    } else {

      
      // Check URL parameters as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id');
      const orderId = urlParams.get('order_id');
      
      if (paymentId && orderId) {

        setOrderDetails({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          orderDetails: {
            amount: 0, // You might want to store this in localStorage or get from server
            items: []
          }
        });
      } else {

        // If no order details, redirect to home
        navigate('/');
        return;
      }
    }
    
    setLoading(false);
  }, [location, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  if (loading) {
    return (
      <div className="order-success-page">
        <Header />
        <div className="order-success-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <Header />
      <div className="order-success-container">
        <div className="success-card">
          {/* Success Icon */}
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your order. We've received your payment and will process your order soon.</p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="order-details">
              <h2>Order Details</h2>
              
              {/* Payment Information */}
              {orderDetails.razorpay_payment_id && (
                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Payment ID:</span>
                      <span className="value">{orderDetails.razorpay_payment_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Order ID:</span>
                      <span className="value">{orderDetails.razorpay_order_id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {orderDetails.orderDetails && (
                <div className="detail-section">
                  <h3>Order Summary</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Total Amount:</span>
                      <span className="value">{formatPrice(orderDetails.orderDetails.amount)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Items:</span>
                      <span className="value">{orderDetails.orderDetails.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {orderDetails.orderDetails?.address && (
                <div className="detail-section">
                  <h3>Delivery Address</h3>
                  <div className="address-details">
                    <p><strong>{orderDetails.orderDetails.address.name}</strong></p>
                    <p>{orderDetails.orderDetails.address.phone}</p>
                    <p>{orderDetails.orderDetails.address.address_line1}</p>
                    {orderDetails.orderDetails.address.address_line2 && (
                      <p>{orderDetails.orderDetails.address.address_line2}</p>
                    )}
                    <p>{orderDetails.orderDetails.address.city}, {orderDetails.orderDetails.address.state} {orderDetails.orderDetails.address.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You'll receive an order confirmation email shortly</li>
              <li>We'll process your order and ship it within 24-48 hours</li>
              <li>You can track your order status in your profile</li>
              <li>For any questions, contact our customer support</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
            <button 
              className="btn-secondary"
              onClick={handleViewOrders}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
