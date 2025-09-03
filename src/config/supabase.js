import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: isBrowser,
    detectSessionInUrl: isBrowser,
    storage: isBrowser ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
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
