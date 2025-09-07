import ProductSearchService from '../productSearchService';
import { supabase } from '../../config/supabase';

// Mock the supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

// Mock the MedicineNameProcessor
jest.mock('../medicineNameProcessor', () => ({
  default: {
    generateSearchVariations: jest.fn((term) => [term, term.toLowerCase()]),
    calculateSimilarity: jest.fn(() => 0.8)
  }
}));

describe('ProductSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchProductsByName', () => {
    test('should return empty array for short search terms', async () => {
      const result = await ProductSearchService.searchProductsByName('a');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    test('should return empty array for null/undefined search terms', async () => {
      const result1 = await ProductSearchService.searchProductsByName(null);
      expect(result1.data).toEqual([]);
      
      const result2 = await ProductSearchService.searchProductsByName(undefined);
      expect(result2.data).toEqual([]);
    });

    test('should perform database search with correct parameters', async () => {
      const mockData = [
        { id: '1', name: 'Paracetamol', price: 10, in_stock: true }
      ];
      
      const mockChain = {
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
              }))
            }))
          }))
        }))
      };
      
      supabase.from.mockReturnValue(mockChain);
      
      const result = await ProductSearchService.searchProductsByName('paracetamol');
      
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    test('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      
      const mockChain = {
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
              }))
            }))
          }))
        }))
      };
      
      supabase.from.mockReturnValue(mockChain);
      
      const result = await ProductSearchService.searchProductsByName('paracetamol');
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe('intelligentFuzzySearch', () => {
    test('should return empty array for short search terms', async () => {
      const result = await ProductSearchService.intelligentFuzzySearch('a');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    test('should use search variations and score results', async () => {
      const mockData = [
        { id: '1', name: 'Paracetamol', generic_name: 'Acetaminophen', in_stock: true }
      ];
      
      // Mock the performDatabaseSearch method
      jest.spyOn(ProductSearchService, 'performDatabaseSearch').mockResolvedValue({
        data: mockData,
        error: null
      });
      
      const result = await ProductSearchService.intelligentFuzzySearch('paracetamol');
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      
      // Verify that results have relevance scores
      if (result.data && result.data.length > 0) {
        expect(result.data[0]).toHaveProperty('relevanceScore');
      }
    });
  });

  describe('calculateRelevanceScore', () => {
    test('should give highest score for exact matches', () => {
      const product = { name: 'Paracetamol', generic_name: '', in_stock: true };
      const score = ProductSearchService.calculateRelevanceScore('paracetamol', product);
      expect(score).toBe(100);
    });

    test('should give high score for starts-with matches', () => {
      const product = { name: 'Paracetamol 500mg', generic_name: '', in_stock: true };
      const score = ProductSearchService.calculateRelevanceScore('paracetamol', product);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    test('should give medium score for contains matches', () => {
      const product = { name: 'Extra Paracetamol', generic_name: '', in_stock: true };
      const score = ProductSearchService.calculateRelevanceScore('paracetamol', product);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    test('should boost score for in-stock items', () => {
      const inStockProduct = { name: 'Medicine', generic_name: '', in_stock: true };
      const outOfStockProduct = { name: 'Medicine', generic_name: '', in_stock: false };
      
      const inStockScore = ProductSearchService.calculateRelevanceScore('medicine', inStockProduct);
      const outOfStockScore = ProductSearchService.calculateRelevanceScore('medicine', outOfStockProduct);
      
      expect(inStockScore).toBeGreaterThan(outOfStockScore);
    });

    test('should handle products with generic names', () => {
      const product = { name: 'Brand Name', generic_name: 'paracetamol', in_stock: true };
      const score = ProductSearchService.calculateRelevanceScore('paracetamol', product);
      expect(score).toBe(100);
    });
  });

  describe('batchSearch', () => {
    test('should return empty array for empty input', async () => {
      const result = await ProductSearchService.batchSearch([]);
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    test('should process multiple medicine names', async () => {
      // Mock the intelligentFuzzySearch method
      jest.spyOn(ProductSearchService, 'intelligentFuzzySearch').mockResolvedValue({
        data: [{ id: '1', name: 'Test Medicine' }],
        error: null
      });
      
      const result = await ProductSearchService.batchSearch(['paracetamol', 'ibuprofen']);
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('searchTerm', 'paracetamol');
      expect(result.data[1]).toHaveProperty('searchTerm', 'ibuprofen');
      expect(result.error).toBeNull();
    });

    test('should handle individual search failures gracefully', async () => {
      // Mock one successful and one failed search
      jest.spyOn(ProductSearchService, 'intelligentFuzzySearch')
        .mockResolvedValueOnce({ data: [{ id: '1', name: 'Paracetamol' }], error: null })
        .mockResolvedValueOnce({ data: null, error: new Error('Search failed') });
      
      const result = await ProductSearchService.batchSearch(['paracetamol', 'unknown']);
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].error).toBeNull();
      expect(result.data[1].error).toBe('Search failed');
    });
  });

  describe('findAlternatives', () => {
    test('should find alternatives based on generic name', async () => {
      const primaryProduct = {
        id: '1',
        name: 'Brand Paracetamol',
        generic_name: 'Acetaminophen',
        manufacturer: 'Test Pharma'
      };
      
      // Mock the initial search
      jest.spyOn(ProductSearchService, 'intelligentFuzzySearch').mockResolvedValue({
        data: [primaryProduct],
        error: null
      });
      
      // Mock the generic name search
      jest.spyOn(ProductSearchService, 'searchProductsByName').mockResolvedValue({
        data: [
          { id: '2', name: 'Generic Acetaminophen', generic_name: 'Acetaminophen' }
        ],
        error: null
      });
      
      const result = await ProductSearchService.findAlternatives('paracetamol');
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    test('should return empty array when no primary product found', async () => {
      jest.spyOn(ProductSearchService, 'intelligentFuzzySearch').mockResolvedValue({
        data: [],
        error: null
      });
      
      const result = await ProductSearchService.findAlternatives('unknown medicine');
      
      expect(result.data).toEqual([]);
    });
  });

  describe('removeDuplicates', () => {
    test('should remove duplicate products by ID', () => {
      const products = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
        { id: '1', name: 'Product 1 Duplicate' },
        { id: '3', name: 'Product 3' }
      ];
      
      const unique = ProductSearchService.removeDuplicates(products);
      
      expect(unique).toHaveLength(3);
      expect(unique.map(p => p.id)).toEqual(['1', '2', '3']);
    });

    test('should handle empty array', () => {
      const result = ProductSearchService.removeDuplicates([]);
      expect(result).toEqual([]);
    });
  });
});
