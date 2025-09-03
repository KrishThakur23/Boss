import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './Header';

import { UserProfileService } from './services/userProfileService';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: ''
  });

  // Change tracking and state management
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

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
              gender: supabaseProfile.gender || ''
            });
          } else if (userProfile) {
            // Fallback to userProfile from context
            console.log('Profile: userProfile received:', userProfile);
            setFormData({
              first_name: userProfile.first_name || '',
              last_name: userProfile.last_name || '',
              phone: userProfile.phone || '',
              gender: userProfile.gender || ''
            });
          } else {
            // Fallback to user metadata
            console.log('Using user metadata as fallback');
            setFormData({
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              phone: user.user_metadata?.phone || '',
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
            gender: user.user_metadata?.gender || ''
          });
        }
      }
    };

    loadUserProfile();
  }, [user, userProfile]);

  // Set original data when profile loads
  useEffect(() => {
    if (formData.first_name || formData.last_name || formData.phone || formData.gender) {
      setOriginalData({...formData});
      setChangedFields(new Set()); // Clear any existing changes
    }
  }, [formData.first_name, formData.last_name, formData.phone, formData.gender]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle field changes with change tracking and validation
  const handleFieldChange = (fieldName, value) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Track changed fields
    const newChangedFields = new Set(changedFields);
    if (originalData[fieldName] !== value) {
      newChangedFields.add(fieldName);
    } else {
      newChangedFields.delete(fieldName);
    }
    setChangedFields(newChangedFields);

    // Real-time validation
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    // Clear any previous save messages
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Check if there are any changes
  const hasChanges = changedFields.size > 0;

  // Validation rules
  const validationRules = {
    first_name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'First name should contain only letters, spaces, hyphens, and apostrophes'
    },
    last_name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Last name should contain only letters, spaces, hyphens, and apostrophes'
    },
    phone: {
      required: false,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number (10-16 digits)'
    },
    gender: {
      required: false,
      message: 'Please select a gender'
    }
  };

  // Validate a single field
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Check if required field is empty
    if (rules.required && (!value || value.trim() === '')) {
      return `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null;
    }

    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${rules.minLength} characters`;
    }

    // Check maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} must be no more than ${rules.maxLength} characters`;
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    return null; // No errors
  };

  // Validate all fields
  const validateAllFields = () => {
    const errors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });
    return errors;
  };

  // Handle save operation
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Create object with only changed fields
      const changedData = {};
      changedFields.forEach(field => {
        changedData[field] = formData[field];
      });

      console.log('Saving changed fields:', changedData);

      // Save to Supabase
      const result = await UserProfileService.updateUserProfile(user.id, changedData);
      
      if (result) {
        console.log('Profile updated successfully:', result);
        
        // Update original data to reflect saved changes
        setOriginalData({...formData});
        setChangedFields(new Set());
        setSaveSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
              </div>
               
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name || ''}
                      placeholder="Enter your first name"
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      className={`profile-field editable-field ${validationErrors.first_name ? 'error' : formData.first_name ? 'valid' : ''}`}
                    />
                    {validationErrors.first_name && (
                      <div className="validation-feedback error">
                        <span className="error-message">❌ {validationErrors.first_name}</span>
                      </div>
                    )}
                    {!validationErrors.first_name && formData.first_name && (
                      <div className="validation-feedback success">
                        <span className="success-message">✅ Looks good!</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name || ''}
                      placeholder="Enter your last name"
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      className={`profile-field editable-field ${validationErrors.last_name ? 'error' : formData.last_name ? 'valid' : ''}`}
                    />
                    {validationErrors.last_name && (
                      <div className="validation-feedback error">
                        <span className="error-message">❌ {validationErrors.last_name}</span>
                      </div>
                    )}
                    {!validationErrors.last_name && formData.last_name && (
                      <div className="validation-feedback success">
                        <span className="success-message">✅ Looks good!</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                      />
                      <label htmlFor="male" className="radio-label">Male</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                      />
                      <label htmlFor="female" className="radio-label">Female</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="other"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                      />
                      <label htmlFor="other" className="radio-label">Other</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Address Section */}
            <div className="info-section">
              <div className="section-header">
                <h3>Email Address</h3>
                <span className="email-note">Contact support to change email</span>
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
              </div>
              <div className="section-content">
                <div className="form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    placeholder="Enter your phone number"
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`profile-field editable-field ${validationErrors.phone ? 'error' : formData.phone ? 'valid' : ''}`}
                  />
                  {validationErrors.phone && (
                    <div className="validation-feedback error">
                      <span className="error-message">❌ {validationErrors.phone}</span>
                    </div>
                  )}
                  {!validationErrors.phone && formData.phone && (
                    <div className="validation-feedback success">
                      <span className="success-message">✅ Looks good!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Save Changes Section - Always Visible */}
            <div className="save-section">
              {saveSuccess && (
                <div className="save-message success">
                  ✅ Profile updated successfully!
                </div>
              )}
              
              {saveError && (
                <div className="save-message error">
                  ❌ {saveError}
                </div>
              )}

              <div className="save-actions">
                {hasChanges && (
                  <div className="changes-indicator">
                    📝 You have {changedFields.size} unsaved change{changedFields.size !== 1 ? 's' : ''}
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`save-button ${hasChanges ? 'has-changes' : 'no-changes'}`}
                >
                  {isSaving ? (
                    <>🔄 Saving...</>
                  ) : hasChanges ? (
                    <>💾 Save Changes</>
                  ) : (
                    <>✅ All Saved</>
                  )}
                </button>
              </div>
            </div>

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
