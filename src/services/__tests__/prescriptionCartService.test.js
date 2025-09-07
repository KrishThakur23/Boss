/**
 * Tests for Prescription Cart Service
 */

import PrescriptionCartService from '../prescriptionCartService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn()
    }))
  }
}));

describe('PrescriptionCartService', () => {
  
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };

  const mockPrescriptionItems = [
    {
      id: 'product-1',
      name: 'Paracetamol 500mg',
      originalName: 'Paracetamol',
      quantity: 2,
      price: 50,
      requiresPrescription: false,
      matchScore: 95,
      confidence: 90
    },
    {
      id: 'product-2',
      name: 'Aspirin 100mg',
      originalName: 'Aspirin',
      quantity: 1,
      price: 30,
      requiresPrescription: true,
      matchScore: 88,
      confidence: 85
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('addPrescriptionItemsToCart', () => {
    test('should add new prescription items to cart successfully', async () => {
      // Mock no existing items
      supabase.from().single.mockRejectedValue({ code: 'PGRST116' }); // No rows returned
      
      // Mock successful insert
      supabase.from().select.mockResolvedValue({
        data: { id: 'cart-item-1', quantity: 2 },
        error: null
      });

      const result = await PrescriptionCartService.addPrescriptionItemsToCart(
        mockPrescriptionItems,
        'rx_123'
      );

      expect(result.error).toBeNull();
      expect(result.data.success).toHaveLength(2);
      expect(result.data.errors).toHaveLength(0);
      expect(result.data.totalItems).toBe(2);
    });

    test('should update existing cart items', async () => {
      // Mock existing item
      supabase.from().single.mockResolvedValue({
        data: { id: 'cart-item-1', quantity: 1, user_id: mockUser.id, product_id: 'product-1' },
        error: null
      });

      // Mock successful update
      supabase.from().select.mockResolvedValue({
        data: { id: 'cart-item-1', quantity: 3 },
        error: null
      });

      const result = await PrescriptionCartService.addPrescriptionItemsToCart(
        [mockPrescriptionItems[0]],
        'rx_123'
      );

      expect(result.error).toBeNull();
      expect(result.data.success).toHaveLength(1);
      expect(result.data.success[0].action).toBe('updated');
      expect(result.data.success[0].quantity).toBe(3);
    });

    test('should handle authentication errors', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

      const result = await PrescriptionCartService.addPrescriptionItemsToCart(
        mockPrescriptionItems,
        'rx_123'
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('User not authenticated');
    });

    test('should handle empty prescription items', async () => {
      const result = await PrescriptionCartService.addPrescriptionItemsToCart([], 'rx_123');

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('No prescription items provided');
    });

    test('should handle individual item validation errors', async () => {
      const invalidItems = [
        { name: 'Valid Item', id: 'product-1', quantity: 1 },
        { name: 'Invalid Item' }, // Missing ID
        { name: 'Invalid Quantity', id: 'product-3', quantity: 15 } // Invalid quantity
      ];

      // Mock no existing items
      supabase.from().single.mockRejectedValue({ code: 'PGRST116' });
      
      // Mock successful insert for valid item
      supabase.from().select.mockResolvedValue({
        data: { id: 'cart-item-1', quantity: 1 },
        error: null
      });

      const result = await PrescriptionCartService.addPrescriptionItemsToCart(
        invalidItems,
        'rx_123'
      );

      expect(result.error).toBeNull();
      expect(result.data.success).toHaveLength(1);
      expect(result.data.errors).toHaveLength(2);
    });

    test('should handle database errors during cart operations', async () => {
      // Mock no existing items
      supabase.from().single.mockRejectedValue({ code: 'PGRST116' });
      
      // Mock database error during insert
      supabase.from().select.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed')
      });

      const result = await PrescriptionCartService.addPrescriptionItemsToCart(
        [mockPrescriptionItems[0]],
        'rx_123'
      );

      expect(result.error).toBeNull();
      expect(result.data.success).toHaveLength(0);
      expect(result.data.errors).toHaveLength(1);
      expect(result.data.errors[0].error).toContain('Database connection failed');
    });
  });

  describe('validatePrescriptionItem', () => {
    test('should validate correct prescription items', () => {
      const validItem = {
        id: 'product-1',
        name: 'Paracetamol',
        quantity: 2
      };

      const result = PrescriptionCartService.validatePrescriptionItem(validItem);
      expect(result.isValid).toBe(true);
    });

    test('should reject items without ID', () => {
      const invalidItem = {
        name: 'Paracetamol',
        quantity: 2
      };

      const result = PrescriptionCartService.validatePrescriptionItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Product ID is required');
    });

    test('should reject items without name', () => {
      const invalidItem = {
        id: 'product-1',
        quantity: 2
      };

      const result = PrescriptionCartService.validatePrescriptionItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Product name is required');
    });

    test('should reject items with invalid quantity', () => {
      const invalidItem = {
        id: 'product-1',
        name: 'Paracetamol',
        quantity: 15
      };

      const result = PrescriptionCartService.validatePrescriptionItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Quantity must be between 1 and 10');
    });

    test('should handle null item', () => {
      const result = PrescriptionCartService.validatePrescriptionItem(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Item is required');
    });
  });

  describe('validatePrescriptionRequirements', () => {
    test('should validate cart items with no prescription requirements', () => {
      const cartItems = [
        { requires_prescription_verification: false, is_prescription_item: false },
        { requires_prescription_verification: false, is_prescription_item: true }
      ];

      const result = PrescriptionCartService.validatePrescriptionRequirements(cartItems);
      expect(result.isValid).toBe(true);
      expect(result.prescriptionRequired).toBe(0);
      expect(result.prescriptionOptional).toBe(1);
      expect(result.requiresPharmacyReview).toBe(false);
    });

    test('should identify items requiring prescription verification', () => {
      const cartItems = [
        { 
          requires_prescription_verification: true, 
          is_prescription_item: true,
          product_name: 'Controlled Medicine'
        },
        { requires_prescription_verification: false, is_prescription_item: true }
      ];

      const result = PrescriptionCartService.validatePrescriptionRequirements(cartItems);
      expect(result.isValid).toBe(false);
      expect(result.prescriptionRequired).toBe(1);
      expect(result.prescriptionOptional).toBe(1);
      expect(result.requiresPharmacyReview).toBe(true);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('prescription_required');
    });
  });

  describe('getPrescriptionCartItems', () => {
    test('should retrieve prescription cart items successfully', async () => {
      const mockCartItems = [
        {
          id: 'cart-1',
          product_id: 'product-1',
          quantity: 2,
          products: {
            name: 'Paracetamol 500mg',
            price: 50,
            in_stock: true
          }
        }
      ];

      supabase.from().select.mockResolvedValue({
        data: mockCartItems,
        error: null
      });

      const result = await PrescriptionCartService.getPrescriptionCartItems('user-123', 'rx_123');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCartItems);
    });

    test('should handle database errors', async () => {
      supabase.from().select.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      const result = await PrescriptionCartService.getPrescriptionCartItems('user-123', 'rx_123');

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('updatePrescriptionItemQuantity', () => {
    test('should update item quantity successfully', async () => {
      supabase.from().select.mockResolvedValue({
        data: { id: 'cart-1', quantity: 3 },
        error: null
      });

      const result = await PrescriptionCartService.updatePrescriptionItemQuantity('cart-1', 3);

      expect(result.error).toBeNull();
      expect(result.data.quantity).toBe(3);
    });

    test('should reject invalid quantities', async () => {
      const result1 = await PrescriptionCartService.updatePrescriptionItemQuantity('cart-1', 0);
      expect(result1.error).toBeDefined();
      expect(result1.error.message).toContain('Quantity must be between 1 and 10');

      const result2 = await PrescriptionCartService.updatePrescriptionItemQuantity('cart-1', 15);
      expect(result2.error).toBeDefined();
      expect(result2.error.message).toContain('Quantity must be between 1 and 10');
    });
  });

  describe('getPrescriptionCartSummary', () => {
    test('should calculate cart summary correctly', async () => {
      const mockCartItems = [
        {
          quantity: 2,
          requires_prescription_verification: true,
          products: { price: 50, in_stock: true }
        },
        {
          quantity: 1,
          requires_prescription_verification: false,
          products: { price: 30, in_stock: false }
        }
      ];

      supabase.from().select.mockResolvedValue({
        data: mockCartItems,
        error: null
      });

      const result = await PrescriptionCartService.getPrescriptionCartSummary('user-123', 'rx_123');

      expect(result.error).toBeNull();
      expect(result.data.totalItems).toBe(2);
      expect(result.data.totalQuantity).toBe(3);
      expect(result.data.totalAmount).toBe(130); // (50 * 2) + (30 * 1)
      expect(result.data.prescriptionRequired).toBe(1);
      expect(result.data.inStockItems).toBe(1);
      expect(result.data.outOfStockItems).toBe(1);
    });
  });

  describe('handleCartError', () => {
    test('should handle authentication errors', () => {
      const error = new Error('User not authenticated');
      const errorInfo = PrescriptionCartService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('sign in');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions).toContain('Sign in to your account');
    });

    test('should handle product not found errors', () => {
      const error = new Error('Product not found');
      const errorInfo = PrescriptionCartService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('no longer available');
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.suggestions[0]).toContain('similar products');
    });

    test('should handle quantity errors', () => {
      const error = new Error('Invalid quantity specified');
      const errorInfo = PrescriptionCartService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('Invalid quantity');
      expect(errorInfo.suggestions[0]).toContain('between 1 and 10');
    });

    test('should handle network errors', () => {
      const error = new Error('Network connection failed');
      const errorInfo = PrescriptionCartService.handleCartError(error);

      expect(errorInfo.userMessage).toContain('Network error');
      expect(errorInfo.suggestions[0]).toContain('internet connection');
    });

    test('should handle generic errors', () => {
      const error = new Error('Unknown error');
      const errorInfo = PrescriptionCartService.handleCartError(error);

      expect(errorInfo.userMessage).toBe('Failed to add item to cart');
      expect(errorInfo.retryable).toBe(true);
    });
  });
});
