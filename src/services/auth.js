import { supabase } from '../config/supabase'

export class AuthService {
  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async signUp(email, password, userData = {}) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            phone: userData.phone || '',
            address: userData.address || ''
          }
        }
      })

      if (authError) {
        console.error('❌ AuthService: Sign up auth error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('No user data returned from sign up')
      }

      // Create user profile
      const profileResult = await this.createProfile(authData.user.id, {
        name: userData.name || '',
        email: email,
        phone: userData.phone || '',
        address: userData.address || ''
      })

      if (profileResult.error) {
        console.warn('⚠️ AuthService: Profile creation failed:', profileResult.error)
        // Don't throw here - user is created but profile failed
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('❌ AuthService: Sign up error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ AuthService: Sign in error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: Sign in error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign in with Google OAuth
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ AuthService: Google OAuth error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: Google OAuth error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<{error: Error|null}>}
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ AuthService: Sign out error:', error)
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('❌ AuthService: Sign out error:', error)
      return { error }
    }
  }

  /**
   * Reset password for email
   * @param {string} email - User email
   * @returns {Promise<{error: Error|null}>}
   */
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('❌ AuthService: Password reset error:', error)
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('❌ AuthService: Password reset error:', error)
      return { error }
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<{error: Error|null}>}
   */
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ AuthService: Password update error:', error)
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('❌ AuthService: Password update error:', error)
      return { error }
    }
  }

  // =====================================================
  // USER PROFILE METHODS
  // =====================================================

  /**
   * Create user profile
   * @param {string} userId - User ID from auth
   * @param {Object} profileData - Profile data
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async createProfile(userId, profileData) {
    try {
      const profile = {
        id: userId,
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single()

      if (error) {
        console.error('❌ AuthService: Profile creation error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: Profile creation error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ AuthService: Get profile error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: Get profile error:', error)
      return { data: null, error }
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ AuthService: Profile update error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: Profile update error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Get current user session
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ AuthService: Get session error:', error)
        throw error
      }

      return { data: session, error: null }
    } catch (error) {
      console.error('❌ AuthService: Get session error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get current user
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ AuthService: Get user error:', error)
        throw error
      }

      return { data: user, error: null }
    } catch (error) {
      console.error('❌ AuthService: Get user error:', error)
      return { data: null, error }
    }
  }

  /**
   * Check if user is admin
   * @param {string} userId - User ID
   * @returns {Promise<{data: boolean, error: Error|null}>}
   */
  static async isAdmin(userId) {
    try {
      const { data, error } = await this.getProfile(userId)
      
      if (error) {
        throw error
      }

      return { data: data?.is_admin || false, error: null }
    } catch (error) {
      console.error('❌ AuthService: Admin check error:', error)
      return { data: false, error }
    }
  }

  // =====================================================
  // AUTH STATE LISTENERS
  // =====================================================

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Listen to user changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  static onUserChange(callback) {
    return supabase.auth.onUserChange(callback)
  }
}

export default AuthService
