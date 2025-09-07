/**
 * Error Handling Service
 * Centralized error handling and user feedback for prescription matching
 */

export default class ErrorHandlingService {
  
  /**
   * Error types for categorization
   */
  static ERROR_TYPES = {
    OCR_ERROR: 'ocr_error',
    MATCHING_ERROR: 'matching_error',
    CART_ERROR: 'cart_error',
    NETWORK_ERROR: 'network_error',
    VALIDATION_ERROR: 'validation_error',
    AUTHENTICATION_ERROR: 'auth_error',
    GENERAL_ERROR: 'general_error'
  };

  /**
   * Handle OCR processing errors
   * @param {Error} error - Original error
   * @param {Object} context - Error context (file info, etc.)
   * @returns {Object} Structured error information
   */
  static handleOCRError(error, context = {}) {
    const errorInfo = {
      type: this.ERROR_TYPES.OCR_ERROR,
      userMessage: 'Failed to process prescription image',
      technicalMessage: error.message,
      retryable: true,
      suggestions: [],
      context
    };

    if (error.message.includes('file') || error.message.includes('upload')) {
      errorInfo.userMessage = 'Invalid file or upload failed';
      errorInfo.suggestions = [
        'Ensure the file is a valid image (JPEG, PNG) or PDF',
        'Check that the file size is under 10MB',
        'Try uploading the file again'
      ];
    } else if (error.message.includes('text') || error.message.includes('extract')) {
      errorInfo.userMessage = 'Could not read text from the prescription';
      errorInfo.suggestions = [
        'Ensure the prescription image is clear and well-lit',
        'Try taking a new photo with better lighting',
        'Make sure all text is visible and not cut off',
        'Avoid shadows or glare on the prescription'
      ];
    } else if (error.message.includes('quality') || error.message.includes('blur')) {
      errorInfo.userMessage = 'Prescription image quality is too low';
      errorInfo.suggestions = [
        'Take a clearer photo of the prescription',
        'Ensure the camera is focused properly',
        'Use good lighting when taking the photo',
        'Hold the camera steady to avoid blur'
      ];
    } else if (error.message.includes('medicine') || error.message.includes('names')) {
      errorInfo.userMessage = 'No medicine names could be detected';
      errorInfo.suggestions = [
        'Ensure the prescription contains medicine names',
        'Check that the medicine names are clearly visible',
        'Try uploading a different section of the prescription',
        'Contact support if the prescription is handwritten'
      ];
    }

    return errorInfo;
  }

  /**
   * Handle medicine matching errors
   * @param {Error} error - Original error
   * @param {Object} context - Error context (search terms, etc.)
   * @returns {Object} Structured error information
   */
  static handleMatchingError(error, context = {}) {
    const errorInfo = {
      type: this.ERROR_TYPES.MATCHING_ERROR,
      userMessage: 'Failed to find matching medicines',
      technicalMessage: error.message,
      retryable: true,
      suggestions: [],
      context
    };

    if (error.message.includes('database') || error.message.includes('connection')) {
      errorInfo.userMessage = 'Database connection error';
      errorInfo.suggestions = [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ];
    } else if (error.message.includes('search') || error.message.includes('query')) {
      errorInfo.userMessage = 'Search service temporarily unavailable';
      errorInfo.suggestions = [
        'Try searching again',
        'Check your internet connection',
        'Contact support if the issue continues'
      ];
    } else if (error.message.includes('timeout')) {
      errorInfo.userMessage = 'Search took too long to complete';
      errorInfo.suggestions = [
        'Try again with a simpler prescription',
        'Check your internet connection',
        'Contact support if timeouts persist'
      ];
    } else if (error.message.includes('no matches') || error.message.includes('not found')) {
      errorInfo.userMessage = 'No matching medicines found in our database';
      errorInfo.retryable = false;
      errorInfo.suggestions = [
        'Try searching for individual medicine names manually',
        'Contact our pharmacy team for assistance',
        'Check if the medicine names are spelled correctly'
      ];
    }

    return errorInfo;
  }

  /**
   * Handle cart operation errors
   * @param {Error} error - Original error
   * @param {Object} context - Error context (item info, etc.)
   * @returns {Object} Structured error information
   */
  static handleCartError(error, context = {}) {
    const errorInfo = {
      type: this.ERROR_TYPES.CART_ERROR,
      userMessage: 'Failed to add item to cart',
      technicalMessage: error.message,
      retryable: true,
      suggestions: [],
      context
    };

    if (error.message.includes('authentication') || error.message.includes('login')) {
      errorInfo.type = this.ERROR_TYPES.AUTHENTICATION_ERROR;
      errorInfo.userMessage = 'Please sign in to add items to cart';
      errorInfo.retryable = false;
      errorInfo.suggestions = [
        'Sign in to your account',
        'Create an account if you don\'t have one'
      ];
    } else if (error.message.includes('product') || error.message.includes('not available')) {
      errorInfo.userMessage = 'This product is no longer available';
      errorInfo.retryable = false;
      errorInfo.suggestions = [
        'Try searching for similar products',
        'Contact our pharmacy team for alternatives'
      ];
    } else if (error.message.includes('quantity')) {
      errorInfo.userMessage = 'Invalid quantity specified';
      errorInfo.suggestions = [
        'Quantity must be between 1 and 10',
        'Adjust the quantity and try again'
      ];
    } else if (error.message.includes('stock') || error.message.includes('inventory')) {
      errorInfo.userMessage = 'Product is currently out of stock';
      errorInfo.retryable = false;
      errorInfo.suggestions = [
        'Try again later when stock is replenished',
        'Look for alternative products',
        'Contact us to check availability'
      ];
    }

    return errorInfo;
  }

  /**
   * Handle general application errors
   * @param {Error} error - Original error
   * @param {Object} context - Error context
   * @returns {Object} Structured error information
   */
  static handleGeneralError(error, context = {}) {
    const errorInfo = {
      type: this.ERROR_TYPES.GENERAL_ERROR,
      userMessage: 'An unexpected error occurred',
      technicalMessage: error.message,
      retryable: true,
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists'
      ],
      context
    };

    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorInfo.type = this.ERROR_TYPES.NETWORK_ERROR;
      errorInfo.userMessage = 'Network connection error';
      errorInfo.suggestions = [
        'Check your internet connection',
        'Try again in a few moments',
        'Switch to a different network if available'
      ];
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorInfo.type = this.ERROR_TYPES.VALIDATION_ERROR;
      errorInfo.userMessage = 'Invalid data provided';
      errorInfo.suggestions = [
        'Check that all required fields are filled',
        'Ensure data is in the correct format',
        'Try uploading a different file'
      ];
    }

    return errorInfo;
  }

  /**
   * Log error for monitoring and debugging
   * @param {Object} errorInfo - Structured error information
   * @param {Object} additionalContext - Additional context for logging
   */
  static logError(errorInfo, additionalContext = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: errorInfo.type,
      userMessage: errorInfo.userMessage,
      technicalMessage: errorInfo.technicalMessage,
      retryable: errorInfo.retryable,
      context: { ...errorInfo.context, ...additionalContext },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console for development
    console.error('🚨 Error logged:', logEntry);

    // In production, you would send this to your logging service
    // Example: LoggingService.sendError(logEntry);
    
    // Store in local storage for debugging (optional)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  }

  /**
   * Get user-friendly error message props for UI components
   * @param {Object} errorInfo - Structured error information
   * @returns {Object} Props for error message components
   */
  static getErrorMessageProps(errorInfo) {
    return {
      title: this.getErrorTitle(errorInfo.type),
      message: errorInfo.userMessage,
      suggestions: errorInfo.suggestions,
      retryable: errorInfo.retryable,
      technicalDetails: errorInfo.technicalMessage,
      type: 'error'
    };
  }

  /**
   * Get appropriate error title based on error type
   * @param {string} errorType - Error type
   * @returns {string} User-friendly error title
   */
  static getErrorTitle(errorType) {
    const titles = {
      [this.ERROR_TYPES.OCR_ERROR]: 'Prescription Processing Failed',
      [this.ERROR_TYPES.MATCHING_ERROR]: 'Medicine Matching Failed',
      [this.ERROR_TYPES.CART_ERROR]: 'Cart Operation Failed',
      [this.ERROR_TYPES.NETWORK_ERROR]: 'Connection Error',
      [this.ERROR_TYPES.VALIDATION_ERROR]: 'Invalid Input',
      [this.ERROR_TYPES.AUTHENTICATION_ERROR]: 'Authentication Required',
      [this.ERROR_TYPES.GENERAL_ERROR]: 'Unexpected Error'
    };

    return titles[errorType] || 'Error Occurred';
  }

  /**
   * Create retry function for retryable errors
   * @param {Function} originalFunction - Function to retry
   * @param {Array} args - Arguments for the function
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Function} Retry function
   */
  static createRetryFunction(originalFunction, args = [], maxRetries = 3) {
    let retryCount = 0;

    return async () => {
      if (retryCount >= maxRetries) {
        throw new Error(`Maximum retry attempts (${maxRetries}) exceeded`);
      }

      retryCount++;
      
      try {
        return await originalFunction(...args);
      } catch (error) {
        if (retryCount < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          throw error; // Re-throw to trigger another retry
        } else {
          throw error;
        }
      }
    };
  }

  /**
   * Handle multiple errors (batch operations)
   * @param {Array} errors - Array of errors
   * @param {Object} context - Shared context
   * @returns {Object} Consolidated error information
   */
  static handleBatchErrors(errors, context = {}) {
    if (!errors || errors.length === 0) {
      return null;
    }

    const errorsByType = {};
    const allSuggestions = new Set();
    let hasRetryableErrors = false;

    errors.forEach(error => {
      const errorInfo = this.handleGeneralError(error, context);
      
      if (!errorsByType[errorInfo.type]) {
        errorsByType[errorInfo.type] = [];
      }
      errorsByType[errorInfo.type].push(errorInfo);
      
      if (errorInfo.retryable) {
        hasRetryableErrors = true;
      }
      
      errorInfo.suggestions.forEach(suggestion => allSuggestions.add(suggestion));
    });

    const primaryErrorType = Object.keys(errorsByType)[0];
    const errorCount = errors.length;

    return {
      type: 'batch_error',
      userMessage: `${errorCount} error${errorCount > 1 ? 's' : ''} occurred during processing`,
      technicalMessage: `Multiple errors: ${errors.map(e => e.message).join('; ')}`,
      retryable: hasRetryableErrors,
      suggestions: Array.from(allSuggestions),
      errorsByType,
      context: { ...context, errorCount }
    };
  }

  /**
   * Check if error is recoverable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is likely recoverable
   */
  static isRecoverableError(error) {
    const recoverablePatterns = [
      /network/i,
      /connection/i,
      /timeout/i,
      /temporary/i,
      /retry/i,
      /rate limit/i
    ];

    return recoverablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Get error recovery suggestions
   * @param {Error} error - Error to analyze
   * @returns {Array} Array of recovery suggestions
   */
  static getRecoverySuggestions(error) {
    const suggestions = [];

    if (this.isRecoverableError(error)) {
      suggestions.push('Try the operation again');
      
      if (error.message.includes('network') || error.message.includes('connection')) {
        suggestions.push('Check your internet connection');
        suggestions.push('Switch to a different network if available');
      }
      
      if (error.message.includes('timeout')) {
        suggestions.push('Wait a moment before trying again');
        suggestions.push('Try with a smaller file or simpler request');
      }
    } else {
      suggestions.push('Contact support for assistance');
      suggestions.push('Try a different approach to complete your task');
    }

    return suggestions;
  }
}
