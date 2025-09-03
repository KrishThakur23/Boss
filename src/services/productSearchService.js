import { supabase } from '../config/supabase';

export default class ProductSearchService {
  /**
   * Search products by exact name (for prescription OCR matching)
   * @param {string} searchTerm - The medicine name to search for
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async searchProductsByName(searchTerm) {
    try {
      console.log('🔍 ProductSearchService: Searching for:', searchTerm);
      
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

      console.log(`✅ ProductSearchService: Found ${data?.length || 0} matching products`);
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

      console.log('🔍 ProductSearchService: Exact name search for:', searchTerm);
      
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

      console.log(`✅ ProductSearchService: Found ${sortedResults.length} products for "${searchTerm}"`);
      return { data: sortedResults, error: null };
    } catch (error) {
      console.error('❌ ProductSearchService: Search failed:', error);
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
