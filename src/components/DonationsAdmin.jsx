import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import './DonationsAdmin.css';

const DonationsAdmin = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupSchedule, setPickupSchedule] = useState({
    scheduled_date: '',
    scheduled_time: '',
    pickup_address: '',
    driver_notes: '',
    admin_notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile?.is_admin) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Load all donations with user info
      const { data, error } = await supabase
        .from('admin_donations_view')
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

  const updateDonationStatus = async (donationId, newStatus, adminNotes = '') => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ 
          status: newStatus, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) throw error;

      // Reload donations
      await loadDonations();
      alert(`Donation status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const schedulePickup = async () => {
    if (!selectedDonation) return;

    try {
      // Create pickup schedule
      const { error } = await supabase
        .from('pickup_schedules')
        .insert({
          donation_id: selectedDonation.id,
          scheduled_date: pickupSchedule.scheduled_date,
          scheduled_time: pickupSchedule.scheduled_time,
          pickup_address: pickupSchedule.pickup_address,
          driver_notes: pickupSchedule.driver_notes,
          admin_notes: pickupSchedule.admin_notes,
          status: 'scheduled'
        });

      if (error) throw error;

      // Update donation status to approved
      await updateDonationStatus(selectedDonation.id, 'approved', 
        `Pickup scheduled for ${pickupSchedule.scheduled_date} at ${pickupSchedule.scheduled_time}`);

      // Reset form
      setPickupSchedule({
        scheduled_date: '',
        scheduled_time: '',
        pickup_address: '',
        driver_notes: '',
        admin_notes: ''
      });
      setShowPickupModal(false);
      setSelectedDonation(null);

      alert('Pickup scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      alert('Failed to schedule pickup: ' + error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'collected': return 'status-collected';
      case 'completed': return 'status-completed';
      default: return 'status-default';
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

  if (loading) {
    return (
      <div className="donations-admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donations-admin">
      <div className="admin-header">
        <h1>📋 Donations Management</h1>
        <p>Manage medicine donations and schedule pickups</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{donations.length}</span>
          <span className="stat-label">Total Donations</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {donations.filter(d => d.status === 'pending').length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {donations.filter(d => d.status === 'approved').length}
          </span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {donations.filter(d => d.status === 'completed').length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="donations-list">
        <h2>All Donations</h2>
        
        {donations.length === 0 ? (
          <div className="no-donations">
            <p>No donations found.</p>
          </div>
        ) : (
          <div className="donations-grid">
            {donations.map(donation => (
              <div key={donation.id} className="donation-card">
                <div className="donation-header">
                  <div className="donor-info">
                    <h3>{donation.donor_name}</h3>
                    <p className="donor-email">{donation.donor_email}</p>
                    <p className="donor-phone">{donation.donor_phone}</p>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(donation.status)}`}>
                    {getStatusIcon(donation.status)} {donation.status}
                  </div>
                </div>

                <div className="donation-details">
                  <p className="donation-address">
                    <strong>Address:</strong> {donation.donor_address}
                  </p>
                  {donation.message && (
                    <p className="donation-message">
                      <strong>Message:</strong> {donation.message}
                    </p>
                  )}
                  <p className="donation-items">
                    <strong>Total Items:</strong> {donation.total_items}
                  </p>
                  <p className="donation-date">
                    <strong>Submitted:</strong> {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>

                {donation.admin_notes && (
                  <div className="admin-notes">
                    <strong>Admin Notes:</strong> {donation.admin_notes}
                  </div>
                )}

                {donation.scheduled_date && (
                  <div className="pickup-info">
                    <strong>Pickup Scheduled:</strong> {donation.scheduled_date} at {donation.scheduled_time}
                  </div>
                )}

                <div className="donation-actions">
                  {donation.status === 'pending' && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => updateDonationStatus(donation.id, 'approved')}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => {
                          const notes = prompt('Enter rejection reason:');
                          if (notes !== null) {
                            updateDonationStatus(donation.id, 'rejected', notes);
                          }
                        }}
                      >
                        ❌ Reject
                      </button>
                      <button
                        className="action-btn schedule-btn"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setPickupSchedule({
                            ...pickupSchedule,
                            pickup_address: donation.donor_address
                          });
                          setShowPickupModal(true);
                        }}
                      >
                        📅 Schedule Pickup
                      </button>
                    </>
                  )}

                  {donation.status === 'approved' && (
                    <button
                      className="action-btn collect-btn"
                      onClick={() => updateDonationStatus(donation.id, 'collected')}
                    >
                      📦 Mark Collected
                    </button>
                  )}

                  {donation.status === 'collected' && (
                    <button
                      className="action-btn complete-btn"
                      onClick={() => updateDonationStatus(donation.id, 'completed')}
                    >
                      🎉 Mark Completed
                    </button>
                  )}

                  <button
                    className="action-btn view-btn"
                    onClick={() => {
                      // View donation details
                      alert(`Donation Details:\n\nDonor: ${donation.donor_name}\nEmail: ${donation.donor_email}\nPhone: ${donation.donor_phone}\nAddress: ${donation.donor_address}\nMessage: ${donation.message || 'None'}\nStatus: ${donation.status}\nTotal Items: ${donation.total_items}`);
                    }}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickup Schedule Modal */}
      {showPickupModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="pickup-modal">
            <div className="modal-header">
              <h3>Schedule Pickup for {selectedDonation.donor_name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPickupModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Pickup Date *</label>
                <input
                  type="date"
                  value={pickupSchedule.scheduled_date}
                  onChange={(e) => setPickupSchedule({
                    ...pickupSchedule,
                    scheduled_date: e.target.value
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pickup Time *</label>
                <input
                  type="time"
                  value={pickupSchedule.scheduled_time}
                  onChange={(e) => setPickupSchedule({
                    ...pickupSchedule,
                    scheduled_time: e.target.value
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pickup Address *</label>
                <textarea
                  value={pickupSchedule.pickup_address}
                  onChange={(e) => setPickupSchedule({
                    ...pickupSchedule,
                    pickup_address: e.target.value
                  })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Driver Notes</label>
                <textarea
                  value={pickupSchedule.driver_notes}
                  onChange={(e) => setPickupSchedule({
                    ...pickupSchedule,
                    driver_notes: e.target.value
                  })}
                  rows="2"
                  placeholder="Special instructions for driver..."
                />
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={pickupSchedule.admin_notes}
                  onChange={(e) => setPickupSchedule({
                    ...pickupSchedule,
                    admin_notes: e.target.value
                  })}
                  rows="2"
                  placeholder="Internal notes..."
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPickupModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="schedule-btn"
                  onClick={schedulePickup}
                  disabled={!pickupSchedule.scheduled_date || !pickupSchedule.scheduled_time || !pickupSchedule.pickup_address}
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsAdmin;
