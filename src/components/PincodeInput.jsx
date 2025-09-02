import React, { useState, useEffect } from 'react';
import usePincodeValidation from '../hooks/usePincodeValidation';
import './PincodeInput.css';

const PincodeInput = ({
  value = '',
  onChange,
  onValidationChange,
  placeholder = 'Enter 6-digit pincode',
  className = '',
  disabled = false,
  required = false,
  showValidationMessage = true,
  autoValidate = true,
  debounceMs = 500
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const {
    isValidating,
    validationResult,
    validatePincode,
    clearValidation,
    getValidationStatus,
    getValidationMessage,
    isValid,
    error,
    message,
    details
  } = usePincodeValidation();

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Clear validation when input is cleared
  useEffect(() => {
    if (!inputValue) {
      clearValidation();
    }
  }, [inputValue, clearValidation]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Call external onChange if provided
    if (onChange) {
      onChange(e);
    }

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for validation
    if (autoValidate && newValue.length === 6) {
      const timer = setTimeout(() => {
        validatePincode(newValue);
      }, debounceMs);
      setDebounceTimer(timer);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    
    if (autoValidate && inputValue.length === 6) {
      validatePincode(inputValue);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    // Clear validation when user starts typing again
    if (validationResult && validationResult.pincode !== inputValue) {
      clearValidation();
    }
  };

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange({
        isValid,
        error,
        message,
        details,
        pincode: inputValue
      });
    }
  }, [isValid, error, message, details, inputValue, onValidationChange]);

  // Get validation status for current input
  const validationStatus = getValidationStatus(inputValue);

  // Get CSS classes
  const getInputClasses = () => {
    const baseClasses = ['pincode-input'];
    
    if (className) baseClasses.push(className);
    if (validationStatus === 'valid') baseClasses.push('valid');
    if (validationStatus === 'invalid') baseClasses.push('invalid');
    if (validationStatus === 'validating') baseClasses.push('validating');
    if (disabled) baseClasses.push('disabled');
    
    return baseClasses.join(' ');
  };

  // Get status icon
  const getStatusIcon = () => {
    if (validationStatus === 'validating') {
      return <span className="status-icon loading">⏳</span>;
    }
    if (validationStatus === 'valid') {
      return <span className="status-icon valid">✅</span>;
    }
    if (validationStatus === 'invalid') {
      return <span className="status-icon invalid">❌</span>;
    }
    return null;
  };

  return (
    <div className="pincode-input-container">
      <div className="input-wrapper">
        <input
          type="text"
          className={getInputClasses()}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={6}
          pattern="[0-9]{6}"
          inputMode="numeric"
        />
        {getStatusIcon()}
      </div>
      
      {showValidationMessage && (
        <div className={`validation-message ${validationStatus}`}>
          {validationStatus === 'validating' && (
            <span className="loading-text">Validating pincode...</span>
          )}
          {validationStatus === 'valid' && (
            <span className="success-text">{message}</span>
          )}
          {validationStatus === 'invalid' && (
            <span className="error-text">{error}</span>
          )}
        </div>
      )}
      
      {details && validationStatus === 'valid' && (
        <div className="delivery-info">
          <div className="delivery-details">
            <span className="city-state">{details.city}, {details.state}</span>
            {details.delivery_charge > 0 ? (
              <span className="delivery-charge">Delivery: ₹{details.delivery_charge}</span>
            ) : (
              <span className="free-delivery">Free Delivery!</span>
            )}
            <span className="delivery-time">Estimated: {details.estimated_delivery_days} day{details.estimated_delivery_days !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeInput;
