import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './Header';
import OrderService from './services/orders';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await OrderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'processing':
        return 'processing';
      case 'shipped':
      case 'out_for_delivery':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
      case 'refunded':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'processing':
        return '⚙️';
      case 'shipped':
      case 'out_for_delivery':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
      case 'refunded':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <Header />
        <div className="my-orders-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Header />
      <div className="my-orders-container">
        <div className="my-orders-header">
          <div className="header-content">
            <div className="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <div>
              <h1>My Orders</h1>
              <p>Track and manage all your orders</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-btn">Try Again</button>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button onClick={() => navigate('/')} className="start-shopping-btn">
              Start Shopping
            </button>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-number">
                      <span className="label">Order #</span>
                      <span className="value">{order.order_number}</span>
                    </div>
                    <div className="order-date">
                      <span className="label">Placed on</span>
                      <span className="value">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-summary">
                    <div className="amount-info">
                      <span className="label">Total Amount</span>
                      <span className="amount">{formatPrice(order.total_amount)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="discount-info">
                        <span className="label">Discount</span>
                        <span className="discount">-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="final-amount">
                      <span className="label">Final Amount</span>
                      <span className="amount">{formatPrice(order.final_amount)}</span>
                    </div>
                  </div>

                  {order.shipping_address && (
                    <div className="shipping-info">
                      <span className="label">Delivery Address</span>
                      <div className="address">
                        <p>{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && (
                          <p>{order.shipping_address.address_line2}</p>
                        )}
                        <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                      </div>
                    </div>
                  )}

                  <div className="payment-info">
                    <div className="payment-status">
                      <span className="label">Payment Status</span>
                      <span className={`payment-badge ${order.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                        {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    {order.payment_method && (
                      <div className="payment-method">
                        <span className="label">Payment Method</span>
                        <span className="value">{order.payment_method}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <button onClick={() => navigate(`/order/${order.id}`)} className="btn-primary">
                    View Details
                  </button>
                  <button onClick={() => navigate(`/order-tracking?order_id=${order.order_number}`)} className="btn-secondary">
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
                 )}
       </div>
     </div>
   );
 };

export default MyOrders;

