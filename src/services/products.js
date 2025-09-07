import { supabase } from '../config/supabase'
import { TABLES } from '../config/supabase'

export class ProductService {
  // =====================================================
  // PRODUCT CRUD OPERATIONS
  // =====================================================

  /**
   * Get all products with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getProducts(options = {}) {
    try {
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          category:categories(name, description)
        `)
        .eq('is_active', true)

      // Apply filters
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId)
      }

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,generic_name.ilike.%${options.search}%`)
      }

      if (options.inStock !== undefined) {
        query = query.eq('in_stock', options.inStock)
      }

      if (options.featured !== undefined) {
        query = query.eq('is_featured', options.featured)
      }

      if (options.requiresPrescription !== undefined) {
        query = query.eq('requires_prescription', options.requiresPrescription)
      }

      // Apply sorting
      if (options.sortBy) {
        const order = options.sortOrder || 'asc'
        query = query.order(options.sortBy, { ascending: order === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get products error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getProductById(productId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          category:categories(name, description),
          reviews:product_reviews(
            id,
            rating,
            review_text,
            created_at,
            user:profiles(name)
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('❌ ProductService: Get product by ID error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get product by ID error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getFeaturedProducts(limit = 8) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          category:categories(name)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ ProductService: Get featured products error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get featured products error:', error)
      return { data: null, error }
    }
  }

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async searchProducts(searchTerm, options = {}) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          category:categories(name)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .eq('is_active', true)
        .order('name')
        .limit(options.limit || 20)

      if (error) {
        console.error('❌ ProductService: Search products error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Search products error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Options
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getProductsByCategory(categoryId, options = {}) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          category:categories(name)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')
        .limit(options.limit || 50)

      if (error) {
        console.error('❌ ProductService: Get products by category error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get products by category error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // ADMIN PRODUCT OPERATIONS
  // =====================================================

  /**
   * Create new product (Admin only)
   * @param {Object} productData - Product data
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert([productData])
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService: Create product error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Create product error:', error)
      return { data: null, error }
    }
  }

  /**
   * Update product (Admin only)
   * @param {string} productId - Product ID
   * @param {Object} updates - Product updates
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updateProduct(productId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .update(updates)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService: Update product error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Update product error:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete product (Admin only)
   * @param {string} productId - Product ID
   * @returns {Promise<{error: Error|null}>}
   */
  static async deleteProduct(productId) {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('❌ ProductService: Delete product error:', error)
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('❌ ProductService: Delete product error:', error)
      return { error }
    }
  }

  /**
   * Update product stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add/subtract
   * @param {boolean} isAddition - Whether to add or subtract
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updateProductStock(productId, quantity, isAddition = true) {
    try {
      // Get current stock
      const { data: currentProduct, error: fetchError } = await this.getProductById(productId)
      
      if (fetchError) {
        throw fetchError
      }

      const newStock = isAddition 
        ? (currentProduct.stock_quantity || 0) + quantity
        : Math.max(0, (currentProduct.stock_quantity || 0) - quantity)

      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .update({ 
          stock_quantity: newStock,
          in_stock: newStock > 0
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService: Update stock error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Update stock error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // CATEGORY OPERATIONS
  // =====================================================

  /**
   * Get all categories
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name')

      if (error) {
        console.error('❌ ProductService: Get categories error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get categories error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getCategoryById(categoryId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('❌ ProductService: Get category by ID error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get category by ID error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // PRODUCT REVIEWS
  // =====================================================

  /**
   * Add product review
   * @param {Object} reviewData - Review data
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async addProductReview(reviewData) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert([reviewData])
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService: Add review error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Add review error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} options - Options
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getProductReviews(productId, options = {}) {
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          user:profiles(name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ ProductService: Get reviews error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get reviews error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Get product statistics
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getProductStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('in_stock, is_active, requires_prescription')

      if (error) {
        console.error('❌ ProductService: Get stats error:', error)
        throw error
      }

      const stats = {
        total: data.length,
        inStock: data.filter(p => p.in_stock).length,
        active: data.filter(p => p.is_active).length,
        prescriptionRequired: data.filter(p => p.requires_prescription).length,
        overTheCounter: data.filter(p => !p.requires_prescription).length
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('❌ ProductService: Get stats error:', error)
      return { data: null, error }
    }
  }

  /**
   * Check if product is in stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Required quantity
   * @returns {Promise<{data: boolean, error: Error|null}>}
   */
  static async checkProductAvailability(productId, quantity = 1) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('in_stock, stock_quantity')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('❌ ProductService: Check availability error:', error)
        throw error
      }

      const isAvailable = data.in_stock && (data.stock_quantity || 0) >= quantity

      return { data: isAvailable, error: null }
    } catch (error) {
      console.error('❌ ProductService: Check availability error:', error)
      return { data: false, error }
    }
  }
}

export default ProductService
