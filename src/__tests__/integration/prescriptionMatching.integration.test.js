/**
 * Integration Tests for Prescription Matching Pipeline
 * Tests the complete flow from OCR to cart integration
 */

import PrescriptionMatchingService from '../../services/prescriptionMatchingService';
import ProductSearchService from '../../services/productSearchService';
import PrescriptionCartService from '../../services/prescriptionCartService';
import MedicineNameProcessor from '../../services/medicineNameProcessor';
import PerformanceMonitoringService from '../../services/performanceMonitoringService';

// Mock external dependencies
jest.mock('../../config/supabase');
jest.mock('../../services/productSearchService');

describe('Prescription Matching Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete OCR to Cart Pipeline', () => {
    test('should process prescription from OCR to cart successfully', async () => {
      // Mock OCR data
      const mockOCRData = {
        medicineNames: ['Paracetamol 500mg', 'Aspirin 100mg', 'Vitamin D3 2000 IU'],
        confidence: 85,
        rawText: 'Dr. Smith\nPatient: John Doe\nDate: 2024-01-15\n\nParacetamol 500mg - 2 times daily\nAspirin 100mg - once daily\nVitamin D3 2000 IU - once daily',
        patientInfo: {
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          prescriptionDate: '2024-01-15'
        }
      };

      // Mock product search results
      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: [{
            id: 'prod-1',
            name: 'Paracetamol 500mg Tablets',
            generic_name: 'Acetaminophen',
            manufacturer: 'PharmaCorp',
            price: 50,
            mrp: 60,
            discount_percentage: 17,
            in_stock: true,
            stock_quantity: 100,
            dosage_form: 'Tablet',
            strength: '500mg',
            requires_prescription: false,
            relevanceScore: 95
          }],
          error: null
        },
        {
          searchTerm: 'Aspirin',
          matches: [{
            id: 'prod-2',
            name: 'Aspirin 100mg Tablets',
            generic_name: 'Acetylsalicylic Acid',
            manufacturer: 'MediCorp',
            price: 30,
            mrp: 35,
            discount_percentage: 14,
            in_stock: true,
            stock_quantity: 50,
            dosage_form: 'Tablet',
            strength: '100mg',
            requires_prescription: false,
            relevanceScore: 92
          }],
          error: null
        },
        {
          searchTerm: 'Vitamin D3',
          matches: [{
            id: 'prod-3',
            name: 'Vitamin D3 2000 IU Capsules',
            generic_name: 'Cholecalciferol',
            manufacturer: 'VitaCorp',
            price: 120,
            mrp: 150,
            discount_percentage: 20,
            in_stock: false,
            stock_quantity: 0,
            dosage_form: 'Capsule',
            strength: '2000 IU',
            requires_prescription: false,
            relevanceScore: 88
          }],
          error: null
        }
      ];

      ProductSearchService.batchSearch.mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      // Test the complete matching pipeline
      const { data: matchingResults, error } = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(error).toBeNull();
      expect(matchingResults).toBeDefined();

      // Verify matching results structure
      expect(matchingResults.matchedMedicines).toHaveLength(3);
      expect(matchingResults.unmatchedMedicines).toHaveLength(0);
      expect(matchingResults.originalOCRData).toEqual(mockOCRData);
      expect(matchingResults.prescriptionId).toMatch(/^rx_/);

      // Verify summary statistics
      expect(matchingResults.summary.totalMedicines).toBe(3);
      expect(matchingResults.summary.matchedCount).toBe(3);
      expect(matchingResults.summary.matchRate).toBe(100);
      expect(matchingResults.summary.availability.inStock).toBe(2);
      expect(matchingResults.summary.availability.outOfStock).toBe(1);
      expect(matchingResults.summary.estimatedCost.total).toBe(80); // 50 + 30 (only in-stock items)

      // Verify individual matches
      const paracetamolMatch = matchingResults.matchedMedicines.find(m => m.originalName === 'Paracetamol 500mg');
      expect(paracetamolMatch).toBeDefined();
      expect(paracetamolMatch.bestMatch.name).toBe('Paracetamol 500mg Tablets');
      expect(paracetamolMatch.confidence).toBeGreaterThan(80);
      expect(paracetamolMatch.matchType).toBe('exact');

      const vitaminMatch = matchingResults.matchedMedicines.find(m => m.originalName === 'Vitamin D3 2000 IU');
      expect(vitaminMatch).toBeDefined();
      expect(vitaminMatch.bestMatch.inStock).toBe(false);
    });

    test('should handle mixed success and failure scenarios', async () => {
      const mockOCRData = {
        medicineNames: ['Paracetamol', 'UnknownMedicine', 'Aspirin'],
        confidence: 75,
        rawText: 'Mixed prescription with known and unknown medicines'
      };

      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: [{
            id: 'prod-1',
            name: 'Paracetamol 500mg',
            price: 50,
            in_stock: true,
            relevanceScore: 95
          }],
          error: null
        },
        {
          searchTerm: 'UnknownMedicine',
          matches: [],
          error: null
        },
        {
          searchTerm: 'Aspirin',
          matches: null,
          error: 'Database connection failed'
        }
      ];

      ProductSearchService.batchSearch.mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      const { data: matchingResults, error } = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(error).toBeNull();
      expect(matchingResults.matchedMedicines).toHaveLength(1);
      expect(matchingResults.unmatchedMedicines).toHaveLength(2);

      // Check unmatched reasons
      const unknownMedicine = matchingResults.unmatchedMedicines.find(m => m.originalName === 'UnknownMedicine');
      expect(unknownMedicine.reason).toBe('not_found');

      const aspirinError = matchingResults.unmatchedMedicines.find(m => m.originalName === 'Aspirin');
      expect(aspirinError.reason).toBe('search_error');
      expect(aspirinError.error).toBe('Database connection failed');
    });
  });

  describe('Performance Integration', () => {
    test('should track performance throughout the pipeline', async () => {
      const mockOCRData = {
        medicineNames: ['Paracetamol'],
        confidence: 85,
        rawText: 'Simple prescription'
      };

      ProductSearchService.batchSearch.mockResolvedValue({
        data: [{
          searchTerm: 'Paracetamol',
          matches: [{
            id: 'prod-1',
            name: 'Paracetamol 500mg',
            price: 50,
            in_stock: true,
            relevanceScore: 95
          }],
          error: null
        }],
        error: null
      });

      // Monitor the pipeline
      const monitoredProcess = PerformanceMonitoringService.monitorPipeline(
        PrescriptionMatchingService.processOCRResults,
        { testContext: true }
      );

      const { data: results, error } = await monitoredProcess(mockOCRData);

      expect(error).toBeNull();
      expect(results).toBeDefined();
      expect(results.processingTime).toBeDefined();
      expect(typeof results.processingTime).toBe('number');
    });
  });

  describe('Medicine Name Processing Integration', () => {
    test('should handle complex medicine name variations', async () => {
      const complexNames = [
        'Para@cetamol 500mg tab',
        'ASPIRIN   100MG',
        'vitamin d3 2000 iu caps',
        'metformin hydrochloride 850mg',
        'Dr. Prescribed Medicine 250mg'
      ];

      // Test normalization
      const normalizedNames = complexNames.map(name => 
        MedicineNameProcessor.normalizeMedicineName(name)
      );

      expect(normalizedNames[0]).toBe('Para Cetamol 500mg Tablet');
      expect(normalizedNames[1]).toBe('Aspirin 100mg');
      expect(normalizedNames[2]).toBe('Vitamin D3 2000 Iu Capsules');
      expect(normalizedNames[3]).toBe('Metformin Hydrochloride 850mg');
      expect(normalizedNames[4]).toBe('Prescribed Medicine 250mg');

      // Test dosage extraction
      const dosageInfo = complexNames.map(name => 
        MedicineNameProcessor.extractDosageInfo(name)
      );

      expect(dosageInfo[0].dosage).toBe('500mg');
      expect(dosageInfo[1].dosage).toBe('100mg');
      expect(dosageInfo[2].dosage).toBe('2000 iu');
      expect(dosageInfo[3].dosage).toBe('850mg');

      // Test search variations
      const variations = MedicineNameProcessor.generateSearchVariations('Paracetamol 500mg tablet');
      expect(variations).toContain('Paracetamol 500mg tablet');
      expect(variations).toContain('Paracetamol');
      expect(variations.length).toBeGreaterThan(2);
    });

    test('should filter invalid medicine names', () => {
      const mixedNames = [
        'Paracetamol 500mg',    // Valid
        'AB',                   // Too short
        '123',                  // Only numbers
        'patient name',         // Non-medicine word
        'Aspirin 100mg',        // Valid
        'page 1',              // Page reference
        'Vitamin B12'          // Valid
      ];

      const validNames = mixedNames.filter(name => 
        MedicineNameProcessor.isValidMedicineName(name)
      );

      expect(validNames).toEqual([
        'Paracetamol 500mg',
        'Aspirin 100mg',
        'Vitamin B12'
      ]);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle complete pipeline failure gracefully', async () => {
      const mockOCRData = {
        medicineNames: ['TestMedicine'],
        confidence: 50,
        rawText: 'Test prescription'
      };

      // Mock complete search failure
      ProductSearchService.batchSearch.mockResolvedValue({
        data: null,
        error: new Error('Complete search service failure')
      });

      const { data, error } = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toContain('Product search failed');
    });

    test('should validate results and provide warnings', async () => {
      const mockOCRData = {
        medicineNames: ['Medicine1', 'Medicine2', 'Medicine3', 'Medicine4'],
        confidence: 60,
        rawText: 'Test prescription with low confidence matches'
      };

      // Mock low confidence matches
      const mockSearchResults = [
        {
          searchTerm: 'Medicine1',
          matches: [{
            id: 'prod-1',
            name: 'Similar Medicine',
            price: 50,
            in_stock: true,
            requires_prescription: true,
            relevanceScore: 45 // Low relevance
          }],
          error: null
        },
        {
          searchTerm: 'Medicine2',
          matches: [],
          error: null
        },
        {
          searchTerm: 'Medicine3',
          matches: [],
          error: null
        },
        {
          searchTerm: 'Medicine4',
          matches: [],
          error: null
        }
      ];

      ProductSearchService.batchSearch.mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      const { data: results, error } = await PrescriptionMatchingService.processOCRResults(mockOCRData);

      expect(error).toBeNull();
      expect(results).toBeDefined();

      // Validate the results
      const validation = PrescriptionMatchingService.validateResults(results);

      expect(validation.isValid).toBe(false); // High unmatched rate
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.requiresReview).toBe(true);

      // Should warn about low confidence and prescription requirements
      expect(validation.warnings.some(w => w.includes('low confidence'))).toBe(true);
      expect(validation.warnings.some(w => w.includes('prescription verification'))).toBe(true);
    });
  });

  describe('Real-world Scenario Simulation', () => {
    test('should handle typical prescription with common medicines', async () => {
      const typicalPrescription = {
        medicineNames: [
          'Paracetamol 650mg',
          'Amoxicillin 500mg',
          'Omeprazole 20mg',
          'Cetirizine 10mg'
        ],
        confidence: 88,
        rawText: `
          Dr. Johnson Medical Center
          Patient: Sarah Wilson
          Date: 2024-01-20
          
          Rx:
          1. Paracetamol 650mg - TID x 5 days
          2. Amoxicillin 500mg - BID x 7 days  
          3. Omeprazole 20mg - OD x 14 days
          4. Cetirizine 10mg - OD PRN
          
          Dr. Johnson
        `,
        patientInfo: {
          patientName: 'Sarah Wilson',
          doctorName: 'Dr. Johnson',
          prescriptionDate: '2024-01-20'
        }
      };

      const mockSearchResults = [
        {
          searchTerm: 'Paracetamol',
          matches: [{
            id: 'para-650',
            name: 'Paracetamol 650mg Tablets',
            generic_name: 'Acetaminophen',
            manufacturer: 'Generic Pharma',
            price: 45,
            mrp: 50,
            in_stock: true,
            requires_prescription: false,
            relevanceScore: 98
          }],
          error: null
        },
        {
          searchTerm: 'Amoxicillin',
          matches: [{
            id: 'amox-500',
            name: 'Amoxicillin 500mg Capsules',
            generic_name: 'Amoxicillin',
            manufacturer: 'Antibiotic Corp',
            price: 120,
            mrp: 140,
            in_stock: true,
            requires_prescription: true,
            relevanceScore: 96
          }],
          error: null
        },
        {
          searchTerm: 'Omeprazole',
          matches: [{
            id: 'omep-20',
            name: 'Omeprazole 20mg Capsules',
            generic_name: 'Omeprazole',
            manufacturer: 'Gastro Pharma',
            price: 85,
            mrp: 100,
            in_stock: true,
            requires_prescription: false,
            relevanceScore: 94
          }],
          error: null
        },
        {
          searchTerm: 'Cetirizine',
          matches: [{
            id: 'cet-10',
            name: 'Cetirizine 10mg Tablets',
            generic_name: 'Cetirizine Hydrochloride',
            manufacturer: 'Allergy Relief',
            price: 35,
            mrp: 40,
            in_stock: false,
            requires_prescription: false,
            relevanceScore: 92
          }],
          error: null
        }
      ];

      ProductSearchService.batchSearch.mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      const { data: results, error } = await PrescriptionMatchingService.processOCRResults(typicalPrescription);

      expect(error).toBeNull();
      expect(results.matchedMedicines).toHaveLength(4);
      expect(results.unmatchedMedicines).toHaveLength(0);

      // Check summary
      expect(results.summary.matchRate).toBe(100);
      expect(results.summary.availability.inStock).toBe(3);
      expect(results.summary.availability.outOfStock).toBe(1);
      expect(results.summary.estimatedCost.total).toBe(250); // 45 + 120 + 85 (in-stock only)

      // Check prescription requirements
      const prescriptionRequired = results.matchedMedicines.filter(m => m.bestMatch.requiresPrescription);
      expect(prescriptionRequired).toHaveLength(1);
      expect(prescriptionRequired[0].bestMatch.name).toBe('Amoxicillin 500mg Capsules');

      // Validate overall confidence
      expect(results.confidence).toBeGreaterThan(80);

      // Validate results
      const validation = PrescriptionMatchingService.validateResults(results);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.some(w => w.includes('prescription verification'))).toBe(true);
    });
  });
});