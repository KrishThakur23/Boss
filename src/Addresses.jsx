import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { addressService } from './services/addressService';
import Header from './Header';
import Footer from './Footer';
import './Addresses.css';

const Addresses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.id);
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      await addressService.addAddress({
        user_id: user.id,
        ...newAddress
      });

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
      setShowAddForm(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressService.setDefaultAddress(user.id, addressId);
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(addressId);
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="addresses-page">
      <Header />
      <main className="addresses-main">
        <div className="addresses-container">
          <div className="addresses-header">
            <h1>My Addresses</h1>
            <button 
              className="add-address-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add New Address'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-address-form">
              <h3>Add New Address</h3>
              <form onSubmit={handleAddAddress}>
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
                      placeholder="Enter phone number"
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
                    placeholder="House/Flat number, Street name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address_line2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="address_line2"
                    name="address_line2"
                    value={newAddress.address_line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
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
                  <button type="submit" className="save-address-btn">
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="no-addresses">
              <p>No saved addresses found.</p>
              <p>Add your first address to get started!</p>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map((address) => (
                <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                  {address.is_default && (
                    <div className="default-badge">Default</div>
                  )}
                  <div className="address-info">
                    <h3>{address.name}</h3>
                    <p className="phone">{address.phone}</p>
                    <p className="address">
                      {address.address_line1}
                      {address.address_line2 && <br />}
                      {address.address_line2}
                      <br />
                      {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>
                  <div className="address-actions">
                    {!address.is_default && (
                      <button
                        className="set-default-btn"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Addresses;
