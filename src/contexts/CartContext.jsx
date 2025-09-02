import React, { createContext, useContext, useReducer, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        items: action.payload.items || [],
        isLoading: false,
        isInitialized: true,
        error: null,
        isStable: true, // Add stability flag
        operationLoading: {
          sync: false,
          add: false,
          remove: false,
          update: false,
          clear: false
        }
      };

    case 'SET_LOADING':
      // Prevent loading state changes if already stable
      if (state.isStable && !action.payload) {
        return state;
      }
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
        isStable: !action.payload
      };

    case 'SET_OPERATION_LOADING':
      return {
        ...state,
        operationLoading: {
          ...state.operationLoading,
          [action.payload.operation]: action.payload.isLoading
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isStable: true
      };

    case 'BATCH_UPDATE':
      return {
        ...state,
        ...action.payload,
        isStable: true
      };

    case 'SET_CART_ITEMS':
      return {
        ...state,
        items: action.payload || [],
        isLoading: false,
        isStable: true
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
          ),
          isStable: true
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          isStable: true
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        isStable: true
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
        isStable: true
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        isStable: true
      };

    case 'UPDATE_ITEM_ID':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.tempId
            ? { ...item, id: action.payload.realId }
            : item
        ),
        isStable: true
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
    isInitialized: false,
    error: null,
    isStable: false,
    operationLoading: {
      sync: false,
      add: false,
      remove: false,
      update: false,
      clear: false
    }
  });
  const { isAuthenticated, user } = useAuth();
  
  // Flag to prevent multiple simultaneous Supabase loads
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState(false);
  
  // Track which user we've loaded cart for to prevent repeated loads
  const loadedUserRef = useRef(null);

  // Batched dispatch function to reduce re-renders
  const batchedDispatch = useCallback((updates) => {
    dispatch({ type: 'BATCH_UPDATE', payload: updates });
  }, []);

  // Helper function to manage operation loading states
  const setOperationLoading = useCallback((operation, isLoading) => {
    dispatch({ 
      type: 'SET_OPERATION_LOADING', 
      payload: { operation, isLoading } 
    });
  }, []);

  // Initialize cart from localStorage on mount (only once)
  useEffect(() => {
    if (!state.isInitialized) {
      console.log('🛒 Initializing cart from localStorage...');
      
      try {
        const savedCart = localStorage.getItem('flickxir_cart');
        let items = [];
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            console.log('🛒 Found saved cart with', parsedCart.length, 'items');
            items = parsedCart;
          }
        }
        
        // Single dispatch to initialize everything
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { items }
        });
        
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { items: [] }
        });
      }
    }
  }, [state.isInitialized]);

  // Debounced localStorage save to prevent excessive writes
  useEffect(() => {
    if (state.isInitialized && !state.isLoading) {
      const timeoutId = setTimeout(() => {
        console.log('🛒 Saving cart to localStorage:', state.items.length, 'items');
        localStorage.setItem('flickxir_cart', JSON.stringify(state.items));
      }, 300); // Debounce localStorage writes
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.items, state.isInitialized, state.isLoading]);

  const loadCartFromSupabase = useCallback(async () => {
    if (!user || isLoadingFromSupabase || loadedUserRef.current === user.id) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    setIsLoadingFromSupabase(true);
    setOperationLoading('sync', true);
    dispatch({ type: 'SET_LOADING', payload: true });

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
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' });
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
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
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
          dispatch({ type: 'SET_ERROR', payload: 'Failed to create cart' });
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
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart items' });
        return;
      }

      // If no cart items, set empty array
      if (!cartItems || cartItems.length === 0) {
        dispatch({ type: 'SET_CART_ITEMS', payload: [] });
        return;
      }

      // Get product details for each cart item with error handling
      const productIds = cartItems.map(item => item.product_id);
      
      // Use basic columns that should exist in all product tables
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, image_url, in_stock, stock_quantity')
        .in('id', productIds);

      if (productsError) {
        console.error('Error loading products:', productsError);
        // Don't fail completely, just use cart items without full product data
        const basicItems = cartItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: 0,
          name: 'Product',
          image_urls: [],
          in_stock: true,
          stock_quantity: 0,
          requires_prescription: false
        }));
        dispatch({ type: 'SET_CART_ITEMS', payload: basicItems });
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
          name: product?.name || 'Unknown Product',
          image_urls: product?.image_url ? [product.image_url] : [],
          in_stock: product?.in_stock !== undefined ? product.in_stock : true,
          stock_quantity: product?.stock_quantity || 0,
          requires_prescription: false // Safe default
        };
      });

      console.log('🛒 Transformed cart items:', transformedItems);
      
      // Merge with any existing localStorage items (for when user logs in)
      const existingItems = state.items;
      let finalItems = transformedItems;
      
      if (existingItems.length > 0) {
        console.log('🛒 Merging with existing localStorage items');
        const mergedItems = [...transformedItems];
        
        // Add localStorage items that aren't already in Supabase
        existingItems.forEach(localItem => {
          const existsInSupabase = transformedItems.some(item => item.product_id === localItem.product_id);
          if (!existsInSupabase) {
            mergedItems.push(localItem);
          }
        });
        
        finalItems = mergedItems;
      }
      
      // Single batched update to prevent multiple re-renders
      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
          items: finalItems,
          isLoading: false,
          error: null
        }
      });
      
      // Mark this user as loaded
      loadedUserRef.current = user.id;
    } catch (error) {
      console.error('Error loading cart from Supabase:', error);
      // On error, keep the localStorage cart if available and set error state
      const savedCart = localStorage.getItem('flickxir_cart');
      let fallbackItems = [];
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          fallbackItems = parsedCart;
        } catch (parseError) {
          console.error('Error parsing saved cart:', parseError);
        }
      }
      
      // Batched error state update
      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
          items: fallbackItems,
          isLoading: false,
          error: 'Failed to sync with server, using local cart'
        }
      });
    } finally {
      setIsLoadingFromSupabase(false);
      setOperationLoading('sync', false);
    }
  }, [user, isLoadingFromSupabase, setOperationLoading]);

  // Reset loaded user when user changes
  useEffect(() => {
    if (user?.id !== loadedUserRef.current) {
      loadedUserRef.current = null;
    }
  }, [user?.id]);

  // Load cart from Supabase when user is authenticated and cart is initialized
  useEffect(() => {
    if (isAuthenticated && user && state.isInitialized && !isLoadingFromSupabase && loadedUserRef.current !== user.id) {
      console.log('🛒 User authenticated, loading cart from Supabase...');
      // Small delay to ensure auth is stable, but reduced to minimize flickering
      const timer = setTimeout(() => {
        loadCartFromSupabase();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!isAuthenticated && state.isInitialized && state.isLoading) {
      console.log('🛒 User not authenticated, using localStorage cart');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user?.id, state.isInitialized, isLoadingFromSupabase]);

  const addToCart = useCallback(async (product) => {
    // Set loading state for add operation
    setOperationLoading('add', true);
    
    try {
      // Optimistic update first - add to UI immediately
      const newItem = {
        id: `temp_${Date.now()}_${Math.random()}`,
        product_id: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image_urls: product.image_url ? [product.image_url] : [],
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity,
        requires_prescription: product.requires_prescription || false
      };
      
      // For non-authenticated users, just add to local state
      if (!isAuthenticated || !user) {
        dispatch({ type: 'ADD_TO_CART', payload: newItem });
        return;
      }
      
      // For authenticated users, update UI first, then sync with database
      dispatch({ type: 'ADD_TO_CART', payload: newItem });

      // Background sync with database (don't wait for this)
      console.log('🛒 Syncing add to cart with database:', product.name);
      
      // Get user profile and cart
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        return;
      }

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

      // Check if item already exists in database
      const { data: existingCartItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .single();
      
      if (existingCartItem) {
        // Update quantity in database
        await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq('id', existingCartItem.id);
      } else {
        // Add new item to database
        const { data: dbItem } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: 1
          })
          .select()
          .single();
          
        // Update the temporary item with the real database ID
        if (dbItem) {
          dispatch({
            type: 'UPDATE_ITEM_ID',
            payload: { tempId: newItem.id, realId: dbItem.id }
          });
        }
      }
    } catch (error) {
      console.error('Error syncing cart with database:', error);
      // Don't revert the optimistic update - keep the item in cart
    } finally {
      // Clear loading state after a short delay for smooth UX
      setTimeout(() => setOperationLoading('add', false), 300);
    }
  }, [isAuthenticated, user, state.items, setOperationLoading]);

  const removeFromCart = useCallback(async (productId) => {
    // Set loading state for remove operation
    setOperationLoading('remove', true);
    
    try {
      // Optimistic update - remove from UI immediately
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      
      // For non-authenticated users, we're done
      if (!isAuthenticated || !user) {
        return;
      }

      // Background sync with database
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', productId);
    } catch (error) {
      console.error('Error removing from cart database:', error);
      // Could add logic here to revert the optimistic update if needed
    } finally {
      setTimeout(() => setOperationLoading('remove', false), 200);
    }
  }, [isAuthenticated, user, setOperationLoading]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    // Set loading state for update operation
    setOperationLoading('update', true);
    
    try {
      // Optimistic update - update UI immediately
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
      
      // For non-authenticated users, we're done
      if (!isAuthenticated || !user) {
        return;
      }

      // Background sync with database
      await supabase
        .from('cart_items')
        .update({ quantity: Math.max(1, quantity) })
        .eq('id', productId);
    } catch (error) {
      console.error('Error updating quantity in database:', error);
      // Could add logic here to revert the optimistic update if needed
    } finally {
      setTimeout(() => setOperationLoading('update', false), 300);
    }
  }, [isAuthenticated, user, setOperationLoading]);

  const clearCart = useCallback(async () => {
    // Set loading state for clear operation
    setOperationLoading('clear', true);
    
    try {
      // Optimistic update - clear UI immediately
      dispatch({ type: 'CLEAR_CART' });
      
      // For non-authenticated users, we're done
      if (!isAuthenticated || !user) {
        return;
      }

      // Background sync with database
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { data: cart } = await supabase
          .from('cart')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (cart) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
        }
      }
    } catch (error) {
      console.error('Error clearing cart in database:', error);
    } finally {
      setTimeout(() => setOperationLoading('clear', false), 400);
    }
  }, [isAuthenticated, user, setOperationLoading]);

  const getCartItemCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const getCartTotal = useMemo(() => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.items]);

  // Debug method to check cart state
  const debugCart = useCallback(() => {
    console.log('🛒 Cart Debug Info:');
    console.log('- Items in state:', state.items);
    console.log('- Items count:', getCartItemCount());
    console.log('- Is loading:', state.isLoading);
    console.log('- Is initialized:', state.isInitialized);
    console.log('- Error:', state.error);
    console.log('- Is authenticated:', isAuthenticated);
    console.log('- User:', user?.id);
    
    const savedCart = localStorage.getItem('flickxir_cart');
    console.log('- localStorage cart:', savedCart ? JSON.parse(savedCart) : 'empty');
  }, [state, getCartItemCount, isAuthenticated, user]);

  const value = useMemo(() => ({
    items: state.items,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isStable: state.isStable,
    error: state.error,
    operationLoading: state.operationLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    loadCartFromSupabase,
    refreshCart: loadCartFromSupabase,
    debugCart
  }), [
    state.items,
    state.isLoading,
    state.isInitialized,
    state.isStable,
    state.error,
    state.operationLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    loadCartFromSupabase,
    debugCart
  ]);

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
