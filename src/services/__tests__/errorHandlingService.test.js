/**
 * Tests for Error Handling Service
 */

import ErrorHandlingService from '../errorHandlingService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock navigator
global.navigator = {
  userAgent: 'Test User Agent'
};

// Mock window
global.window = {
  location: {
    href: 'http://localhost:3000/test'
  }
};

describe('ErrorHandlingService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  describe('handleOCRError', () => {
    test('should handle file upload errors', () => {
      const error = new Error('Invalid file format');
      const context = { fileName: 'test.txt' };

      const errorInfo = ErrorHandlingService.handleOCRError(error, context);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.OCR_ERROR);
      expect(errorInfo.userMessage).toContain('Invalid file');
      expect(errorInfo.suggestions).toContain('Ensure the file is a valid image (JPEG, PNG) or PDF');
      expect(errorInfo.retryable).toBe(true);
      expect(errorInfo.context).toEqual(context);
    });

    test('should handle text extraction errors', () => {
      const error = new Error('Could not extract text from image');
      const errorInfo = ErrorHandlingService.handleOCRError(error);

      expect(errorInfo.userMessage).toContain('Could not read text');
      expect(errorInfo.suggestions).toContain('Ensure the prescription image is clear and well-lit');
    });

    test('should handle image quality errors', () => {
      const error = new Error('Image quality too low');
      const errorInfo = ErrorHandlingService.handleOCRError(error);

      expect(errorInfo.userMessage).toContain('quality is too low');
      expect(errorInfo.suggestions).toContain('Take a clearer photo');
    });

    test('should handle medicine detection errors', () => {
      const error = new Error('No medicine names found');
      const errorInfo = ErrorHandlingService.handleOCRError(error);

      expect(errorInfo.userMessage).toContain('No medicine names could be detected');
      expect(errorInfo.suggestions).toContain('Ensure the prescription contains medicine names');
    });
  });

  describe('handleMatchingError', () => {
    test('should handle database connection errors', () => {
      const error = new Error('Database connection timeout');
      const errorInfo = ErrorHandlingService.handleMatchingError(error);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.MATCHING_ERROR);
      expect(errorInfo.userMessage).toContain('Database connection error');
      expect(errorInfo.suggestions).toContain('Check your internet connection');
    });

    test('should handle search service errors', () => {
      const error = new Error('Search query failed');
      const errorInfo = ErrorHandlingService.handleMatchingError(error);

      expect(errorInfo.userMessage).toContain('Search service temporarily unavailable');
      expect(errorInfo.suggestions).toContain('Try searching again');
    });

    test('should handle timeout errors', () => {
      const error = new Error('Request timeout exceeded');
      const errorInfo = ErrorHandlingService.handleMatchingError(error);

      expect(errorInfo.userMessage).toContain('took too long to complete');
      expect(errorInfo.suggestions).toContain('Try again with a simpler prescription');
    });

    test('should handle no matches found', () => {
      const error = new Error('No matches found in database');
      const errorInfo = ErrorHandlingService.handleMatchingError(error);

      expect(errorInfo.userMessage).toContain('No matching medicines found');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions).toContain('Try searching for individual medicine names manually');
    });
  });

  describe('handleCartError', () => {
    test('should handle authentication errors', () => {
      const error = new Error('User not authenticated');
      const errorInfo = ErrorHandlingService.handleCartError(error);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.AUTHENTICATION_ERROR);
      expect(errorInfo.userMessage).toContain('Please sign in');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions).toContain('Sign in to your account');
    });

    test('should handle product availability errors', () => {
      const error = new Error('Product not available');
      const errorInfo = ErrorHandlingService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('no longer available');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions).toContain('Try searching for similar products');
    });

    test('should handle quantity validation errors', () => {
      const error = new Error('Invalid quantity specified');
      const errorInfo = ErrorHandlingService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('Invalid quantity');
      expect(errorInfo.suggestions).toContain('Quantity must be between 1 and 10');
    });

    test('should handle stock errors', () => {
      const error = new Error('Product out of stock');
      const errorInfo = ErrorHandlingService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('currently out of stock');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions).toContain('Try again later when stock is replenished');
    });
  });

  describe('handleGeneralError', () => {
    test('should handle network errors', () => {
      const error = new Error('Network fetch failed');
      const errorInfo = ErrorHandlingService.handleGeneralError(error);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.NETWORK_ERROR);
      expect(errorInfo.userMessage).toContain('Network connection error');
      expect(errorInfo.suggestions).toContain('Check your internet connection');
    });

    test('should handle validation errors', () => {
      const error = new Error('Invalid data provided');
      const errorInfo = ErrorHandlingService.handleGeneralError(error);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.VALIDATION_ERROR);
      expect(errorInfo.userMessage).toContain('Invalid data provided');
      expect(errorInfo.suggestions).toContain('Check that all required fields are filled');
    });

    test('should handle unknown errors', () => {
      const error = new Error('Something went wrong');
      const errorInfo = ErrorHandlingService.handleGeneralError(error);

      expect(errorInfo.type).toBe(ErrorHandlingService.ERROR_TYPES.GENERAL_ERROR);
      expect(errorInfo.userMessage).toBe('An unexpected error occurred');
      expect(errorInfo.retryable).toBe(true);
    });
  });

  describe('logError', () => {
    test('should log error to console and localStorage', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const errorInfo = {
        type: 'test_error',
        userMessage: 'Test error',
        technicalMessage: 'Technical details',
        retryable: true,
        context: { test: true }
      };

      ErrorHandlingService.logError(errorInfo, { additional: 'context' });

      expect(consoleSpy).toHaveBeenCalledWith('🚨 Error logged:', expect.objectContaining({
        type: 'test_error',
        userMessage: 'Test error',
        context: { test: true, additional: 'context' }
      }));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'errorLogs',
        expect.stringContaining('test_error')
      );

      consoleSpy.mockRestore();
    });

    test('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const errorInfo = {
        type: 'test_error',
        userMessage: 'Test error',
        technicalMessage: 'Technical details',
        retryable: true
      };

      ErrorHandlingService.logError(errorInfo);

      expect(warnSpy).toHaveBeenCalledWith('Failed to store error log:', expect.any(Error));

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('getErrorMessageProps', () => {
    test('should return correct props for UI components', () => {
      const errorInfo = {
        type: ErrorHandlingService.ERROR_TYPES.OCR_ERROR,
        userMessage: 'Test error message',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        retryable: true,
        technicalMessage: 'Technical details'
      };

      const props = ErrorHandlingService.getErrorMessageProps(errorInfo);

      expect(props.title).toBe('Prescription Processing Failed');
      expect(props.message).toBe('Test error message');
      expect(props.suggestions).toEqual(['Suggestion 1', 'Suggestion 2']);
      expect(props.retryable).toBe(true);
      expect(props.technicalDetails).toBe('Technical details');
      expect(props.type).toBe('error');
    });
  });

  describe('getErrorTitle', () => {
    test('should return correct titles for different error types', () => {
      expect(ErrorHandlingService.getErrorTitle(ErrorHandlingService.ERROR_TYPES.OCR_ERROR))
        .toBe('Prescription Processing Failed');
      
      expect(ErrorHandlingService.getErrorTitle(ErrorHandlingService.ERROR_TYPES.MATCHING_ERROR))
        .toBe('Medicine Matching Failed');
      
      expect(ErrorHandlingService.getErrorTitle(ErrorHandlingService.ERROR_TYPES.CART_ERROR))
        .toBe('Cart Operation Failed');
      
      expect(ErrorHandlingService.getErrorTitle('unknown_error'))
        .toBe('Error Occurred');
    });
  });

  describe('createRetryFunction', () => {
    test('should create a retry function that works on success', async () => {
      const mockFunction = jest.fn().mockResolvedValue('success');
      const retryFn = ErrorHandlingService.createRetryFunction(mockFunction, ['arg1', 'arg2']);

      const result = await retryFn();

      expect(result).toBe('success');
      expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure up to max retries', async () => {
      const mockFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const retryFn = ErrorHandlingService.createRetryFunction(mockFunction, [], 3);

      const result = await retryFn();

      expect(result).toBe('success');
      expect(mockFunction).toHaveBeenCalledTimes(3);
    });

    test('should throw error after max retries exceeded', async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error('Always fails'));
      const retryFn = ErrorHandlingService.createRetryFunction(mockFunction, [], 2);

      await expect(retryFn()).rejects.toThrow('Always fails');
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleBatchErrors', () => {
    test('should handle multiple errors correctly', () => {
      const errors = [
        new Error('Network error'),
        new Error('Validation failed'),
        new Error('Database timeout')
      ];

      const result = ErrorHandlingService.handleBatchErrors(errors, { operation: 'batch_test' });

      expect(result.type).toBe('batch_error');
      expect(result.userMessage).toContain('3 errors occurred');
      expect(result.context.errorCount).toBe(3);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should return null for empty error array', () => {
      const result = ErrorHandlingService.handleBatchErrors([]);
      expect(result).toBeNull();
    });

    test('should return null for null/undefined input', () => {
      expect(ErrorHandlingService.handleBatchErrors(null)).toBeNull();
      expect(ErrorHandlingService.handleBatchErrors(undefined)).toBeNull();
    });
  });

  describe('isRecoverableError', () => {
    test('should identify recoverable errors', () => {
      expect(ErrorHandlingService.isRecoverableError(new Error('Network timeout'))).toBe(true);
      expect(ErrorHandlingService.isRecoverableError(new Error('Connection failed'))).toBe(true);
      expect(ErrorHandlingService.isRecoverableError(new Error('Temporary service unavailable'))).toBe(true);
      expect(ErrorHandlingService.isRecoverableError(new Error('Rate limit exceeded'))).toBe(true);
    });

    test('should identify non-recoverable errors', () => {
      expect(ErrorHandlingService.isRecoverableError(new Error('Invalid credentials'))).toBe(false);
      expect(ErrorHandlingService.isRecoverableError(new Error('Permission denied'))).toBe(false);
      expect(ErrorHandlingService.isRecoverableError(new Error('Resource not found'))).toBe(false);
    });
  });

  describe('getRecoverySuggestions', () => {
    test('should provide recovery suggestions for recoverable errors', () => {
      const networkError = new Error('Network connection failed');
      const suggestions = ErrorHandlingService.getRecoverySuggestions(networkError);

      expect(suggestions).toContain('Try the operation again');
      expect(suggestions).toContain('Check your internet connection');
    });

    test('should provide different suggestions for timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const suggestions = ErrorHandlingService.getRecoverySuggestions(timeoutError);

      expect(suggestions).toContain('Wait a moment before trying again');
      expect(suggestions).toContain('Try with a smaller file or simpler request');
    });

    test('should provide generic suggestions for non-recoverable errors', () => {
      const authError = new Error('Access denied');
      const suggestions = ErrorHandlingService.getRecoverySuggestions(authError);

      expect(suggestions).toContain('Contact support for assistance');
      expect(suggestions).toContain('Try a different approach to complete your task');
    });
  });
});
