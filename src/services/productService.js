import { supabase, TABLES } from '../config/supabase'

export class ProductService {
  // Create product
  static async createProduct(product) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select('*')
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create product error:', error)
      return { data: null, error }
    }
  }

  // Upload product image to Supabase Storage (bucket: product-images)
  static async uploadProductImage(file, folder = 'products') {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false })
      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      return { url: publicUrlData.publicUrl, error: null }
    } catch (error) {
      console.error('Upload image error:', error)
      return { url: null, error }
    }
  }
  // Get all products with optional filtering
  static async getProducts(filters = {}) {
    console.log("📡 getProducts called", filters);
    try {
      // Ensure we're using the public anon key for unauthenticated access
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name, description)
        `)

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.inStock !== undefined) {
        query = query.eq('in_stock', filters.inStock)
      }

      // Apply sorting
      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? false : true
        query = query.order(filters.sortBy, { ascending: order })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      console.log('🔍 Executing query with filters:', filters)
      const { data, error } = await query

      if (error) {
        console.error('❌ Supabase query error:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} products`)
      return { data, error: null }
    } catch (error) {
      console.error('🚨 Get products error:', error)
      return { data: null, error }
    }
  }

  // Get product by ID
  static async getProductById(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description),
          reviews:product_reviews(*)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get product by ID error:', error)
      return { data: null, error }
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('in_stock', true)
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get products by category error:', error)
      return { data: null, error }
    }
  }

  // Search products
  static async searchProducts(searchTerm, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('in_stock', true)
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Search products error:', error)
      return { data: null, error }
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit = 8) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('in_stock', true)
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get featured products error:', error)
      return { data: null, error }
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get categories error:', error)
      return { data: null, error }
    }
  }

  // Add product to cart
  static async addToCart(userId, productId, quantity = 1) {
    try {
      // Check if product already in cart
      const { data: existingItem } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from(TABLES.CART_ITEMS)
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase
          .from(TABLES.CART_ITEMS)
          .insert([
            {
              user_id: userId,
              product_id: productId,
              quantity
            }
          ])

        if (error) throw error
      }

      return { error: null }
    } catch (error) {
      console.error('Add to cart error:', error)
      return { error }
    }
  }

  // Get user cart
  static async getUserCart(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user cart error:', error)
      return { data: null, error }
    }
  }

  // Update cart item quantity
  static async updateCartItemQuantity(cartItemId, quantity) {
    try {
      const { error } = await supabase
        .from(TABLES.CART_ITEMS)
        .update({ quantity })
        .eq('id', cartItemId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update cart item quantity error:', error)
      return { error }
    }
  }

  // Remove item from cart
  static async removeFromCart(cartItemId) {
    try {
      const { error } = await supabase
        .from(TABLES.CART_ITEMS)
        .delete()
        .eq('id', cartItemId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Remove from cart error:', error)
      return { error }
    }
  }

  // Clear user cart
  static async clearUserCart(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.CART_ITEMS)
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Clear user cart error:', error)
      return { error }
    }
  }


}

export default ProductService
