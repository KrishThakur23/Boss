/**
 * Tests for Prescription Matching Service
 */

import PrescriptionMatchingService from '../prescriptionMatchingService';
import ProductSearchService from '../productSearchService';
import MedicineNameProcessor from '../medicineNameProcessor';

// Mock the dependencies
jest.mock('../productSearchService');
jest.mock('../medicineNameProcessor');

describe('PrescriptionMatchingService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processOCRResults', () => {
    test('should process OCR results successfully', async () => {
      const mockOCRData = {
        medicineNames: ['Paracetamol 500mg', 'Aspirin 100mg'],
        confidence: 85,
        rawText: 'Prescription text...'
      };

      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: [{
            id: '1',
            name: 'Paracetamol 500mg',
            price: 50,
            in_stock: true,
            relevanceScore: 95
          }],
          error: null
        },
        {
          searchTerm: 'Aspirin',
          matches: [{
            id: '2',
            name: 'Aspirin 100mg',
            price: 30,
            in_stock: false,
            relevanceScore: 90
          }],
          error: null
        }
      ];

      MedicineNameProcessor.isValidMedicineName.mockReturnValue(true);
      MedicineNameProcessor.normalizeMedicineName.mockImplementation(name => name);
      ProductSearchService.batchSearch.mockResolvedValue({ data: mockSearchResults, error: null });

      const result = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.matchedMedicines).toHaveLength(2);
      expect(result.data.unmatchedMedicines).toHaveLength(0);
    });

    test('should handle OCR data with no medicine names', async () => {
      const mockOCRData = {
        medicineNames: [],
        confidence: 50,
        rawText: 'No medicines found'
      };

      const result = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('No medicine names found');
    });

    test('should handle invalid medicine names', async () => {
      const mockOCRData = {
        medicineNames: ['invalid', 'ab', '123'],
        confidence: 70,
        rawText: 'Invalid prescription'
      };

      MedicineNameProcessor.isValidMedicineName.mockReturnValue(false);
      MedicineNameProcessor.normalizeMedicineName.mockImplementation(name => name);

      const result = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('No valid medicine names');
    });

    test('should handle search service errors', async () => {
      const mockOCRData = {
        medicineNames: ['Paracetamol'],
        confidence: 80,
        rawText: 'Prescription text'
      };

      MedicineNameProcessor.isValidMedicineName.mockReturnValue(true);
      MedicineNameProcessor.normalizeMedicineName.mockImplementation(name => name);
      ProductSearchService.batchSearch.mockResolvedValue({ 
        data: null, 
        error: new Error('Search failed') 
      });

      const result = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Product search failed');
    });
  });

  describe('processSearchResults', () => {
    test('should process search results with matches', () => {
      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: [{
            id: '1',
            name: 'Paracetamol 500mg',
            price: 50,
            in_stock: true,
            relevanceScore: 95
          }],
          error: null
        }
      ];

      const mockOCRData = {
        medicineNames: ['Paracetamol'],
        confidence: 85
      };

      MedicineNameProcessor.extractDosageInfo.mockReturnValue({
        name: 'Paracetamol',
        dosage: '500mg'
      });

      const result = PrescriptionMatchingService.processSearchResults(mockSearchResults, mockOCRData);

      expect(result.matchedMedicines).toHaveLength(1);
      expect(result.unmatchedMedicines).toHaveLength(0);
      expect(result.matchedMedicines[0].bestMatch.name).toBe('Paracetamol 500mg');
    });

    test('should process search results with no matches', () => {
      const mockSearchResults = [
        {
          searchTerm: 'UnknownMedicine',
          matches: [],
          error: null
        }
      ];

      const mockOCRData = {
        medicineNames: ['UnknownMedicine'],
        confidence: 85
      };

      MedicineNameProcessor.normalizeMedicineName.mockImplementation(name => name);

      const result = PrescriptionMatchingService.processSearchResults(mockSearchResults, mockOCRData);

      expect(result.matchedMedicines).toHaveLength(0);
      expect(result.unmatchedMedicines).toHaveLength(1);
      expect(result.unmatchedMedicines[0].originalName).toBe('UnknownMedicine');
      expect(result.unmatchedMedicines[0].reason).toBe('not_found');
    });

    test('should process search results with errors', () => {
      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: null,
          error: 'Database error'
        }
      ];

      const mockOCRData = {
        medicineNames: ['Paracetamol'],
        confidence: 85
      };

      MedicineNameProcessor.normalizeMedicineName.mockImplementation(name => name);

      const result = PrescriptionMatchingService.processSearchResults(mockSearchResults, mockOCRData);

      expect(result.matchedMedicines).toHaveLength(0);
      expect(result.unmatchedMedicines).toHaveLength(1);
      expect(result.unmatchedMedicines[0].reason).toBe('search_error');
      expect(result.unmatchedMedicines[0].error).toBe('Database error');
    });
  });

  describe('calculateMatchConfidence', () => {
    test('should calculate high confidence for exact matches', () => {
      const product = {
        name: 'Paracetamol',
        relevanceScore: 100,
        generic_name: 'Acetaminophen',
        manufacturer: 'Test Pharma'
      };

      const confidence = PrescriptionMatchingService.calculateMatchConfidence('paracetamol', product);
      expect(confidence).toBeGreaterThanOrEqual(95);
    });

    test('should calculate lower confidence for partial matches', () => {
      const product = {
        name: 'Paracetamol Extended Release',
        relevanceScore: 70,
        generic_name: 'Acetaminophen',
        manufacturer: 'Test Pharma'
      };

      const confidence = PrescriptionMatchingService.calculateMatchConfidence('paracetamol', product);
      expect(confidence).toBeLessThan(95);
      expect(confidence).toBeGreaterThan(50);
    });

    test('should reduce confidence for short search terms', () => {
      const product = {
        name: 'ABC',
        relevanceScore: 80
      };

      const confidence = PrescriptionMatchingService.calculateMatchConfidence('ab', product);
      expect(confidence).toBeLessThan(80);
    });

    test('should return 0 for null product', () => {
      const confidence = PrescriptionMatchingService.calculateMatchConfidence('test', null);
      expect(confidence).toBe(0);
    });
  });

  describe('determineMatchType', () => {
    test('should identify exact matches', () => {
      const product = { name: 'Paracetamol', generic_name: 'Acetaminophen' };
      const matchType = PrescriptionMatchingService.determineMatchType('paracetamol', product);
      expect(matchType).toBe('exact');
    });

    test('should identify prefix matches', () => {
      const product = { name: 'Paracetamol 500mg', generic_name: 'Acetaminophen' };
      const matchType = PrescriptionMatchingService.determineMatchType('paracetamol', product);
      expect(matchType).toBe('prefix');
    });

    test('should identify partial matches', () => {
      const product = { name: 'Extended Paracetamol Release', generic_name: 'Acetaminophen' };
      const matchType = PrescriptionMatchingService.determineMatchType('paracetamol', product);
      expect(matchType).toBe('partial');
    });

    test('should identify generic matches', () => {
      const product = { name: 'Brand Name', generic_name: 'paracetamol' };
      const matchType = PrescriptionMatchingService.determineMatchType('paracetamol', product);
      expect(matchType).toBe('exact'); // Generic name exact match
    });

    test('should return none for null product', () => {
      const matchType = PrescriptionMatchingService.determineMatchType('test', null);
      expect(matchType).toBe('none');
    });
  });

  describe('calculateSummary', () => {
    test('should calculate summary statistics correctly', () => {
      const matchedMedicines = [
        {
          bestMatch: { inStock: true, price: 50, mrp: 60 },
          confidence: 90
        },
        {
          bestMatch: { inStock: false, price: 30, mrp: 35 },
          confidence: 80
        }
      ];

      const unmatchedMedicines = [
        { originalName: 'Unknown Medicine' }
      ];

      const summary = PrescriptionMatchingService.calculateSummary(matchedMedicines, unmatchedMedicines, []);

      expect(summary.totalMedicines).toBe(3);
      expect(summary.matchedCount).toBe(2);
      expect(summary.unmatchedCount).toBe(1);
      expect(summary.matchRate).toBe(67); // 2/3 * 100, rounded
      expect(summary.availability.inStock).toBe(1);
      expect(summary.availability.outOfStock).toBe(1);
      expect(summary.estimatedCost.total).toBe(50); // Only in-stock items
      expect(summary.averageConfidence).toBe(85); // (90 + 80) / 2
    });

    test('should handle empty arrays', () => {
      const summary = PrescriptionMatchingService.calculateSummary([], [], []);

      expect(summary.totalMedicines).toBe(0);
      expect(summary.matchedCount).toBe(0);
      expect(summary.unmatchedCount).toBe(0);
      expect(summary.matchRate).toBe(0);
      expect(summary.averageConfidence).toBe(0);
    });
  });

  describe('calculateOverallConfidence', () => {
    test('should calculate overall confidence correctly', () => {
      const ocrData = { confidence: 80 };
      const matchedMedicines = [
        { confidence: 90 },
        { confidence: 85 }
      ];
      const unmatchedMedicines = [];

      const confidence = PrescriptionMatchingService.calculateOverallConfidence(
        ocrData, 
        matchedMedicines, 
        unmatchedMedicines
      );

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    test('should return 0 for no medicines', () => {
      const ocrData = { confidence: 80 };
      const confidence = PrescriptionMatchingService.calculateOverallConfidence(ocrData, [], []);
      expect(confidence).toBe(0);
    });
  });

  describe('validateResults', () => {
    test('should validate good results', () => {
      const matchingResults = {
        matchedMedicines: [
          { confidence: 90, bestMatch: { requiresPrescription: false } },
          { confidence: 85, bestMatch: { requiresPrescription: false } }
        ],
        unmatchedMedicines: []
      };

      const validation = PrescriptionMatchingService.validateResults(matchingResults);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test('should identify low confidence matches', () => {
      const matchingResults = {
        matchedMedicines: [
          { confidence: 50, bestMatch: { requiresPrescription: false } },
          { confidence: 40, bestMatch: { requiresPrescription: false } }
        ],
        unmatchedMedicines: []
      };

      const validation = PrescriptionMatchingService.validateResults(matchingResults);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('low confidence');
    });

    test('should identify high unmatched rate', () => {
      const matchingResults = {
        matchedMedicines: [
          { confidence: 90, bestMatch: { requiresPrescription: false } }
        ],
        unmatchedMedicines: [
          { originalName: 'Med1' },
          { originalName: 'Med2' },
          { originalName: 'Med3' }
        ]
      };

      const validation = PrescriptionMatchingService.validateResults(matchingResults);

      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues[0]).toContain('50%');
    });

    test('should identify prescription requirements', () => {
      const matchingResults = {
        matchedMedicines: [
          { confidence: 90, bestMatch: { requiresPrescription: true } }
        ],
        unmatchedMedicines: []
      };

      const validation = PrescriptionMatchingService.validateResults(matchingResults);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('prescription verification');
    });
  });

  describe('generatePrescriptionId', () => {
    test('should generate unique prescription IDs', () => {
      const id1 = PrescriptionMatchingService.generatePrescriptionId();
      const id2 = PrescriptionMatchingService.generatePrescriptionId();

      expect(id1).toMatch(/^rx_/);
      expect(id2).toMatch(/^rx_/);
      expect(id1).not.toBe(id2);
    });
  });
});
