import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART_ITEMS':
      return {
        ...state,
        items: action.payload || []
      };

    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });
  const { isAuthenticated, user } = useAuth();

  // Load cart from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Add a small delay to ensure authentication is fully established
      const timer = setTimeout(() => {
        loadCartFromSupabase();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Clear cart when user is not authenticated
      dispatch({ type: 'SET_CART_ITEMS', payload: [] });
    }
  }, [isAuthenticated, user]);

  const loadCartFromSupabase = async () => {
    if (!user) return;

    try {
      console.log('🛒 Loading cart for user:', user.id);
      
      // First, get the user's profile to get the correct user_id for cart
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        return;
      }

      console.log('👤 User profile found:', profile);

      // Get user's cart using the profile id
      let { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      console.log('🛒 Cart query result:', { cart, cartError });

      if (cartError && cartError.code !== 'PGRST116') {
        console.error('Error loading cart:', cartError);
        return;
      }

      // Create cart if it doesn't exist
      if (!cart) {
        console.log('🛒 Creating new cart for user:', profile.id);
        const { data: newCart, error: createError } = await supabase
          .from('cart')
          .insert({ user_id: profile.id })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating cart:', createError);
          return;
        }
        cart = newCart;
        console.log('🛒 New cart created:', cart);
      }

      // Get cart items first
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

      console.log('🛒 Cart items loaded:', cartItems);

      if (itemsError) {
        console.error('Error loading cart items:', itemsError);
        return;
      }

      // If no cart items, set empty array
      if (!cartItems || cartItems.length === 0) {
        dispatch({ type: 'SET_CART_ITEMS', payload: [] });
        return;
      }

             // Get product details for each cart item
       const productIds = cartItems.map(item => item.product_id);
       const { data: products, error: productsError } = await supabase
         .from('products')
         .select('id, name, price, image_url, in_stock, stock_quantity, requires_prescription')
         .in('id', productIds);

      if (productsError) {
        console.error('Error loading products:', productsError);
        return;
      }

      console.log('🛒 Products loaded:', products);

      // Create a map of products for quick lookup
      const productsMap = {};
      products.forEach(product => {
        productsMap[product.id] = product;
      });

             // Transform cart items to match expected format
       const transformedItems = cartItems.map(item => {
         const product = productsMap[item.product_id];
         return {
           id: item.id,
           product_id: item.product_id,
           quantity: item.quantity,
           price: product?.price || 0,
           name: product?.name || '',
           image_urls: product?.image_url ? [product.image_url] : [],
           in_stock: product?.in_stock || false,
           stock_quantity: product?.stock_quantity || 0,
           requires_prescription: product?.requires_prescription || false
         };
       });

      console.log('🛒 Transformed cart items:', transformedItems);
      dispatch({ type: 'SET_CART_ITEMS', payload: transformedItems });
    } catch (error) {
      console.error('Error loading cart from Supabase:', error);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      console.log('🛒 Adding product to cart:', product.name);
      
      // First, get the user's profile to get the correct user_id for cart
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        return;
      }

      // Get or create user's cart using the profile id
      let { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError;
      }

      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('cart')
          .insert({ user_id: profile.id })
          .select('id')
          .single();

        if (createError) throw createError;
        cart = newCart;
      }

      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity in database
        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        dispatch({ type: 'ADD_TO_CART', payload: { product_id: product.id } });
      } else {
        // Add new item to database
        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: 1
          })
          .select()
          .single();

        if (insertError) throw insertError;

                 // Add to local state
         dispatch({ 
           type: 'ADD_TO_CART', 
           payload: { 
             id: newItem.id,
             product_id: product.id,
             quantity: 1,
             price: product.price,
             name: product.name,
             image_urls: product.image_url ? [product.image_url] : [],
             in_stock: product.in_stock,
             stock_quantity: product.stock_quantity,
             requires_prescription: product.requires_prescription
           } 
         });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated || !user) return;

    try {
      const itemToRemove = state.items.find(item => item.id === productId);
      if (!itemToRemove) return;

      // Remove from database
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Remove from local state
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated || !user) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: Math.max(1, quantity) })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // First, get the user's profile to get the correct user_id for cart
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        return;
      }

      // Get user's cart using the profile id
      const { data: cart } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (cart) {
        // Clear all items from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);

        if (error) throw error;
      }

      // Clear local state
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = useMemo(() => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.items]);

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    loadCartFromSupabase,
    refreshCart: loadCartFromSupabase
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
