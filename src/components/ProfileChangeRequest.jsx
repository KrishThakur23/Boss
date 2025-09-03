import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SecureProfileService from '../services/secureProfileService';
import './ProfileChangeRequest.css';

const ProfileChangeRequest = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('request');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [changeRequests, setChangeRequests] = useState([]);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gender: '',
    reason: ''
  });

  useEffect(() => {
    loadChangeRequests();
    checkPendingRequests();
  }, []);

  const loadChangeRequests = async () => {
    const result = await SecureProfileService.getMyChangeRequests();
    if (result.success) {
      setChangeRequests(result.data);
    }
  };

  const checkPendingRequests = async () => {
    const result = await SecureProfileService.hasPendingRequests();
    if (result.success) {
      setHasPendingRequests(result.hasPending);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Filter out empty fields and reason
      const { reason, ...profileData } = formData;
      const updateData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value.trim() !== '')
      );

      if (Object.keys(updateData).length === 0) {
        throw new Error('Please provide at least one field to update');
      }

      const result = await SecureProfileService.requestProfileUpdate(updateData, reason);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData({
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          gender: '',
          reason: ''
        });
        loadChangeRequests();
        checkPendingRequests();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!window.confirm('Are you sure you want to request profile deletion? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const reason = prompt('Please provide a reason for profile deletion:');
      if (!reason) {
        setIsLoading(false);
        return;
      }

      const result = await SecureProfileService.requestProfileDeletion(reason);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadChangeRequests();
        checkPendingRequests();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      approved: 'status-badge status-approved',
      rejected: 'status-badge status-rejected',
      completed: 'status-badge status-completed'
    };

    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="profile-change-request">
      <div className="request-header">
        <h2>Profile Change Management</h2>
        <p>Request changes to your profile data through our secure, compliant process</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="request-tabs">
        <button 
          className={`tab-button ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Request Changes
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Request History
        </button>
      </div>

      {activeTab === 'request' && (
        <div className="request-form-container">
          {hasPendingRequests && (
            <div className="pending-notice">
              <span className="notice-icon">⏳</span>
              <div>
                <strong>Pending Request</strong>
                <p>You have a pending profile change request. Please wait for it to be processed before submitting a new one.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="request-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter new first name"
                    disabled={hasPendingRequests}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter new last name"
                    disabled={hasPendingRequests}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter new phone number (10 digits)"
                  disabled={hasPendingRequests}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleInputChange}
                      disabled={hasPendingRequests}
                    />
                    <span className="radio-label">Male</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleInputChange}
                      disabled={hasPendingRequests}
                    />
                    <span className="radio-label">Female</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleInputChange}
                      disabled={hasPendingRequests}
                    />
                    <span className="radio-label">Other</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Address Information</h3>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter new address"
                  rows="3"
                  disabled={hasPendingRequests}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter new city"
                    disabled={hasPendingRequests}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter new state"
                    disabled={hasPendingRequests}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter new pincode"
                    disabled={hasPendingRequests}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Request Details</h3>
              <div className="form-group">
                <label htmlFor="reason">Reason for Change</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Please explain why you need to update your profile information"
                  rows="3"
                  required
                  disabled={hasPendingRequests}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading || hasPendingRequests}
              >
                {isLoading ? 'Submitting Request...' : 'Submit Change Request'}
              </button>
              
              <button 
                type="button" 
                className="delete-btn"
                onClick={handleDeleteRequest}
                disabled={isLoading || hasPendingRequests}
              >
                Request Profile Deletion
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="request-history">
          <h3>Your Change Requests</h3>
          {changeRequests.length === 0 ? (
            <div className="no-requests">
              <p>You haven't submitted any profile change requests yet.</p>
            </div>
          ) : (
            <div className="requests-list">
              {changeRequests.map((request) => (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <div className="request-type">
                      {request.request_type === 'profile_update' ? '📝 Profile Update' : '🗑️ Profile Deletion'}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="request-details">
                    <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleDateString()}</p>
                    {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
                    
                    {request.requested_changes && (
                      <div className="requested-changes">
                        <strong>Requested Changes:</strong>
                        <ul>
                          {Object.entries(request.requested_changes).map(([field, value]) => (
                            <li key={field}>
                              <strong>{field.replace('_', ' ')}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {request.reviewer_notes && (
                      <p><strong>Review Notes:</strong> {request.reviewer_notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileChangeRequest;