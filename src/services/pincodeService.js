import { supabase } from '../config/supabase';

class PincodeService {
  /**
   * Check if a pincode is deliverable
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<boolean>} - True if deliverable, false otherwise
   */
  static async isDeliverable(pincode) {
    try {
      if (!pincode || pincode.length !== 6) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('is_pincode_deliverable', { pincode_to_check: pincode });

      if (error) {
        console.error('Error checking pincode deliverability:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in isDeliverable:', error);
      return false;
    }
  }

  /**
   * Get detailed information about a pincode
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<Object|null>} - Pincode details or null if not found
   */
  static async getPincodeDetails(pincode) {
    try {
      if (!pincode || pincode.length !== 6) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_pincode_details', { pincode_to_check: pincode });

      if (error) {
        console.error('Error getting pincode details:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getPincodeDetails:', error);
      return null;
    }
    }
  }

  /**
   * Validate pincode format and get delivery information
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<Object>} - Validation result with details
   */
  static async validatePincode(pincode) {
    try {
      // Basic format validation
      if (!pincode || typeof pincode !== 'string') {
        return {
          isValid: false,
          error: 'Pincode is required'
        };
      }

      if (pincode.length !== 6) {
        return {
          isValid: false,
          error: 'Pincode must be exactly 6 digits'
        };
      }

      if (!/^\d{6}$/.test(pincode)) {
        return {
          isValid: false,
          error: 'Pincode must contain only numbers'
        };
      }

      // Check if pincode is deliverable
      const isDeliverable = await this.isDeliverable(pincode);
      
      if (!isDeliverable) {
        return {
          isValid: false,
          error: 'Sorry, we do not deliver to this pincode yet. Please check with us later or try a different address.',
          pincode: pincode
        };
      }

      // Get delivery details
      const details = await this.getPincodeDetails(pincode);
      
      return {
        isValid: true,
        pincode: pincode,
        details: details,
        message: `Great! We deliver to ${details.city}, ${details.state}. ${details.delivery_charge > 0 ? `Delivery charge: ₹${details.delivery_charge}` : 'Free delivery!'}`
      };
    } catch (error) {
      console.error('Error in validatePincode:', error);
      return {
        isValid: false,
        error: 'An error occurred while validating the pincode. Please try again.'
      };
    }
  }

  /**
   * Get all deliverable pincodes (for admin use)
   * @returns {Promise<Array>} - Array of deliverable pincodes
   */
  static async getAllDeliverablePincodes() {
    try {
      const { data, error } = await supabase
        .from('deliverable_pincodes')
        .select('*')
        .eq('is_active', true)
        .order('state', { ascending: true })
        .order('city', { ascending: true })
        .order('pincode', { ascending: true });

      if (error) {
        console.error('Error fetching deliverable pincodes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllDeliverablePincodes:', error);
      return [];
    }
  }

  /**
   * Add a new deliverable pincode (admin only)
   * @param {Object} pincodeData - Pincode data
   * @returns {Promise<Object>} - Result of the operation
   */
  static async addDeliverablePincode(pincodeData) {
    try {
      const { data, error } = await supabase
        .from('deliverable_pincodes')
        .insert([pincodeData])
        .select();

      if (error) {
        console.error('Error adding deliverable pincode:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error in addDeliverablePincode:', error);
      return {
        success: false,
        error: 'An error occurred while adding the pincode'
      };
    }
  }

  /**
   * Update a deliverable pincode (admin only)
   * @param {string} pincode - Pincode to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Result of the operation
   */
  static async updateDeliverablePincode(pincode, updateData) {
    try {
      const { data, error } = await supabase
        .from('deliverable_pincodes')
        .update(updateData)
        .eq('pincode', pincode)
        .select();

      if (error) {
        console.error('Error updating deliverable pincode:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error in updateDeliverablePincode:', error);
      return {
        success: false,
        error: 'An error occurred while updating the pincode'
      };
    }
  }

  /**
   * Deactivate a deliverable pincode (admin only)
   * @param {string} pincode - Pincode to deactivate
   * @returns {Promise<Object>} - Result of the operation
   */
  static async deactivatePincode(pincode) {
    try {
      const { data, error } = await supabase
        .from('deliverable_pincodes')
        .update({ is_active: false })
        .eq('pincode', pincode)
        .select();

      if (error) {
        console.error('Error deactivating pincode:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error in deactivatePincode:', error);
      return {
        success: false,
        error: 'An error occurred while deactivating the pincode'
      };
    }
  }
}

export default PincodeService;
