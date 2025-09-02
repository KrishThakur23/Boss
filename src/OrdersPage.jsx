import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Check if user is admin (you can customize this logic)
  const isAdminUser = user?.email === 'krishthakur2004@gmail.com' || 
                     user?.email === 'admin@example.com' ||
                     process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!isAdminUser) {
      navigate('/');
      return;
    }

    loadOrders();
  }, [isAuthenticated, isAdminUser, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingOrder(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
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
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'refunded': return 'refunded';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
            <h1>Orders Management</h1>
            <p>View and manage all orders across all accounts</p>
          </div>
          <div className="header-right">
            <button 
              className="refresh-button"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{getStatusCount('pending')}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{getStatusCount('confirmed')}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <div className="stat-number">{getStatusCount('shipped')}</div>
            <div className="stat-label">Shipped</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{getStatusCount('delivered')}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search orders by number, customer name, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Sort by Date</option>
            <option value="order_number">Sort by Order Number</option>
            <option value="final_amount">Sort by Amount</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-button"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h4>Error loading orders</h4>
            <p>{error}</p>
            <button onClick={loadOrders} className="retry-button">
              🔄 Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No orders found</h4>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here once customers start placing them!'
              }
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
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
                      className="view-button"
                      onClick={() => openOrderModal(order)}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                    className="update-button"
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
    </div>
  );
};

export default OrdersPage;
