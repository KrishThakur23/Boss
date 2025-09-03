/**
 * Secure Profile Service
 * 
 * This service provides controlled access to profile data with RLS compliance.
 * Users can only access their own data, and all operations are logged for audit.
 */

import { supabase } from '../config/supabase';

export class SecureProfileService {
  
  /**
   * Get current user's profile data (RLS enforced)
   * Only returns data for the authenticated user
   */
  static async getMyProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // RLS policy ensures only user's own data is returned
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      return {
        success: true,
        data: data || null,
        message: 'Profile data retrieved successfully'
      };

    } catch (error) {
      console.error('SecureProfileService.getMyProfile error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Request profile update (controlled process)
   * Creates a profile change request that requires approval
   */
  static async requestProfileUpdate(updateData, reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate update data
      const validatedData = this._validateProfileData(updateData);
      
      // Create profile change request
      const changeRequest = {
        user_id: user.id,
        requested_changes: validatedData,
        reason: reason,
        status: 'pending',
        requested_at: new Date().toISOString(),
        request_type: 'profile_update'
      };

      // Store in profile_change_requests table (you may need to create this)
      const { data, error } = await supabase
        .from('profile_change_requests')
        .insert(changeRequest)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create change request: ${error.message}`);
      }

      // Log the request for audit
      console.log('Profile change request created:', {
        requestId: data.id,
        userId: user.id,
        changes: validatedData,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: data,
        message: 'Profile update request submitted successfully. It will be reviewed for compliance.'
      };

    } catch (error) {
      console.error('SecureProfileService.requestProfileUpdate error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Request profile deletion (GDPR compliance)
   * Creates a data deletion request
   */
  static async requestProfileDeletion(reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create deletion request
      const deletionRequest = {
        user_id: user.id,
        reason: reason,
        status: 'pending',
        requested_at: new Date().toISOString(),
        request_type: 'profile_deletion'
      };

      const { data, error } = await supabase
        .from('profile_change_requests')
        .insert(deletionRequest)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create deletion request: ${error.message}`);
      }

      // Log the request for audit
      console.log('Profile deletion request created:', {
        requestId: data.id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: data,
        message: 'Profile deletion request submitted successfully. This will be processed according to GDPR requirements.'
      };

    } catch (error) {
      console.error('SecureProfileService.requestProfileDeletion error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get user's profile change requests
   */
  static async getMyChangeRequests() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profile_change_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch change requests: ${error.message}`);
      }

      return {
        success: true,
        data: data || [],
        message: 'Change requests retrieved successfully'
      };

    } catch (error) {
      console.error('SecureProfileService.getMyChangeRequests error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Validate profile data before processing
   * @private
   */
  static _validateProfileData(data) {
    const validatedData = {};

    // Validate email format
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
      validatedData.email = data.email.toLowerCase().trim();
    }

    // Validate phone number (Indian format)
    if (data.phone) {
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Invalid phone number format. Must be 10 digits starting with 6-9');
      }
      validatedData.phone = data.phone.trim();
    }

    // Validate names
    if (data.first_name) {
      validatedData.first_name = data.first_name.trim();
    }
    if (data.last_name) {
      validatedData.last_name = data.last_name.trim();
    }

    // Validate gender
    if (data.gender) {
      const validGenders = ['male', 'female', 'other'];
      if (!validGenders.includes(data.gender.toLowerCase())) {
        throw new Error('Invalid gender value');
      }
      validatedData.gender = data.gender.toLowerCase();
    }

    // Validate pincode (Indian format)
    if (data.pincode) {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(data.pincode)) {
        throw new Error('Invalid pincode format. Must be 6 digits');
      }
      validatedData.pincode = data.pincode.trim();
    }

    // Validate other text fields
    ['address', 'city', 'state'].forEach(field => {
      if (data[field]) {
        validatedData[field] = data[field].trim();
      }
    });

    return validatedData;
  }

  /**
   * Check if user has any pending requests
   */
  static async hasPendingRequests() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, hasPending: false };
      }

      const { data, error } = await supabase
        .from('profile_change_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .limit(1);

      if (error) {
        throw new Error(`Failed to check pending requests: ${error.message}`);
      }

      return {
        success: true,
        hasPending: data && data.length > 0
      };

    } catch (error) {
      console.error('SecureProfileService.hasPendingRequests error:', error);
      return {
        success: false,
        hasPending: false,
        error: error.message
      };
    }
  }
}

export default SecureProfileService;