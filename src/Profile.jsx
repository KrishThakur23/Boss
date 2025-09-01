import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './Header';

import { supabase } from './config/supabase';
import { UserProfileService } from './services/userProfileService';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          console.log('Loading user profile from Supabase...');
          
          // Try to load profile from Supabase first
          const supabaseProfile = await UserProfileService.getUserProfile(user.id);
          
          if (supabaseProfile) {
            console.log('Profile loaded from Supabase:', supabaseProfile);
            setFormData({
              first_name: supabaseProfile.first_name || '',
              last_name: supabaseProfile.last_name || '',
              phone: supabaseProfile.phone || '',
              address: supabaseProfile.address || '',
              city: supabaseProfile.city || '',
              state: supabaseProfile.state || '',
              pincode: supabaseProfile.pincode || '',
              gender: supabaseProfile.gender || ''
            });
          } else if (userProfile) {
            // Fallback to userProfile from context
            console.log('Profile: userProfile received:', userProfile);
            setFormData({
              first_name: userProfile.first_name || '',
              last_name: userProfile.last_name || '',
              phone: userProfile.phone || '',
              address: userProfile.address || '',
              city: userProfile.city || '',
              state: userProfile.state || '',
              pincode: userProfile.pincode || '',
              gender: userProfile.gender || ''
            });
          } else {
            // Fallback to user metadata
            console.log('Using user metadata as fallback');
            setFormData({
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              phone: user.user_metadata?.phone || '',
              address: user.user_metadata?.address || '',
              city: user.user_metadata?.city || '',
              state: user.user_metadata?.state || '',
              pincode: user.user_metadata?.pincode || '',
              gender: user.user_metadata?.gender || ''
            });
          }
          
          console.log('Profile: user data:', user);
          console.log('Profile: user metadata:', user.user_metadata);
          console.log('Profile: user app metadata:', user.app_metadata);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to user metadata on error
          setFormData({
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            phone: user.user_metadata?.phone || '',
            address: user.user_metadata?.address || '',
            city: user.user_metadata?.city || '',
            state: user.user_metadata?.state || '',
            pincode: user.user_metadata?.pincode || '',
            gender: user.user_metadata?.gender || ''
          });
        }
      }
    };

    loadUserProfile();
  }, [user, userProfile]);

  // Debug effect for isEditing state
  useEffect(() => {
    console.log('Profile: isEditing state changed to:', isEditing);
    console.log('Profile: formData state:', formData);
  }, [isEditing, formData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Starting profile update...');
      console.log('Form data:', formData);
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const profileData = {
        user_id: user.id,
        email: user.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      console.log('Profile data to save:', profileData);
      console.log('Saving profile to Supabase...');

      // Use direct Supabase calls instead of UserProfileService for now
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to check existing profile: ${fetchError.message}`);
      }

      let savedProfile;
      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile...');
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update profile: ${error.message}`);
        }
        savedProfile = data;
        console.log('Profile updated successfully:', savedProfile);
      } else {
        // Create new profile
        console.log('Creating new profile...');
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create profile: ${error.message}`);
        }
        savedProfile = data;
        console.log('Profile created successfully:', savedProfile);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully! Data saved to database.' });
      setIsEditing(false);
      
      // Update local state with saved data
      setFormData({
        first_name: savedProfile.first_name || '',
        last_name: savedProfile.last_name || '',
        phone: savedProfile.phone || '',
        address: savedProfile.address || '',
        city: savedProfile.city || '',
        state: savedProfile.state || '',
        pincode: savedProfile.pincode || '',
        gender: savedProfile.gender || ''
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.message === 'User not authenticated') {
        errorMessage = 'You are not authenticated. Please sign in again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
        gender: userProfile.gender || ''
      });
    } else if (user) {
      // If no userProfile, use user metadata
      setFormData({
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || '',
        pincode: user.user_metadata?.pincode || '',
        gender: user.user_metadata?.gender || ''
      });
    }
    setMessage({ type: '', text: '' });
  };

  // Test database connection function
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection via UserProfileService...');
      
      // Test if we can access the service
      if (!UserProfileService) {
        throw new Error('UserProfileService not available');
      }
      
      // Try to get a profile (this will test the connection)
      const result = await UserProfileService.getUserProfile(user?.id || 'test');
      
      if (result) {
        console.log('Database connection successful! Found profile:', result);
        alert('Database connection successful! Profile data accessible.');
      } else {
        console.log('Database connection successful! No profile found (expected for new users)');
        alert('Database connection successful! No profile found yet (this is normal for new users).');
      }
    } catch (err) {
      console.error('Database test failed:', err);
      alert(`Database test failed: ${err.message}`);
    }
  };

  // Helper function to get display value
  const getDisplayValue = (fieldName) => {
    // Always prioritize formData (which contains saved changes)
    if (formData[fieldName]) {
      return formData[fieldName];
    }
    
    // Fallback to user data if no formData
    if (userProfile && userProfile[fieldName]) {
      return userProfile[fieldName];
    } else if (user?.user_metadata?.[fieldName]) {
      return user.user_metadata[fieldName];
    }
    
    return '';
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <div className="profile-card">
            <h2>Access Denied</h2>
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <div className="profile-grid">
          {/* My Profile Section - Top Left */}
          <div className="profile-card my-profile-card">
            <div className="card-header">
              <h2>My Profile</h2>
            </div>
            <div className="my-profile-content">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {getDisplayValue('first_name') ? getDisplayValue('first_name').charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="profile-summary">
                <h3>{(getDisplayValue('first_name') && getDisplayValue('last_name')) 
                  ? `${getDisplayValue('first_name')} ${getDisplayValue('last_name')}`
                  : (userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : userProfile?.full_name || 'User'
                  )
                }</h3>
                <p>{user?.email || 'No email'}</p>
                <p className="member-since">Member since {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Recently'
                }</p>
              </div>
               
              {/* Quick Actions integrated under My Profile */}
              <div className="quick-actions-integrated">
                <button className="action-btn">
                  📋 View Orders
                </button>
                <button className="action-btn">
                  ❤️ Wishlist
                </button>
                <button className="action-btn">
                  🛒 Cart
                </button>
                <button className="action-btn">
                  📞 Support
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information Card - Top Right */}
          <div className="profile-card profile-info-card">
            {/* Personal Information Section */}
            <div className="info-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                <button 
                  className="section-edit-btn"
                  onClick={() => {
                    console.log('Personal Information Edit button clicked');
                    console.log('Current isEditing state:', isEditing);
                    console.log('Setting isEditing to true');
                    setIsEditing(true);
                  }}
                  disabled={isLoading}
                >
                  Edit
                </button>
              </div>
               
              <div className="section-content">
                {isEditing && (
                  <div className="editing-notice" style={{ 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    marginBottom: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    ✏️ Editing mode enabled - You can now modify your information
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={isEditing ? formData.first_name : (getDisplayValue('first_name') || '')}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly-input' : ''}
                      style={{ 
                        cursor: isEditing ? 'text' : 'not-allowed',
                        opacity: isEditing ? 1 : 0.7
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={isEditing ? formData.last_name : (getDisplayValue('last_name') || '')}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly-input' : ''}
                      style={{ 
                        cursor: isEditing ? 'text' : 'not-allowed',
                        opacity: isEditing ? 1 : 0.7
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div className="radio-group" style={{ 
                    opacity: isEditing ? 1 : 0.7,
                    pointerEvents: isEditing ? 'auto' : 'none'
                  }}>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={isEditing ? formData.gender === 'male' : getDisplayValue('gender') === 'male'}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <span className="radio-label">Male</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={isEditing ? formData.gender === 'female' : getDisplayValue('gender') === 'female'}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <span className="radio-label">Female</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Address Section */}
            <div className="info-section">
              <div className="section-header">
                <h3>Email Address</h3>
                <button 
                  className="section-edit-btn"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  Edit
                </button>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user?.email || ''}
                    placeholder="Enter email address"
                    disabled={true}
                    className="readonly-input"
                  />
                </div>
              </div>
            </div>

            {/* Phone Section */}
            <div className="info-section">
              <div className="section-header">
                <h3>Phone</h3>
                <button 
                  className="section-edit-btn"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  Edit
                </button>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={isEditing ? formData.phone : (getDisplayValue('phone') || '')}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    disabled={!isEditing}
                    className={!isEditing ? 'readonly-input' : ''}
                    style={{ 
                      cursor: isEditing ? 'text' : 'not-allowed',
                      opacity: isEditing ? 1 : 0.7
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - Only show when editing */}
            {isEditing && (
              <>
                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-btn"
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={isLoading}                  
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Test Database Connection Button */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>🔧 Database Connection Test</h4>
              <button 
                type="button" 
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onClick={testDatabaseConnection}
              >
                Test Database Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
