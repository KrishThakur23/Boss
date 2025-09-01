import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Explicitly use localStorage
    storageKey: 'supabase.auth.token', // Explicit storage key
  },
  global: {
    headers: {
      'X-Client-Info': 'flickxir-web'
    }
  }
})





// Database table names
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CART: 'cart',
  CART_ITEMS: 'cart_items',
  PRESCRIPTIONS: 'prescriptions',
  ADDRESSES: 'addresses',
  PAYMENTS: 'payments'
}

// Export the client for use in other components
export default supabase
