import { supabase } from '../config/supabase';
import MedicineNameProcessor from './medicineNameProcessor';

export default class ProductSearchService {
  /**
   * Search products by exact name (for prescription OCR matching)
   * @param {string} searchTerm - The medicine name to search for
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async searchProductsByName(searchTerm) {
    try {

      
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          mrp,
          discount_percentage,
          in_stock,
          stock_quantity,
          dosage_form,
          strength,
          pack_size,
          manufacturer,
          generic_name,
          requires_prescription,
          image_urls
        `)
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name')
        .limit(10);

      if (error) {
        console.error('❌ ProductSearchService: Search error:', error);
        throw error;
      }


      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ ProductSearchService: Search failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Get product details by ID
   * @param {string} productId - Product ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getProductById(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ ProductSearchService: Get product error:', error);
      return { data: null, error };
    }
  }

  /**
   * Search for medicine names with exact matching priority
   * @param {string} searchTerm - The medicine name to search for
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async fuzzySearch(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { data: [], error: null };
      }


      
      // First, try to find exact name matches
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          mrp,
          discount_percentage,
          in_stock,
          stock_quantity,
          dosage_form,
          strength,
          pack_size,
          manufacturer,
          generic_name,
          requires_prescription,
          image_urls
        `)
        .eq('is_active', true);

      // Search for exact name matches first
      const { data: exactMatches, error: exactError } = await query
        .or(`name.ilike.${searchTerm},generic_name.ilike.${searchTerm}`)
        .order('name')
        .limit(15);

      if (exactError) throw exactError;

      // Then search for partial name matches
      const { data: partialMatches, error: partialError } = await query
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
        .order('name')
        .limit(15);

      if (partialError) throw partialError;

      // Combine and deduplicate results
      const allResults = [...(exactMatches || []), ...(partialMatches || [])];
      const uniqueResults = this.removeDuplicates(allResults);

      // Sort by relevance: exact matches first, then partial matches
      const sortedResults = uniqueResults.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === searchLower) return -1;
        if (bName === searchLower) return 1;
        
        // Starts with search term gets second priority
        if (aName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower)) return 1;
        
        // Contains search term gets third priority
        if (aName.includes(searchLower)) return -1;
        if (bName.includes(searchLower)) return 1;
        
        return 0;
      });


      return { data: sortedResults, error: null };
    } catch (error) {
      console.error('❌ ProductSearchService: Search failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Enhanced fuzzy search with intelligent matching and relevance scoring
   * @param {string} searchTerm - The medicine name to search for
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async intelligentFuzzySearch(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { data: [], error: null };
      }


      
      // Try the complex search first
      try {
        // Generate search variations using the medicine name processor
        const searchVariations = MedicineNameProcessor.generateSearchVariations(searchTerm);

        
        const allResults = [];
        
        // Search with each variation
        for (const variation of searchVariations) {
          const { data: results, error } = await this.performDatabaseSearch(variation);
          if (error) {
            console.warn(`⚠️ Search failed for variation "${variation}":`, error);
            continue;
          }
          
          if (results && results.length > 0) {
            // Add relevance scores to results
            const scoredResults = results.map(product => ({
              ...product,
              relevanceScore: this.calculateRelevanceScore(searchTerm, product),
              searchVariation: variation
            }));
            allResults.push(...scoredResults);
          }
        }
        
        // Remove duplicates and sort by relevance
        const uniqueResults = this.removeDuplicates(allResults);
        const sortedResults = uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        if (sortedResults.length > 0) {

          return { data: sortedResults, error: null };
        }
      } catch (complexSearchError) {
        console.warn('⚠️ Complex search failed, falling back to simple search:', complexSearchError);
      }
      
      // Fallback to simple search if complex search fails or returns no results

      return await this.searchProductsByName(searchTerm);
      
    } catch (error) {
      console.error('❌ ProductSearchService: Intelligent search failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Perform database search with multiple query strategies
   * @param {string} searchTerm - Normalized search term
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async performDatabaseSearch(searchTerm) {
    try {
      const baseQuery = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          mrp,
          discount_percentage,
          in_stock,
          stock_quantity,
          dosage_form,
          strength,
          pack_size,
          manufacturer,
          generic_name,
          requires_prescription,
          image_urls
        `)
        .eq('is_active', true);

      // Strategy 1: Exact matches (highest priority)
      const { data: exactMatches, error: exactError } = await baseQuery
        .or(`name.ilike.${searchTerm},generic_name.ilike.${searchTerm}`)
        .limit(5);

      if (exactError) throw exactError;

      // Strategy 2: Starts with matches
      const { data: startsWithMatches, error: startsWithError } = await baseQuery
        .or(`name.ilike.${searchTerm}%,generic_name.ilike.${searchTerm}%`)
        .limit(10);

      if (startsWithError) throw startsWithError;

      // Strategy 3: Contains matches
      const { data: containsMatches, error: containsError } = await baseQuery
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
        .limit(15);

      if (containsError) throw containsError;

      // Strategy 4: Word boundary matches for compound names
      const words = searchTerm.split(' ');
      let wordMatches = [];
      
      if (words.length > 1) {
        for (const word of words) {
          if (word.length > 2) {
            const { data: wordResults, error: wordError } = await baseQuery
              .or(`name.ilike.%${word}%,generic_name.ilike.%${word}%`)
              .limit(5);
            
            if (!wordError && wordResults) {
              wordMatches.push(...wordResults);
            }
          }
        }
      }

      // Combine all results
      const allResults = [
        ...(exactMatches || []),
        ...(startsWithMatches || []),
        ...(containsMatches || []),
        ...wordMatches
      ];

      return { data: allResults, error: null };
      
    } catch (error) {
      console.error('❌ Database search error:', error);
      return { data: null, error };
    }
  }

  /**
   * Calculate relevance score for a product match
   * @param {string} searchTerm - Original search term
   * @param {Object} product - Product object
   * @returns {number} Relevance score (0-100)
   */
  static calculateRelevanceScore(searchTerm, product) {
    const searchLower = searchTerm.toLowerCase().trim();
    const productName = (product.name || '').toLowerCase().trim();
    const genericName = (product.generic_name || '').toLowerCase().trim();
    
    let score = 0;
    
    // Exact match gets highest score
    if (productName === searchLower || genericName === searchLower) {
      score = 100;
    }
    // Starts with search term
    else if (productName.startsWith(searchLower) || genericName.startsWith(searchLower)) {
      score = 90;
    }
    // Contains exact search term
    else if (productName.includes(searchLower) || genericName.includes(searchLower)) {
      score = 80;
    }
    // Word-level matching
    else {
      const searchWords = searchLower.split(/\s+/);
      const productWords = productName.split(/\s+/);
      const genericWords = genericName.split(/\s+/);
      
      let wordMatches = 0;
      const totalSearchWords = searchWords.length;
      
      searchWords.forEach(searchWord => {
        if (searchWord.length > 2) {
          if (productWords.some(word => word === searchWord) || 
              genericWords.some(word => word === searchWord)) {
            wordMatches++;
          } else if (productWords.some(word => word.includes(searchWord)) || 
                     genericWords.some(word => word.includes(searchWord))) {
            wordMatches += 0.5;
          }
        }
      });
      
      score = Math.min(75, (wordMatches / totalSearchWords) * 75);
    }
    
    // Boost score for in-stock items
    if (product.in_stock) {
      score += 5;
    }
    
    // Boost score for items with images
    if (product.image_urls && product.image_urls.length > 0) {
      score += 2;
    }
    
    // Use similarity calculation from MedicineNameProcessor for fine-tuning
    const similarity = MedicineNameProcessor.calculateSimilarity(searchTerm, product.name);
    score = Math.max(score, similarity * 70);
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Batch search for multiple medicine names
   * @param {string[]} medicineNames - Array of medicine names to search
   * @returns {Promise<{data: Object[], error: Error|null}>}
   */
  static async batchSearch(medicineNames) {
    try {

      
      if (!medicineNames || medicineNames.length === 0) {
        return { data: [], error: null };
      }
      
      const results = [];
      
      // Process each medicine name
      for (const medicineName of medicineNames) {

        
        const { data: matches, error } = await this.intelligentFuzzySearch(medicineName);
        
        if (error) {
          console.warn(`⚠️ Search failed for "${medicineName}":`, error);
          results.push({
            searchTerm: medicineName,
            matches: [],
            error: error.message
          });
        } else {
          results.push({
            searchTerm: medicineName,
            matches: matches || [],
            error: null
          });
        }
        
        // Add small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      

      return { data: results, error: null };
      
    } catch (error) {
      console.error('❌ ProductSearchService: Batch search failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Search for generic/brand name alternatives
   * @param {string} medicineName - Medicine name to find alternatives for
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async findAlternatives(medicineName) {
    try {

      
      // First, find the primary product
      const { data: primaryMatches, error: primaryError } = await this.intelligentFuzzySearch(medicineName);
      
      if (primaryError || !primaryMatches || primaryMatches.length === 0) {
        return { data: [], error: primaryError };
      }
      
      const primaryProduct = primaryMatches[0];
      const alternatives = [];
      
      // Search by generic name if we have it
      if (primaryProduct.generic_name) {
        const { data: genericAlternatives, error: genericError } = await this.searchProductsByName(primaryProduct.generic_name);
        if (!genericError && genericAlternatives) {
          alternatives.push(...genericAlternatives);
        }
      }
      
      // Search by manufacturer for similar products
      if (primaryProduct.manufacturer) {
        const { data: manufacturerProducts, error: manufacturerError } = await supabase
          .from('products')
          .select('*')
          .eq('manufacturer', primaryProduct.manufacturer)
          .eq('is_active', true)
          .limit(5);
          
        if (!manufacturerError && manufacturerProducts) {
          alternatives.push(...manufacturerProducts);
        }
      }
      
      // Remove duplicates and the original product
      const uniqueAlternatives = this.removeDuplicates(alternatives)
        .filter(product => product.id !== primaryProduct.id);
      

      return { data: uniqueAlternatives, error: null };
      
    } catch (error) {
      console.error('❌ ProductSearchService: Find alternatives failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove duplicate products based on ID
   * @param {Array} products - Array of products
   * @returns {Array} Array with duplicates removed
   */
  static removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }
}
