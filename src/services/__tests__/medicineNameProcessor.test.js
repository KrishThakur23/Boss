/**
 * Tests for Medicine Name Processor
 */

import MedicineNameProcessor from '../medicineNameProcessor';

describe('MedicineNameProcessor', () => {
  
  describe('normalizeMedicineName', () => {
    test('should normalize basic medicine names', () => {
      expect(MedicineNameProcessor.normalizeMedicineName('paracetamol')).toBe('Paracetamol');
      expect(MedicineNameProcessor.normalizeMedicineName('ASPIRIN')).toBe('Aspirin');
      expect(MedicineNameProcessor.normalizeMedicineName('metformin hydrochloride')).toBe('Metformin Hydrochloride');
    });

    test('should handle empty or invalid inputs', () => {
      expect(MedicineNameProcessor.normalizeMedicineName('')).toBe('');
      expect(MedicineNameProcessor.normalizeMedicineName(null)).toBe('');
      expect(MedicineNameProcessor.normalizeMedicineName(undefined)).toBe('');
    });

    test('should clean OCR artifacts', () => {
      expect(MedicineNameProcessor.normalizeMedicineName('para@cetamol#')).toBe('Para Cetamol');
      expect(MedicineNameProcessor.normalizeMedicineName('aspirin   500mg')).toBe('Aspirin 500mg');
    });

    test('should expand abbreviations', () => {
      expect(MedicineNameProcessor.normalizeMedicineName('paracetamol tab')).toBe('Paracetamol Tablet');
      expect(MedicineNameProcessor.normalizeMedicineName('vitamin c caps')).toBe('Vitamin C Capsules');
    });
  });

  describe('extractDosageInfo', () => {
    test('should extract dosage from medicine names', () => {
      const result1 = MedicineNameProcessor.extractDosageInfo('Paracetamol 500mg');
      expect(result1.name).toBe('Paracetamol');
      expect(result1.dosage).toBe('500mg');

      const result2 = MedicineNameProcessor.extractDosageInfo('Vitamin C 1000mg tablets');
      expect(result2.name).toBe('Vitamin C tablets');
      expect(result2.dosage).toBe('1000mg');
    });

    test('should handle names without dosage', () => {
      const result = MedicineNameProcessor.extractDosageInfo('Aspirin');
      expect(result.name).toBe('Aspirin');
      expect(result.dosage).toBe('');
    });

    test('should handle complex dosage patterns', () => {
      const result1 = MedicineNameProcessor.extractDosageInfo('Metformin 500mg tablet');
      expect(result1.name).toBe('Metformin tablet');
      expect(result1.dosage).toBe('500mg');

      const result2 = MedicineNameProcessor.extractDosageInfo('Insulin 100 units/ml');
      expect(result2.name).toBe('Insulin');
      expect(result2.dosage).toBe('100 units');
    });
  });

  describe('removeDosageFromName', () => {
    test('should remove dosage information', () => {
      expect(MedicineNameProcessor.removeDosageFromName('Paracetamol 500mg')).toBe('Paracetamol');
      expect(MedicineNameProcessor.removeDosageFromName('Vitamin D3 2000 IU')).toBe('Vitamin D3 2000 IU');
      expect(MedicineNameProcessor.removeDosageFromName('Aspirin')).toBe('Aspirin');
    });
  });

  describe('cleanOCRArtifacts', () => {
    test('should remove common OCR artifacts', () => {
      expect(MedicineNameProcessor.cleanOCRArtifacts('Para@cetamol#500mg')).toBe('Para cetamol 500mg');
      expect(MedicineNameProcessor.cleanOCRArtifacts('Aspirin   tablet')).toBe('Aspirin tablet');
      expect(MedicineNameProcessor.cleanOCRArtifacts('Medicine-Name')).toBe('Medicine Name');
    });

    test('should remove page references and dates', () => {
      expect(MedicineNameProcessor.cleanOCRArtifacts('Paracetamol page 1')).toBe('Paracetamol');
      expect(MedicineNameProcessor.cleanOCRArtifacts('Aspirin 12/03/2024')).toBe('Aspirin');
    });

    test('should handle all-caps words', () => {
      expect(MedicineNameProcessor.cleanOCRArtifacts('PARACETAMOL TABLET')).toBe('Paracetamol Tablet');
      expect(MedicineNameProcessor.cleanOCRArtifacts('VITAMIN B12')).toBe('Vitamin B12'); // Short words stay caps
    });
  });

  describe('generateSearchVariations', () => {
    test('should generate search variations', () => {
      const variations = MedicineNameProcessor.generateSearchVariations('Paracetamol 500mg');
      expect(variations).toContain('Paracetamol 500mg');
      expect(variations).toContain('Paracetamol');
      expect(variations.length).toBeGreaterThan(1);
    });

    test('should handle compound names', () => {
      const variations = MedicineNameProcessor.generateSearchVariations('Metformin Hydrochloride');
      expect(variations).toContain('Metformin Hydrochloride');
      expect(variations).toContain('Metformin');
      expect(variations).toContain('Hydrochloride');
    });

    test('should filter out short variations', () => {
      const variations = MedicineNameProcessor.generateSearchVariations('A B');
      expect(variations.every(v => v.length > 1)).toBe(true);
    });
  });

  describe('calculateSimilarity', () => {
    test('should calculate similarity correctly', () => {
      expect(MedicineNameProcessor.calculateSimilarity('paracetamol', 'paracetamol')).toBe(1);
      expect(MedicineNameProcessor.calculateSimilarity('paracetamol', 'paracetamol 500mg')).toBeGreaterThan(0.5);
      expect(MedicineNameProcessor.calculateSimilarity('paracetamol', 'aspirin')).toBeLessThan(0.5);
    });

    test('should handle empty strings', () => {
      expect(MedicineNameProcessor.calculateSimilarity('', '')).toBe(0);
      expect(MedicineNameProcessor.calculateSimilarity('paracetamol', '')).toBe(0);
      expect(MedicineNameProcessor.calculateSimilarity('', 'paracetamol')).toBe(0);
    });
  });

  describe('levenshteinDistance', () => {
    test('should calculate edit distance correctly', () => {
      expect(MedicineNameProcessor.levenshteinDistance('cat', 'cat')).toBe(0);
      expect(MedicineNameProcessor.levenshteinDistance('cat', 'bat')).toBe(1);
      expect(MedicineNameProcessor.levenshteinDistance('cat', 'dog')).toBe(3);
    });
  });

  describe('isValidMedicineName', () => {
    test('should validate medicine names correctly', () => {
      expect(MedicineNameProcessor.isValidMedicineName('Paracetamol')).toBe(true);
      expect(MedicineNameProcessor.isValidMedicineName('Vitamin B12')).toBe(true);
      expect(MedicineNameProcessor.isValidMedicineName('Metformin 500mg')).toBe(true);
    });

    test('should reject invalid names', () => {
      expect(MedicineNameProcessor.isValidMedicineName('')).toBe(false);
      expect(MedicineNameProcessor.isValidMedicineName('AB')).toBe(false); // Too short
      expect(MedicineNameProcessor.isValidMedicineName('123')).toBe(false); // Only numbers
      expect(MedicineNameProcessor.isValidMedicineName('patient name')).toBe(false); // Non-medicine word
    });

    test('should handle null and undefined', () => {
      expect(MedicineNameProcessor.isValidMedicineName(null)).toBe(false);
      expect(MedicineNameProcessor.isValidMedicineName(undefined)).toBe(false);
    });
  });

  describe('expandAbbreviations', () => {
    test('should expand common abbreviations', () => {
      expect(MedicineNameProcessor.expandAbbreviations('tab')).toBe('tablet');
      expect(MedicineNameProcessor.expandAbbreviations('caps')).toBe('capsules');
      expect(MedicineNameProcessor.expandAbbreviations('mg')).toBe('mg'); // Should stay the same
    });

    test('should handle multiple abbreviations', () => {
      expect(MedicineNameProcessor.expandAbbreviations('paracetamol tab 500 mg')).toBe('paracetamol tablet 500 mg');
    });
  });
});