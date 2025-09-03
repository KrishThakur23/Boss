import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import './MyDonations.css';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyDonations();
    }
  }, [user]);

  const loadMyDonations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_donations_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
      alert('Failed to load donations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'collected': return '📦';
      case 'completed': return '🎉';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'collected': return '#3498db';
      case 'completed': return '#8e44ad';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-donations">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-donations">
      <div className="donations-header">
        <h1>💝 My Donations</h1>
        <p>Track your medicine donations and pickup schedules</p>
      </div>

      {donations.length === 0 ? (
        <div className="no-donations">
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No Donations Yet</h3>
            <p>You haven't made any medicine donations yet.</p>
            <a href="/donate" className="donate-now-btn">
              Start Donating Today
            </a>
          </div>
        </div>
      ) : (
        <div className="donations-container">
          <div className="donations-summary">
            <div className="summary-card">
              <span className="summary-number">{donations.length}</span>
              <span className="summary-label">Total Donations</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">
                {donations.filter(d => d.status === 'completed').length}
              </span>
              <span className="summary-label">Completed</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">
                {donations.filter(d => d.status === 'pending').length}
              </span>
              <span className="summary-label">Pending</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">
                {donations.filter(d => d.scheduled_date).length}
              </span>
              <span className="summary-label">Pickup Scheduled</span>
            </div>
          </div>

          <div className="donations-list">
            <h2>Donation History</h2>
            
            <div className="donations-grid">
              {donations.map(donation => (
                <div key={donation.id} className="donation-card">
                  <div className="donation-header">
                    <div className="donation-title">
                      <h3>Donation #{donation.id.slice(0, 8)}</h3>
                      <span className="donation-date">
                        {formatDate(donation.created_at)}
                      </span>
                    </div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(donation.status) + '20', color: getStatusColor(donation.status) }}
                    >
                      {getStatusIcon(donation.status)} {donation.status}
                    </div>
                  </div>

                  <div className="donation-details">
                    <div className="detail-row">
                      <span className="detail-label">Items Donated:</span>
                      <span className="detail-value">{donation.total_items}</span>
                    </div>
                    
                    {donation.message && (
                      <div className="detail-row">
                        <span className="detail-label">Message:</span>
                        <span className="detail-value message">{donation.message}</span>
                      </div>
                    )}

                    {donation.admin_notes && (
                      <div className="detail-row">
                        <span className="detail-label">Admin Notes:</span>
                        <span className="detail-value admin-notes">{donation.admin_notes}</span>
                      </div>
                    )}
                  </div>

                  {donation.scheduled_date && (
                    <div className="pickup-schedule">
                      <h4>📅 Pickup Schedule</h4>
                      <div className="schedule-details">
                        <div className="schedule-item">
                          <span className="schedule-label">Date:</span>
                          <span className="schedule-value">{formatDate(donation.scheduled_date)}</span>
                        </div>
                        <div className="schedule-item">
                          <span className="schedule-label">Time:</span>
                          <span className="schedule-value">{formatTime(donation.scheduled_time)}</span>
                        </div>
                        <div className="schedule-item">
                          <span className="schedule-label">Address:</span>
                          <span className="schedule-value">{donation.scheduled_pickup_address}</span>
                        </div>
                        {donation.pickup_status && (
                          <div className="schedule-item">
                            <span className="schedule-label">Status:</span>
                            <span className="schedule-value status">{donation.pickup_status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="donation-actions">
                    <button
                      className="action-btn view-details-btn"
                      onClick={() => setSelectedDonation(donation)}
                    >
                      👁️ View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="modal-overlay" onClick={() => setSelectedDonation(null)}>
          <div className="donation-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Donation Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedDonation(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h4>📋 Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Donation ID:</span>
                    <span className="detail-value">{selectedDonation.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedDonation.status) + '20', color: getStatusColor(selectedDonation.status) }}
                      >
                        {getStatusIcon(selectedDonation.status)} {selectedDonation.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">{formatDate(selectedDonation.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{formatDate(selectedDonation.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>👤 Donor Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedDonation.donor_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedDonation.donor_email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedDonation.donor_phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedDonation.donor_address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>💊 Donation Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Total Items:</span>
                    <span className="detail-value">{selectedDonation.total_items}</span>
                  </div>
                  {selectedDonation.message && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Message:</span>
                      <span className="detail-value">{selectedDonation.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDonation.admin_notes && (
                <div className="detail-section">
                  <h4>📝 Admin Notes</h4>
                  <div className="admin-notes-content">
                    {selectedDonation.admin_notes}
                  </div>
                </div>
              )}

              {selectedDonation.scheduled_date && (
                <div className="detail-section">
                  <h4>📅 Pickup Schedule</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(selectedDonation.scheduled_date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{formatTime(selectedDonation.scheduled_time)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{selectedDonation.scheduled_pickup_address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pickup Status:</span>
                      <span className="detail-value">{selectedDonation.pickup_status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="close-modal-btn"
                  onClick={() => setSelectedDonation(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;

