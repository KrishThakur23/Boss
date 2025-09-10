/**
 * Prescription Matching Service
 * Orchestrates the matching of OCR-extracted medicine names with product database
 */

import ProductSearchService from './productSearchService';
import MedicineNameProcessor from './medicineNameProcessor';

export default class PrescriptionMatchingService {
  
  /**
   * Process OCR results and match medicines with products
   * @param {Object} ocrData - OCR extraction results
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async processOCRResults(ocrData) {
    try {

      
      if (!ocrData || !ocrData.medicineNames || ocrData.medicineNames.length === 0) {
        throw new Error('No medicine names found in OCR data');
      }

      const startTime = Date.now();
      
      // Filter and validate medicine names
      const validMedicineNames = ocrData.medicineNames
        .filter(name => MedicineNameProcessor.isValidMedicineName(name))
        .map(name => MedicineNameProcessor.normalizeMedicineName(name))
        .filter(name => name.length > 2);



      if (validMedicineNames.length === 0) {
        throw new Error('No valid medicine names could be extracted from the prescription');
      }

      // Perform batch search for all medicines
      const { data: searchResults, error: searchError } = await ProductSearchService.batchSearch(validMedicineNames);
      
      if (searchError) {
        throw new Error(`Product search failed: ${searchError.message}`);
      }

      // Process search results into structured format
      const matchingResults = this.processSearchResults(searchResults, ocrData);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      matchingResults.processingTime = processingTime;




      return { data: matchingResults, error: null };

    } catch (error) {
      console.error('❌ PrescriptionMatchingService: Processing failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Process search results into structured matching format
   * @param {Array} searchResults - Results from batch search
   * @param {Object} originalOCRData - Original OCR data
   * @returns {Object} Structured matching results
   */
  static processSearchResults(searchResults, originalOCRData) {
    const matchedMedicines = [];
    const unmatchedMedicines = [];
    const allMatches = [];

    searchResults.forEach(result => {
      const { searchTerm, matches, error } = result;

      if (error || !matches || matches.length === 0) {
        // No matches found
        unmatchedMedicines.push({
          originalName: searchTerm,
          cleanedName: MedicineNameProcessor.normalizeMedicineName(searchTerm),
          reason: error ? 'search_error' : 'not_found',
          error: error || null,
          suggestedAlternatives: []
        });
      } else {
        // Find best match
        const bestMatch = matches[0]; // Already sorted by relevance score
        const alternatives = matches.slice(1, 4); // Top 3 alternatives

        // Extract dosage information from original name
        const { name: cleanName, dosage } = MedicineNameProcessor.extractDosageInfo(searchTerm);

        const matchResult = {
          originalName: searchTerm,
          cleanedName: cleanName,
          dosage: dosage,
          bestMatch: {
            id: bestMatch.id,
            name: bestMatch.name,
            price: bestMatch.price,
            discountPercentage: 0, // No discount column available
            inStock: bestMatch.in_stock,
            stockQuantity: bestMatch.stock_quantity,
            imageUrl: bestMatch.image_url,
            relevanceScore: bestMatch.relevanceScore || 0
          },
          alternatives: alternatives.map(alt => ({
            id: alt.id,
            name: alt.name,
            price: alt.price,
            inStock: alt.in_stock,
            relevanceScore: alt.relevanceScore || 0
          })),
          confidence: this.calculateMatchConfidence(searchTerm, bestMatch),
          matchType: this.determineMatchType(searchTerm, bestMatch)
        };

        matchedMedicines.push(matchResult);
        allMatches.push(...matches);
      }
    });

    // Calculate summary statistics
    const summary = this.calculateSummary(matchedMedicines, unmatchedMedicines, allMatches);

    return {
      matchedMedicines,
      unmatchedMedicines,
      summary,
      originalOCRData,
      confidence: this.calculateOverallConfidence(originalOCRData, matchedMedicines, unmatchedMedicines),
      timestamp: new Date().toISOString(),
      prescriptionId: this.generatePrescriptionId()
    };
  }

  /**
   * Calculate match confidence score
   * @param {string} searchTerm - Original search term
   * @param {Object} product - Matched product
   * @returns {number} Confidence score (0-100)
   */
  static calculateMatchConfidence(searchTerm, product) {
    if (!product) return 0;

    let confidence = product.relevanceScore || 0;
    
    // Boost confidence for exact matches
    const searchLower = searchTerm.toLowerCase();
    const productLower = (product.name || '').toLowerCase();
    
    if (productLower === searchLower) {
      confidence = Math.max(confidence, 95);
    } else if (productLower.includes(searchLower)) {
      confidence = Math.max(confidence, 85);
    }

    // Reduce confidence for very short search terms
    if (searchTerm.length < 4) {
      confidence *= 0.8;
    }

    // Boost confidence for products with complete information
    if (product.name) {
      confidence += 5;
    }

    return Math.min(100, Math.round(confidence));
  }

  /**
   * Determine the type of match
   * @param {string} searchTerm - Original search term
   * @param {Object} product - Matched product
   * @returns {string} Match type
   */
  static determineMatchType(searchTerm, product) {
    if (!product) return 'none';

    const searchLower = searchTerm.toLowerCase().trim();
    const productLower = (product.name || '').toLowerCase().trim();
    const nameLower = (product.name || '').toLowerCase().trim();

    if (productLower === searchLower || nameLower === searchLower) {
      return 'exact';
    } else if (productLower.startsWith(searchLower) || nameLower.startsWith(searchLower)) {
      return 'prefix';
    } else if (productLower.includes(searchLower) || nameLower.includes(searchLower)) {
      return 'partial';
    } else {
      // Check if it's a generic/brand match
      if (genericLower && productLower !== genericLower) {
        return 'generic';
      }
      return 'fuzzy';
    }
  }

  /**
   * Calculate summary statistics
   * @param {Array} matchedMedicines - Matched medicines
   * @param {Array} unmatchedMedicines - Unmatched medicines
   * @param {Array} allMatches - All product matches
   * @returns {Object} Summary statistics
   */
  static calculateSummary(matchedMedicines, unmatchedMedicines, allMatches) {
    const totalMedicines = matchedMedicines.length + unmatchedMedicines.length;
    const matchedCount = matchedMedicines.length;
    const matchRate = totalMedicines > 0 ? Math.round((matchedCount / totalMedicines) * 100) : 0;

    // Availability statistics
    const inStockCount = matchedMedicines.filter(med => med.bestMatch.inStock).length;
    const availabilityRate = matchedCount > 0 ? Math.round((inStockCount / matchedCount) * 100) : 0;

    // Cost estimation
    const estimatedCost = matchedMedicines.reduce((total, med) => {
      return total + (med.bestMatch.inStock ? (med.bestMatch.price || 0) : 0);
    }, 0);

    const potentialSavings = matchedMedicines.reduce((total, med) => {
      if (med.bestMatch.inStock && med.bestMatch.price) {
        return total + med.bestMatch.price;
      }
      return total;
    }, 0);

    return {
      totalMedicines,
      matchedCount,
      unmatchedCount: unmatchedMedicines.length,
      matchRate,
      availability: {
        inStock: inStockCount,
        outOfStock: matchedCount - inStockCount,
        availabilityRate
      },
      estimatedCost: {
        total: Math.round(estimatedCost * 100) / 100,
        currency: 'INR',
        potentialSavings: Math.round(potentialSavings * 100) / 100
      },
      averageConfidence: matchedCount > 0 ? 
        Math.round(matchedMedicines.reduce((sum, med) => sum + med.confidence, 0) / matchedCount) : 0
    };
  }

  /**
   * Calculate overall confidence for the prescription processing
   * @param {Object} ocrData - Original OCR data
   * @param {Array} matchedMedicines - Matched medicines
   * @param {Array} unmatchedMedicines - Unmatched medicines
   * @returns {number} Overall confidence (0-100)
   */
  static calculateOverallConfidence(ocrData, matchedMedicines, unmatchedMedicines) {
    const ocrConfidence = ocrData.confidence || 50;
    const totalMedicines = matchedMedicines.length + unmatchedMedicines.length;
    
    if (totalMedicines === 0) return 0;

    // Base confidence on OCR quality
    let overallConfidence = ocrConfidence * 0.3;

    // Add confidence based on match rate
    const matchRate = matchedMedicines.length / totalMedicines;
    overallConfidence += matchRate * 40;

    // Add confidence based on individual match quality
    if (matchedMedicines.length > 0) {
      const avgMatchConfidence = matchedMedicines.reduce((sum, med) => sum + med.confidence, 0) / matchedMedicines.length;
      overallConfidence += (avgMatchConfidence * 0.3);
    }

    return Math.min(100, Math.round(overallConfidence));
  }

  /**
   * Generate unique prescription ID
   * @returns {string} Unique prescription ID
   */
  static generatePrescriptionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `rx_${timestamp}_${random}`;
  }

  /**
   * Find alternative medicines for unmatched items
   * @param {Array} unmatchedMedicines - List of unmatched medicines
   * @returns {Promise<Array>} Updated unmatched medicines with alternatives
   */
  static async findAlternativesForUnmatched(unmatchedMedicines) {
    const updatedUnmatched = [];

    for (const unmatched of unmatchedMedicines) {
      try {
        // Try to find alternatives using different search strategies
        const { data: alternatives, error } = await ProductSearchService.findAlternatives(unmatched.originalName);
        
        updatedUnmatched.push({
          ...unmatched,
          suggestedAlternatives: alternatives || [],
          alternativesFound: alternatives && alternatives.length > 0
        });

      } catch (error) {
        console.warn(`⚠️ Failed to find alternatives for "${unmatched.originalName}":`, error);
        updatedUnmatched.push({
          ...unmatched,
          suggestedAlternatives: [],
          alternativesFound: false
        });
      }
    }

    return updatedUnmatched;
  }

  /**
   * Validate prescription matching results
   * @param {Object} matchingResults - Results to validate
   * @returns {Object} Validation results
   */
  static validateResults(matchingResults) {
    const issues = [];
    const warnings = [];

    // Check for low confidence matches
    const lowConfidenceMatches = matchingResults.matchedMedicines.filter(med => med.confidence < 60);
    if (lowConfidenceMatches.length > 0) {
      warnings.push(`${lowConfidenceMatches.length} medicines have low confidence matches`);
    }

    // Check for high number of unmatched medicines
    const unmatchedRate = (matchingResults.unmatchedMedicines.length / 
      (matchingResults.matchedMedicines.length + matchingResults.unmatchedMedicines.length)) * 100;
    
    if (unmatchedRate > 50) {
      issues.push('More than 50% of medicines could not be matched');
    } else if (unmatchedRate > 25) {
      warnings.push('More than 25% of medicines could not be matched');
    }

    // Check for prescription-required medicines
    const prescriptionRequired = matchingResults.matchedMedicines.filter(med => med.bestMatch.requiresPrescription);
    if (prescriptionRequired.length > 0) {
      warnings.push(`${prescriptionRequired.length} medicines require prescription verification`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      requiresReview: issues.length > 0 || warnings.length > 0
    };
  }
}
