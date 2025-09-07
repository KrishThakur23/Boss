import { supabase } from '../config/supabase'

export class AuthService {
  // Sign up with email and password
  static async signUp(email, password, userData = {}) {
    try {


      
      // Check if Supabase is properly configured
      if (!supabase.auth) {
        throw new Error('Supabase authentication is not properly configured');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            phone: userData.phone || '',
            address: userData.address || '',
            ...userData
          }
        }
      });



      if (error) {
        console.error('AuthService: Supabase auth error:', error);
        throw error;
      }

      // Create user profile in users table
      if (data.user) {

        const profileResult = await this.createUserProfile(data.user.id, userData);
        
        if (profileResult.error) {
          console.error('AuthService: Profile creation failed:', profileResult.error);
          // Don't throw here - user is created but profile failed
          // This is a partial success scenario
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('AuthService: Sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  // Sign out
  static async signOut() {
    try {

      
      // Method 1: Try standard sign out with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign out timeout after 5 seconds')), 5000);
        });
        
        const signOutPromise = supabase.auth.signOut();
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        
        if (error) throw error;

        return { error: null };
      } catch (timeoutError) {

        
        // Method 2: Try to clear session manually
        try {

          
          // Clear local storage
          localStorage.removeItem('sb-mjsxgsriufscurbpfkwp-auth-token');
          localStorage.removeItem('supabase.auth.token');
          
          // Try to refresh the page to clear any cached state

          return { error: null };
        } catch (manualError) {
          console.error('AuthService: Manual clear failed:', manualError);
          throw manualError;
        }
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error }
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      console.error('Get current session error:', error)
      return { session: null, error }
    }
  }

  // Create user profile
  static async createUserProfile(userId, userData) {
    try {

      
      const profileData = {
        id: userId,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        created_at: new Date().toISOString()
      };
      

      
      const { error } = await supabase
        .from('profiles')
        .insert([profileData])

      if (error) {
        console.error('AuthService: Database insert error:', error);
        throw error;
      }
      

      return { error: null }
    } catch (error) {
      console.error('Create user profile error:', error)
      return { error }
    }
  }

  // Update user profile
  static async updateUserProfile(userId, updates) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update user profile error:', error)
      return { error }
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {

      
      // First, let's test the connection
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('AuthService: Connection test failed:', testError);
        throw testError;
      }
      

      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('AuthService: Database select error:', error);
        console.error('AuthService: Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: error.status
        });
        throw error;
      }
      

      return { data, error: null }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { data: null, error }
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    }
  }

  // Update password
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error }
    }
  }
}

export default AuthService
