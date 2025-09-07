import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { addressService } from './services/addressService';
import OrderService from './services/orders';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const shippingCost = cartTotal > 500 ? 0 : 50;
  const totalAmount = cartTotal + shippingCost;

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [user, items, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.id);
      setAddresses(data);
      
      // Auto-select default address if available
      const defaultAddress = data.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const addressData = {
        user_id: user.id,
        ...newAddress
      };

      await addressService.addAddress(addressData);
      
      // Reset form and refresh addresses
      setNewAddress({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
      setShowAddressForm(false);
      
      // Refresh addresses and select the newly created one
      await fetchAddresses();
      
      // Select the newly created address
      const newAddresses = await addressService.getUserAddresses(user.id);
      const newlyCreated = newAddresses[newAddresses.length - 1];
      setSelectedAddress(newlyCreated);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      alert('Please select or create an address to continue.');
      return;
    }

    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert('Razorpay is not loaded. Please check your internet connection.');
        return;
      }

      // Get Razorpay key from environment
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKey || razorpayKey === 'rzp_test_your_actual_key_id_here') {
        alert('Please configure your Razorpay key in the .env file');
        return;
      }

      // Create order details
      const orderDetails = {
        amount: totalAmount,
        currency: 'INR',
        items: items,
        address: selectedAddress,
        user: user
      };

      // Razorpay options
    const options = {
        key: razorpayKey,
        amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'FlickXir',
        description: 'Medicine Order',
        handler: async function (response) {
          // Payment successful

          
          try {
            // Save order to database
            const orderData = {
              order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              total_amount: totalAmount,
              discount_amount: 0, // No discount for now
              final_amount: totalAmount,
              shipping_address: selectedAddress,
              billing_address: selectedAddress, // Same as shipping for now
              payment_status: 'paid',
              payment_method: 'Razorpay',
              status: 'confirmed',
              notes: `Payment ID: ${response.razorpay_payment_id}, Order ID: ${response.razorpay_order_id}`
            };
            
            const { data: savedOrder, error: orderError } = await OrderService.createOrderFromPayment(user.id, orderData);
            
            if (orderError) {
              console.error('Error saving order:', orderError);
            } else {

            }
            
            // Verify payment details
            const paymentDetails = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderDetails,
              savedOrder: savedOrder
            };
            

            
            // Navigate to order success page
            navigate('/order-success', {
              state: { paymentDetails: paymentDetails },
              replace: true
            });
            
            // Clear cart after a short delay to ensure navigation completes
            setTimeout(() => {

              clearCart();
            }, 500);
            
          } catch (error) {
            console.error('Error processing payment success:', error);
            // Still navigate to success page even if order save fails
            const paymentDetails = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderDetails
            };
            
            navigate('/order-success', {
              state: { paymentDetails: paymentDetails },
              replace: true
            });
            
            setTimeout(() => {
        clearCart();
            }, 500);
          }
      },
      prefill: {
          name: selectedAddress.name,
        contact: selectedAddress.phone,
          email: user.email
      },
      notes: {
          address: `${selectedAddress.address_line1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`
      },
      theme: {
          color: '#3399cc'
      },
        modal: {
          ondismiss: function() {

          }
        }
    };

      // Open Razorpay payment modal
    const rzp = new window.Razorpay(options);
    rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order by providing delivery details</p>
        </div>

        <div className="checkout-content">
          {/* Address Selection Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Delivery Address</h2>
              {addresses.length > 0 && (
                <button 
                  className="add-new-address-btn"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              )}
            </div>

            {/* Show existing addresses if available */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="addresses-grid">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="address-header">
                      <h3>{address.name}</h3>
                      {address.is_default && <span className="default-badge">Default</span>}
                    </div>
                    <p className="address-phone">{address.phone}</p>
                    <p className="address-line">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="address-line">{address.address_line2}</p>
                    )}
                    <p className="address-city">{address.city}, {address.state} {address.pincode}</p>
                    <div className="address-actions">
                      <button 
                        className="select-address-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAddress(address);
                        }}
                      >
                        {selectedAddress?.id === address.id ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showAddressForm && (
              <div className="add-address-form">
                <h3>Add New Address</h3>
                <form onSubmit={handleAddressSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newAddress.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address_line1">Address Line 1 *</label>
                    <input
                      type="text"
                      id="address_line1"
                      name="address_line1"
                      value={newAddress.address_line1}
                      onChange={handleInputChange}
                      required
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address_line2">Address Line 2</label>
                    <input
                      type="text"
                      id="address_line2"
                      name="address_line2"
                      value={newAddress.address_line2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter city name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter state name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={newAddress.pincode}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={newAddress.is_default}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* No addresses message */}
            {addresses.length === 0 && !showAddressForm && (
              <div className="no-addresses">
                <div className="no-addresses-icon">📍</div>
                <h3>No addresses found</h3>
                <p>Please add a delivery address to continue with your order.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add Your First Address
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="checkout-actions">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/cart')}
            >
              ← Back to Cart
            </button>
            
            <button 
              className="btn-primary checkout-btn"
              onClick={handleProceedToPayment}
              disabled={!selectedAddress}
            >
              {selectedAddress ? 'Proceed to Payment' : 'Select Address to Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
