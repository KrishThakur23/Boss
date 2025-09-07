import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import Header from './Header';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    blood_group: '',
    allergies: [],
    medical_conditions: []
  });
  
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();

  // Load user profile data from profiles table
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);

        
        // Fetch profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error loading profile:', error);
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            await createInitialProfile();
            return;
          }
          throw error;
        }
        

        
        // Set form data with profile data
        const profileData = {
          name: profile.name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          emergency_contact: profile.emergency_contact || '',
          blood_group: profile.blood_group || '',
          allergies: profile.allergies || [],
          medical_conditions: profile.medical_conditions || []
        };
        
        setFormData(profileData);
        setOriginalData(profileData);
        setChangedFields(new Set());
        
        } catch (error) {
        console.error('Failed to load profile:', error);
        // Set fallback data
        const fallbackData = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          date_of_birth: '',
          gender: '',
          emergency_contact: '',
          blood_group: '',
          allergies: [],
          medical_conditions: []
        };
        setFormData(fallbackData);
        setOriginalData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Create initial profile if it doesn't exist
  const createInitialProfile = async () => {
    try {

      
      const initialProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email,
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        date_of_birth: null,
        gender: null,
        emergency_contact: '',
        blood_group: '',
        allergies: [],
        medical_conditions: []
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([initialProfile])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      

      setFormData(initialProfile);
      setOriginalData(initialProfile);
      
    } catch (error) {
      console.error('Failed to create initial profile:', error);
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    if (!isEditMode) return; // Only allow changes in edit mode
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track changes
    if (value !== originalData[field]) {
      setChangedFields(prev => new Set(prev).add(field));
    } else {
      setChangedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }

    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }

    // Clear save messages
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Handle array field changes (allergies, medical_conditions)
  const handleArrayFieldChange = (field, value) => {
    if (!isEditMode) return; // Only allow changes in edit mode
    
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    handleFieldChange(field, arrayValue);
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }



    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (birthDate > today) {
        errors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save operation
  const handleSave = async () => {




    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (hasChanges) {
      // Create object with only changed fields
      const changedData = {};
      changedFields.forEach(field => {
        changedData[field] = formData[field];
      });



        // Update profile in Supabase
        const { data, error } = await supabase
          .from('profiles')
          .update(changedData)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating profile:', error);
          throw new Error(error.message || 'Failed to update profile');
        }
        

        
        // Update original data to reflect saved changes
        setOriginalData({...formData});
        setChangedFields(new Set());
        setSaveSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Exit edit mode after successful save
        setIsEditMode(false);
      } else {
        // No changes, just show success message

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // If exiting edit mode, reset any unsaved changes
      setFormData(originalData);
      setChangedFields(new Set());
      setValidationErrors({});
      setSaveError(null);
    }
    setIsEditMode(!isEditMode);
  };

  // Check if there are any changes
  const hasChanges = changedFields.size > 0;

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <div className="profile-header">
            <h1>Profile</h1>
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <div className="profile-header">
            <h1>Profile</h1>
            <p>Loading your profile...</p>
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
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="profile-summary">
                <h3>{formData.name || 'User'}</h3>
                <p>{formData.email || 'No email'}</p>
                <p className="member-since">Member since {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Recently'
                }</p>
              </div>
               
              {/* Quick Actions integrated under My Profile */}
              <div className="quick-actions-integrated">
                <button className="action-btn" onClick={() => navigate('/my-orders')}>
                  📋 View Orders
                </button>
                <button className="action-btn" onClick={() => alert('Wishlist feature coming soon!')}>
                  ❤️ Wishlist
                </button>
                <button className="action-btn" onClick={() => navigate('/cart')}>
                  🛒 Cart
                </button>
                <button className="action-btn" onClick={() => alert('Support feature coming soon!')}>
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
                  onClick={handleEditToggle}
                  className={`edit-toggle-btn ${isEditMode ? 'editing' : ''}`}
                >
                  {isEditMode ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </>
                  )}
                </button>
              </div>
               
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      placeholder="Enter your full name"
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      disabled={!isEditMode}
                      className={`profile-field ${isEditMode ? 'editable-field' : 'readonly-field'} ${validationErrors.name ? 'error' : ''}`}
                    />
                    {validationErrors.name && (
                      <div className="validation-feedback error">
                        <span className="error-message">❌ {validationErrors.name}</span>
                      </div>
                    )}
            </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                      value={formData.email || ''}
                      placeholder="Enter your email address"
                      disabled
                      className="profile-field readonly-field"
                    />
                    <small className="field-note">Email cannot be changed for security reasons</small>
              </div>
            </div>

                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    placeholder="Enter your phone number"
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                      disabled={!isEditMode}
                      className={`profile-field ${isEditMode ? 'editable-field' : 'readonly-field'} ${validationErrors.phone ? 'error' : ''}`}
                  />
                  {validationErrors.phone && (
                    <div className="validation-feedback error">
                      <span className="error-message">❌ {validationErrors.phone}</span>
                    </div>
                  )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={(e) => handleFieldChange('gender', e.target.value)}
                      disabled={!isEditMode}
                      className={`profile-field ${isEditMode ? 'editable-field' : 'readonly-field'}`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                      disabled={!isEditMode}
                      className={`profile-field ${isEditMode ? 'editable-field' : 'readonly-field'} ${validationErrors.date_of_birth ? 'error' : ''}`}
                    />
                    {validationErrors.date_of_birth && (
                      <div className="validation-feedback error">
                        <span className="error-message">❌ {validationErrors.date_of_birth}</span>
                    </div>
                  )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="blood_group">Blood Group</label>
                    <select
                      id="blood_group"
                      name="blood_group"
                      value={formData.blood_group || ''}
                      onChange={(e) => handleFieldChange('blood_group', e.target.value)}
                      disabled={!isEditMode}
                      className={`profile-field ${isEditMode ? 'editable-field' : 'readonly-field'}`}
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Changes Section - Only show in edit mode */}
            {isEditMode && (
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
                    disabled={isSaving}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;




