import { supabase } from '../config/supabase'
import ProductService from './products'

export class OrderService {
  // =====================================================
  // CART MANAGEMENT
  // =====================================================

  /**
   * Get or create user cart
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getUserCart(userId) {
    try {
      console.log('🛒 OrderService: Getting cart for user:', userId)
      
      // Check if user has a cart
      let { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        console.error('❌ OrderService: Get cart error:', cartError)
        throw cartError
      }

      // Create cart if it doesn't exist
      if (!cart) {
        console.log('🛒 OrderService: Creating new cart for user:', userId)
        
        const { data: newCart, error: createError } = await supabase
          .from('cart')
          .insert([{ user_id: userId }])
          .select()
          .single()

        if (createError) {
          console.error('❌ OrderService: Create cart error:', createError)
          throw createError
        }

        cart = newCart
      }

      // Get cart items with product details
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id,
            name,
            price,
            mrp,
            image_urls,
            in_stock,
            stock_quantity,
            requires_prescription
          )
        `)
        .eq('cart_id', cart.id)

      if (itemsError) {
        console.error('❌ OrderService: Get cart items error:', itemsError)
        throw itemsError
      }

      const cartWithItems = {
        ...cart,
        items: cartItems || []
      }

      console.log(`✅ OrderService: Cart retrieved with ${cartItems?.length || 0} items`)
      return { data: cartWithItems, error: null }
    } catch (error) {
      console.error('❌ OrderService: Get user cart error:', error)
      return { data: null, error }
    }
  }

  /**
   * Add product to cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async addToCart(userId, productId, quantity = 1) {
    try {
      console.log(`🛒 OrderService: Adding ${quantity}x product ${productId} to cart for user ${userId}`)
      
      // Check product availability
      const { data: isAvailable, error: availabilityError } = await ProductService.checkProductAvailability(productId, quantity)
      
      if (availabilityError) {
        throw availabilityError
      }

      if (!isAvailable) {
        throw new Error('Product is not available in requested quantity')
      }

      // Get user cart
      const { data: cart, error: cartError } = await this.getUserCart(userId)
      
      if (cartError) {
        throw cartError
      }

      // Check if product already in cart
      const existingItem = cart.items.find(item => item.product_id === productId)
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        
        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ OrderService: Update cart item error:', updateError)
          throw updateError
        }

        console.log('✅ OrderService: Cart item quantity updated')
        return { data: updatedItem, error: null }
      } else {
        // Add new item
        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: cart.id,
            product_id: productId,
            quantity: quantity
          }])
          .select()
          .single()

        if (insertError) {
          console.error('❌ OrderService: Add cart item error:', insertError)
          throw insertError
        }

        console.log('✅ OrderService: Product added to cart successfully')
        return { data: newItem, error: null }
      }
    } catch (error) {
      console.error('❌ OrderService: Add to cart error:', error)
      return { data: null, error }
    }
  }

  /**
   * Update cart item quantity
   * @param {string} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updateCartItemQuantity(cartItemId, quantity) {
    try {
      console.log(`🛒 OrderService: Updating cart item ${cartItemId} quantity to ${quantity}`)
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeFromCart(cartItemId)
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: quantity })
        .eq('id', cartItemId)
        .select()
        .single()

      if (error) {
        console.error('❌ OrderService: Update cart item quantity error:', error)
        throw error
      }

      console.log('✅ OrderService: Cart item quantity updated successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ OrderService: Update cart item quantity error:', error)
      return { data: null, error }
    }
  }

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID
   * @returns {Promise<{error: Error|null}>}
   */
  static async removeFromCart(cartItemId) {
    try {
      console.log('🛒 OrderService: Removing cart item:', cartItemId)
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

      if (error) {
        console.error('❌ OrderService: Remove cart item error:', error)
        throw error
      }

      console.log('✅ OrderService: Cart item removed successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ OrderService: Remove cart item error:', error)
      return { error }
    }
  }

  /**
   * Clear user cart
   * @param {string} userId - User ID
   * @returns {Promise<{error: Error|null}>}
   */
  static async clearCart(userId) {
    try {
      console.log('🛒 OrderService: Clearing cart for user:', userId)
      
      // Get user cart
      const { data: cart, error: cartError } = await this.getUserCart(userId)
      
      if (cartError) {
        throw cartError
      }

      // Remove all cart items
      const { error: itemsError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)

      if (itemsError) {
        console.error('❌ OrderService: Clear cart items error:', itemsError)
        throw itemsError
      }

      console.log('✅ OrderService: Cart cleared successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ OrderService: Clear cart error:', error)
      return { error }
    }
  }

  // =====================================================
  // ORDER MANAGEMENT
  // =====================================================

  /**
   * Create order from payment data
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data from payment
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async createOrderFromPayment(userId, orderData) {
    try {
      console.log('📦 OrderService: Creating order from payment for user:', userId)
      console.log('📦 OrderService: Order data:', orderData)
      
      // Create order with the provided data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          order_number: orderData.order_number,
          total_amount: orderData.total_amount,
          discount_amount: orderData.discount_amount || 0,
          final_amount: orderData.final_amount,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address || orderData.shipping_address,
          payment_status: orderData.payment_status,
          payment_method: orderData.payment_method,
          status: orderData.status,
          notes: orderData.notes
        }])
        .select()
        .single()

      if (orderError) {
        console.error('❌ OrderService: Create order error:', orderError)
        throw orderError
      }

      console.log('✅ OrderService: Order created successfully:', order)
      return { data: order, error: null }
    } catch (error) {
      console.error('❌ OrderService: Create order error:', error)
      return { data: null, error }
    }
  }

  /**
   * Create order from cart
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data (shipping address, payment method, etc.)
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async createOrder(userId, orderData) {
    try {
      console.log('📦 OrderService: Creating order for user:', userId)
      
      // Get user cart
      const { data: cart, error: cartError } = await this.getUserCart(userId)
      
      if (cartError) {
        throw cartError
      }

      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      // Calculate order totals
      let totalAmount = 0
      let discountAmount = 0
      
      for (const item of cart.items) {
        const itemTotal = item.product.price * item.quantity
        totalAmount += itemTotal
        
        if (item.product.mrp && item.product.mrp > item.product.price) {
          discountAmount += (item.product.mrp - item.product.price) * item.quantity
        }
      }

      const finalAmount = totalAmount

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          shipping_address: orderData.shippingAddress || '',
          billing_address: orderData.billingAddress || orderData.shippingAddress || '',
          payment_method: orderData.paymentMethod || 'pending',
          notes: orderData.notes || ''
        }])
        .select()
        .single()

      if (orderError) {
        console.error('❌ OrderService: Create order error:', orderError)
        throw orderError
      }

      // Create order items
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('❌ OrderService: Create order items error:', itemsError)
        throw itemsError
      }

      // Update product stock
      for (const item of cart.items) {
        await ProductService.updateProductStock(item.product_id, item.quantity, false)
      }

      // Clear cart
      await this.clearCart(userId)

      console.log('✅ OrderService: Order created successfully')
      return { data: order, error: null }
    } catch (error) {
      console.error('❌ OrderService: Create order error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user orders
   * @param {string} userId - User ID
   * @param {Object} options - Options
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async getUserOrders(userId) {
    try {
      console.log('🛒 OrderService: Fetching orders for user:', userId);
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ OrderService: Error fetching user orders:', error);
        throw error;
      }

      console.log('✅ OrderService: Successfully fetched orders:', orders);
      return orders;
    } catch (error) {
      console.error('❌ OrderService: Exception in getUserOrders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getOrderById(orderId, userId) {
    try {
      console.log('📦 OrderService: Fetching order:', orderId)
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, image_urls, description)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ OrderService: Get order by ID error:', error)
        throw error
      }

      console.log('✅ OrderService: Order retrieved successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ OrderService: Get order by ID error:', error)
      return { data: null, error }
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updateOrderStatus(orderId, status) {
    try {
      console.log(`📦 OrderService: Updating order ${orderId} status to ${status}`)
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('❌ OrderService: Update order status error:', error)
        throw error
      }

      console.log('✅ OrderService: Order status updated successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ OrderService: Update order status error:', error)
      return { data: null, error }
    }
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async cancelOrder(orderId, userId) {
    try {
      console.log('📦 OrderService: Cancelling order:', orderId)
      
      // Get order details
      const { data: order, error: orderError } = await this.getOrderById(orderId, userId)
      
      if (orderError) {
        throw orderError
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled in current status')
      }

      // Update order status
      const { data: updatedOrder, error: updateError } = await this.updateOrderStatus(orderId, 'cancelled')
      
      if (updateError) {
        throw updateError
      }

      // Restore product stock
      for (const item of order.items) {
        await ProductService.updateProductStock(item.product_id, item.quantity, true)
      }

      console.log('✅ OrderService: Order cancelled successfully')
      return { data: updatedOrder, error: null }
    } catch (error) {
      console.error('❌ OrderService: Cancel order error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // ORDER TRACKING
  // =====================================================

  /**
   * Get order tracking information
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getOrderTracking(orderId, userId) {
    try {
      console.log('📦 OrderService: Getting tracking for order:', orderId)
      
      const { data: order, error: orderError } = await this.getOrderById(orderId, userId)
      
      if (orderError) {
        throw orderError
      }

      // Create tracking timeline
      const tracking = {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        timeline: [
          {
            status: 'pending',
            label: 'Order Placed',
            description: 'Your order has been placed successfully',
            timestamp: order.created_at,
            completed: true
          },
          {
            status: 'confirmed',
            label: 'Order Confirmed',
            description: 'Your order has been confirmed and is being processed',
            timestamp: order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : null,
            completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'processing',
            label: 'Processing',
            description: 'Your order is being prepared for shipping',
            timestamp: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : null,
            completed: ['processing', 'shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'shipped',
            label: 'Shipped',
            description: 'Your order has been shipped and is on its way',
            timestamp: order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : null,
            completed: ['shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'delivered',
            label: 'Delivered',
            description: 'Your order has been delivered successfully',
            timestamp: order.status === 'delivered' ? order.updated_at : null,
            completed: order.status === 'delivered'
          }
        ]
      }

      console.log('✅ OrderService: Order tracking retrieved successfully')
      return { data: tracking, error: null }
    } catch (error) {
      console.error('❌ OrderService: Get order tracking error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Get cart total
   * @param {Object} cart - Cart object with items
   * @returns {Object} Cart totals
   */
  static getCartTotal(cart) {
    if (!cart || !cart.items) {
      return { subtotal: 0, discount: 0, total: 0 }
    }

    let subtotal = 0
    let discount = 0

    for (const item of cart.items) {
      const itemTotal = item.product.price * item.quantity
      subtotal += itemTotal
      
      if (item.product.mrp && item.product.mrp > item.product.price) {
        discount += (item.product.mrp - item.product.price) * item.quantity
      }
    }

    return {
      subtotal: subtotal,
      discount: discount,
      total: subtotal
    }
  }

  /**
   * Validate cart for checkout
   * @param {Object} cart - Cart object
   * @returns {Promise<{valid: boolean, errors: Array}>}
   */
  static async validateCartForCheckout(cart) {
    const errors = []

    if (!cart || !cart.items || cart.items.length === 0) {
      errors.push('Cart is empty')
      return { valid: false, errors }
    }

    for (const item of cart.items) {
      // Check stock availability
      const { data: isAvailable, error: availabilityError } = await ProductService.checkProductAvailability(item.product_id, item.quantity)
      
      if (availabilityError) {
        errors.push(`Error checking availability for ${item.product.name}`)
        continue
      }

      if (!isAvailable) {
        errors.push(`${item.product.name} is not available in requested quantity`)
      }

      // Check prescription requirement
      if (item.product.requires_prescription) {
        // Note: In a real app, you'd check if prescription is uploaded
        errors.push(`${item.product.name} requires a prescription`)
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    }
  }
}

export default OrderService
