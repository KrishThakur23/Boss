/**
 * Prescription Cart Service
 * Handles adding prescription-matched medicines to shopping cart with proper context
 */

import { supabase } from '../config/supabase';

export default class PrescriptionCartService {
  
  /**
   * Add prescription items to cart with prescription context
   * @param {Array} prescriptionItems - Array of prescription items to add
   * @param {string} prescriptionId - Unique prescription ID for tracking
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async addPrescriptionItemsToCart(prescriptionItems, prescriptionId) {
    try {
      console.log('🛒 PrescriptionCartService: Adding prescription items to cart');
      
      if (!prescriptionItems || prescriptionItems.length === 0) {
        throw new Error('No prescription items provided');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const results = {
        success: [],
        errors: [],
        prescriptionId,
        totalItems: prescriptionItems.length
      };

      // Process each prescription item
      for (const item of prescriptionItems) {
        try {
          // Validate prescription item
          const validationResult = this.validatePrescriptionItem(item);
          if (!validationResult.isValid) {
            results.errors.push({
              item: item.name || item.originalName,
              error: validationResult.error
            });
            continue;
          }

          // Check if item already exists in cart
          const { data: existingItem, error: checkError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', item.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw checkError;
          }

          let cartResult;

          if (existingItem) {
            // Update existing cart item
            const newQuantity = existingItem.quantity + (item.quantity || 1);
            
            cartResult = await supabase
              .from('cart_items')
              .update({
                quantity: newQuantity,
                prescription_context: {
                  prescriptionId,
                  originalName: item.originalName,
                  dosageInstructions: item.dosage || item.dosageInstructions,
                  matchScore: item.matchScore,
                  confidence: item.confidence,
                  addedAt: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', existingItem.id)
              .select()
              .single();

          } else {
            // Add new cart item
            cartResult = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: item.id,
                quantity: item.quantity || 1,
                prescription_context: {
                  prescriptionId,
                  originalName: item.originalName,
                  dosageInstructions: item.dosage || item.dosageInstructions,
                  matchScore: item.matchScore,
                  confidence: item.confidence,
                  addedAt: new Date().toISOString()
                },
                is_prescription_item: true,
                requires_prescription_verification: item.requiresPrescription || false
              })
              .select()
              .single();
          }

          if (cartResult.error) {
            throw cartResult.error;
          }

          results.success.push({
            item: item.name || item.originalName,
            cartItemId: cartResult.data.id,
            quantity: cartResult.data.quantity,
            action: existingItem ? 'updated' : 'added'
          });

        } catch (itemError) {
          console.error(`❌ Failed to add item "${item.name || item.originalName}" to cart:`, itemError);
          results.errors.push({
            item: item.name || item.originalName,
            error: itemError.message || 'Failed to add to cart'
          });
        }
      }

      // Log prescription cart activity
      await this.logPrescriptionCartActivity(user.id, prescriptionId, results);

      console.log(`✅ Cart operation completed: ${results.success.length} success, ${results.errors.length} errors`);
      return { data: results, error: null };

    } catch (error) {
      console.error('❌ PrescriptionCartService: Failed to add items to cart:', error);
      return { data: null, error };
    }
  }

  /**
   * Validate prescription item before adding to cart
   * @param {Object} item - Prescription item to validate
   * @returns {Object} Validation result
   */
  static validatePrescriptionItem(item) {
    if (!item) {
      return { isValid: false, error: 'Item is required' };
    }

    if (!item.id) {
      return { isValid: false, error: 'Product ID is required' };
    }

    if (!item.name && !item.originalName) {
      return { isValid: false, error: 'Product name is required' };
    }

    if (item.quantity && (item.quantity < 1 || item.quantity > 10)) {
      return { isValid: false, error: 'Quantity must be between 1 and 10' };
    }

    return { isValid: true };
  }

  /**
   * Mark cart items as prescription-based
   * @param {Array} cartItemIds - Array of cart item IDs
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async markItemsAsPrescriptionBased(cartItemIds, prescriptionId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          is_prescription_item: true,
          prescription_context: {
            prescriptionId,
            markedAt: new Date().toISOString()
          }
        })
        .in('id', cartItemIds)
        .select();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to mark items as prescription-based:', error);
      return { data: null, error };
    }
  }

  /**
   * Validate prescription requirements for cart items
   * @param {Array} cartItems - Cart items to validate
   * @returns {Object} Validation result
   */
  static validatePrescriptionRequirements(cartItems) {
    const prescriptionRequired = [];
    const prescriptionOptional = [];
    const issues = [];

    cartItems.forEach(item => {
      if (item.requires_prescription_verification) {
        prescriptionRequired.push(item);
      } else if (item.is_prescription_item) {
        prescriptionOptional.push(item);
      }
    });

    // Check if prescription verification is needed
    if (prescriptionRequired.length > 0) {
      issues.push({
        type: 'prescription_required',
        message: `${prescriptionRequired.length} items require prescription verification`,
        items: prescriptionRequired.map(item => item.product_name || item.id)
      });
    }

    return {
      isValid: issues.length === 0,
      prescriptionRequired: prescriptionRequired.length,
      prescriptionOptional: prescriptionOptional.length,
      issues,
      requiresPharmacyReview: prescriptionRequired.length > 0
    };
  }

  /**
   * Get prescription context for cart items
   * @param {string} userId - User ID
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getPrescriptionCartItems(userId, prescriptionId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price,
            mrp,
            manufacturer,
            requires_prescription,
            in_stock
          )
        `)
        .eq('user_id', userId)
        .eq('prescription_context->prescriptionId', prescriptionId);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to get prescription cart items:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove prescription items from cart
   * @param {string} userId - User ID
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async removePrescriptionItems(userId, prescriptionId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('prescription_context->prescriptionId', prescriptionId)
        .select();

      if (error) throw error;

      return { 
        data: { 
          removedCount: data?.length || 0,
          removedItems: data || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('❌ Failed to remove prescription items:', error);
      return { data: null, error };
    }
  }

  /**
   * Update prescription item quantity in cart
   * @param {string} cartItemId - Cart item ID
   * @param {number} newQuantity - New quantity
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updatePrescriptionItemQuantity(cartItemId, newQuantity) {
    try {
      if (newQuantity < 1 || newQuantity > 10) {
        throw new Error('Quantity must be between 1 and 10');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .eq('is_prescription_item', true)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to update prescription item quantity:', error);
      return { data: null, error };
    }
  }

  /**
   * Get prescription cart summary
   * @param {string} userId - User ID
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getPrescriptionCartSummary(userId, prescriptionId) {
    try {
      const { data: cartItems, error } = await this.getPrescriptionCartItems(userId, prescriptionId);
      
      if (error) throw error;

      const summary = {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: cartItems.reduce((sum, item) => {
          const price = item.products?.price || 0;
          return sum + (price * item.quantity);
        }, 0),
        prescriptionRequired: cartItems.filter(item => item.requires_prescription_verification).length,
        inStockItems: cartItems.filter(item => item.products?.in_stock).length,
        outOfStockItems: cartItems.filter(item => !item.products?.in_stock).length
      };

      return { data: summary, error: null };
    } catch (error) {
      console.error('❌ Failed to get prescription cart summary:', error);
      return { data: null, error };
    }
  }

  /**
   * Log prescription cart activity for monitoring
   * @param {string} userId - User ID
   * @param {string} prescriptionId - Prescription ID
   * @param {Object} activity - Activity details
   */
  static async logPrescriptionCartActivity(userId, prescriptionId, activity) {
    try {
      await supabase
        .from('prescription_cart_logs')
        .insert({
          user_id: userId,
          prescription_id: prescriptionId,
          activity_type: 'add_to_cart',
          activity_data: activity,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      // Log errors but don't fail the main operation
      console.warn('⚠️ Failed to log prescription cart activity:', error);
    }
  }

  /**
   * Handle cart errors with user-friendly messages
   * @param {Error} error - Original error
   * @param {Object} context - Error context
   * @returns {Object} User-friendly error information
   */
  static handleCartError(error, context = {}) {
    const errorInfo = {
      userMessage: 'Failed to add item to cart',
      technicalMessage: error.message,
      retryable: true,
      suggestions: []
    };

    if (error.message.includes('authentication') || error.message.includes('user')) {
      errorInfo.userMessage = 'Please sign in to add items to cart';
      errorInfo.retryable = false;
      errorInfo.suggestions.push('Sign in to your account');
    } else if (error.message.includes('product') || error.message.includes('not found')) {
      errorInfo.userMessage = 'This product is no longer available';
      errorInfo.retryable = false;
      errorInfo.suggestions.push('Try searching for similar products');
    } else if (error.message.includes('quantity')) {
      errorInfo.userMessage = 'Invalid quantity specified';
      errorInfo.suggestions.push('Quantity must be between 1 and 10');
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      errorInfo.userMessage = 'Network error occurred';
      errorInfo.suggestions.push('Check your internet connection and try again');
    }

    return errorInfo;
  }
}