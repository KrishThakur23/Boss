/**
 * Medicine Name Processor
 * Utilities for cleaning, normalizing, and processing medicine names from OCR text
 */

export default class MedicineNameProcessor {
  
  /**
   * Common medicine name abbreviations and their full forms
   */
  static ABBREVIATIONS = {
    'tab': 'tablet',
    'tabs': 'tablets',
    'cap': 'capsule',
    'caps': 'capsules',
    'mg': 'mg',
    'mcg': 'mcg',
    'ml': 'ml',
    'gm': 'gram',
    'g': 'gram',
    'iu': 'IU',
    'od': 'once daily',
    'bd': 'twice daily',
    'tid': 'three times daily',
    'qid': 'four times daily'
  };

  /**
   * Common dosage patterns to extract
   */
  static DOSAGE_PATTERNS = [
    /(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml|iu|units?)\b/gi,
    /(\d+(?:\.\d+)?)\s*(milligram|microgram|gram|milliliter)\b/gi,
    /(\d+)\s*(tablet|capsule|tab|cap)s?\b/gi
  ];

  /**
   * OCR artifacts and noise patterns to remove
   */
  static OCR_ARTIFACTS = [
    /[^\w\s\d\.\-\(\)]/g,  // Remove special characters except basic ones
    /\s+/g,                 // Multiple spaces to single space
    /^\s+|\s+$/g           // Leading/trailing whitespace
  ];

  /**
   * Normalize a medicine name by cleaning OCR artifacts and standardizing format
   * @param {string} rawName - Raw medicine name from OCR
   * @returns {string} Normalized medicine name
   */
  static normalizeMedicineName(rawName) {
    if (!rawName || typeof rawName !== 'string') {
      return '';
    }

    let normalized = rawName.toLowerCase().trim();
    
    // Remove OCR artifacts
    normalized = this.cleanOCRArtifacts(normalized);
    
    // Expand common abbreviations
    normalized = this.expandAbbreviations(normalized);
    
    // Standardize spacing and capitalization
    normalized = normalized
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return normalized;
  }

  /**
   * Extract dosage information from medicine name
   * @param {string} medicineName - Medicine name that may contain dosage
   * @returns {Object} {name: string, dosage: string}
   */
  static extractDosageInfo(medicineName) {
    if (!medicineName) {
      return { name: '', dosage: '' };
    }

    let extractedDosage = '';
    let cleanName = medicineName;

    // Try to match dosage patterns
    for (const pattern of this.DOSAGE_PATTERNS) {
      const matches = medicineName.match(pattern);
      if (matches && matches.length > 0) {
        extractedDosage = matches[0].trim();
        cleanName = medicineName.replace(pattern, '').trim();
        break;
      }
    }

    // Clean up the name
    cleanName = cleanName.replace(/\s+/g, ' ').trim();

    return {
      name: cleanName || medicineName,
      dosage: extractedDosage
    };
  }

  /**
   * Remove dosage information from medicine name
   * @param {string} medicineName - Medicine name with dosage
   * @returns {string} Medicine name without dosage
   */
  static removeDosageFromName(medicineName) {
    if (!medicineName) return '';
    
    const result = this.extractDosageInfo(medicineName);
    return result.name || medicineName;
  }

  /**
   * Clean OCR artifacts from text
   * @param {string} text - Raw OCR text
   * @returns {string} Cleaned text
   */
  static cleanOCRArtifacts(text) {
    if (!text) return '';

    let cleaned = text;

    // Remove common OCR artifacts
    cleaned = cleaned
      .replace(/[^\w\s\d\.\-\(\)]/g, ' ')  // Replace special chars with space
      .replace(/\s+/g, ' ')                // Multiple spaces to single
      .replace(/^\s+|\s+$/g, '')           // Trim
      .replace(/\b\d+\s*x\s*\d+\b/gi, '') // Remove dimensions like "10x5"
      .replace(/\b(page|pg)\s*\d+\b/gi, '') // Remove page references
      .replace(/\b\d{2,4}[-\/]\d{2,4}[-\/]\d{2,4}\b/g, '') // Remove dates
      .replace(/\b[A-Z]{2,}\b/g, match => {
        // Convert all-caps words to title case unless they're abbreviations
        if (match.length <= 3) return match;
        return match.charAt(0) + match.slice(1).toLowerCase();
      });

    return cleaned.trim();
  }

  /**
   * Expand common abbreviations in medicine names
   * @param {string} text - Text with abbreviations
   * @returns {string} Text with expanded abbreviations
   */
  static expandAbbreviations(text) {
    if (!text) return '';

    let expanded = text;
    
    Object.entries(this.ABBREVIATIONS).forEach(([abbrev, full]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      expanded = expanded.replace(regex, full);
    });

    return expanded;
  }

  /**
   * Generate search variations for a medicine name
   * @param {string} medicineName - Original medicine name
   * @returns {string[]} Array of search variations
   */
  static generateSearchVariations(medicineName) {
    if (!medicineName) return [];

    const variations = new Set();
    
    // Original name
    variations.add(medicineName.trim());
    
    // Normalized version
    const normalized = this.normalizeMedicineName(medicineName);
    variations.add(normalized);
    
    // Without dosage
    const withoutDosage = this.removeDosageFromName(medicineName);
    if (withoutDosage !== medicineName) {
      variations.add(withoutDosage);
      variations.add(this.normalizeMedicineName(withoutDosage));
    }
    
    // Split compound names
    if (medicineName.includes(' ')) {
      const words = medicineName.split(' ');
      if (words.length >= 2) {
        // Try first word only (often the main medicine name)
        variations.add(words[0]);
        // Try last word only
        variations.add(words[words.length - 1]);
      }
    }
    
    // Remove common prefixes/suffixes
    const withoutPrefixSuffix = medicineName
      .replace(/^(dr\.?|mr\.?|tablet|capsule|syrup)\s+/gi, '')
      .replace(/\s+(tablet|capsule|syrup|injection)$/gi, '');
    
    if (withoutPrefixSuffix !== medicineName) {
      variations.add(withoutPrefixSuffix);
    }

    // Filter out empty strings and duplicates
    return Array.from(variations).filter(v => v && v.trim().length > 1);
  }

  /**
   * Calculate similarity between two medicine names using Levenshtein distance
   * @param {string} name1 - First medicine name
   * @param {string} name2 - Second medicine name
   * @returns {number} Similarity score (0-1)
   */
  static calculateSimilarity(name1, name2) {
    if (!name1 || !name2) return 0;
    
    const str1 = name1.toLowerCase().trim();
    const str2 = name2.toLowerCase().trim();
    
    if (str1 === str2) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength === 0 ? 0 : (maxLength - distance) / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Check if a medicine name is likely a valid medicine (not noise)
   * @param {string} medicineName - Medicine name to validate
   * @returns {boolean} True if likely valid
   */
  static isValidMedicineName(medicineName) {
    if (!medicineName || typeof medicineName !== 'string') {
      return false;
    }

    const cleaned = medicineName.trim();
    
    // Too short
    if (cleaned.length < 3) return false;
    
    // Only numbers
    if (/^\d+$/.test(cleaned)) return false;
    
    // Common non-medicine words
    const nonMedicineWords = [
      'patient', 'doctor', 'date', 'prescription', 'pharmacy',
      'address', 'phone', 'email', 'signature', 'stamp',
      'morning', 'evening', 'night', 'before', 'after', 'food',
      'page', 'total', 'amount', 'quantity', 'instructions'
    ];
    
    const lowerCleaned = cleaned.toLowerCase();
    if (nonMedicineWords.some(word => lowerCleaned.includes(word))) {
      return false;
    }
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(cleaned)) return false;
    
    return true;
  }
}
