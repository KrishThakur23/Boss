import { useState, useCallback } from 'react';
import PincodeService from '../services/pincodeService';

/**
 * Custom hook for pincode validation
 * @returns {Object} - Pincode validation state and functions
 */
const usePincodeValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [lastValidatedPincode, setLastValidatedPincode] = useState('');

  /**
   * Validate a pincode
   * @param {string} pincode - Pincode to validate
   * @returns {Promise<Object>} - Validation result
   */
  const validatePincode = useCallback(async (pincode) => {
    // Don't validate if pincode is empty or same as last validated
    if (!pincode || pincode === lastValidatedPincode) {
      return validationResult;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await PincodeService.validatePincode(pincode);
      setValidationResult(result);
      
      if (result.isValid) {
        setLastValidatedPincode(pincode);
      }
      
      return result;
    } catch (error) {
      console.error('Error validating pincode:', error);
      const errorResult = {
        isValid: false,
        error: 'An error occurred while validating the pincode. Please try again.'
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [lastValidatedPincode, validationResult]);

  /**
   * Clear validation result
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setLastValidatedPincode('');
  }, []);

  /**
   * Check if pincode is currently being validated
   */
  const isCurrentlyValidating = useCallback((pincode) => {
    return isValidating && pincode && pincode !== lastValidatedPincode;
  }, [isValidating, lastValidatedPincode]);

  /**
   * Get validation status for a specific pincode
   */
  const getValidationStatus = useCallback((pincode) => {
    if (!pincode) return 'empty';
    if (isCurrentlyValidating(pincode)) return 'validating';
    if (validationResult && validationResult.pincode === pincode) {
      return validationResult.isValid ? 'valid' : 'invalid';
    }
    return 'unvalidated';
  }, [validationResult, isCurrentlyValidating]);

  /**
   * Get validation message for display
   */
  const getValidationMessage = useCallback(() => {
    if (!validationResult) return '';
    
    if (validationResult.isValid) {
      return validationResult.message;
    } else {
      return validationResult.error;
    }
  }, [validationResult]);

  /**
   * Check if pincode is valid for the current validation result
   */
  const isPincodeValid = useCallback((pincode) => {
    return validationResult && 
           validationResult.pincode === pincode && 
           validationResult.isValid;
  }, [validationResult]);

  /**
   * Get delivery details for a valid pincode
   */
  const getDeliveryDetails = useCallback(() => {
    if (validationResult && validationResult.isValid) {
      return validationResult.details;
    }
    return null;
  }, [validationResult]);

  return {
    // State
    isValidating,
    validationResult,
    lastValidatedPincode,
    
    // Functions
    validatePincode,
    clearValidation,
    isCurrentlyValidating,
    getValidationStatus,
    getValidationMessage,
    isPincodeValid,
    getDeliveryDetails,
    
    // Convenience getters
    isValid: validationResult?.isValid || false,
    error: validationResult?.error || '',
    message: getValidationMessage(),
    details: getDeliveryDetails()
  };
};

export default usePincodeValidation;
