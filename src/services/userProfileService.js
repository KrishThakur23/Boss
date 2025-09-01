import { supabase } from '../config/supabase';

export class UserProfileService {
  // Get user profile by user ID
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserProfileService: getUserProfile error:', error);
      throw error;
    }
  }

  // Create or update user profile
  static async upsertUserProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserProfileService: upsertUserProfile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserProfileService: updateUserProfile error:', error);
      throw error;
    }
  }

  // Create user profile (for new users)
  static async createUserProfile(profileData) {
    try {
      console.log('UserProfileService: Creating user profile with data:', profileData);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out after 5 seconds')), 5000)
      );
      
      const createPromise = supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      const { data, error } = await Promise.race([createPromise, timeoutPromise]);

      console.log('UserProfileService: createUserProfile result:', { data, error });

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      console.log('UserProfileService: Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('UserProfileService: createUserProfile error:', error);
      if (error.message.includes('timed out')) {
        throw new Error('Database connection timed out. Please check your connection.');
      }
      throw error;
    }
  }

  // Check if user profile exists
  static async profileExists(userId) {
    try {
      console.log('UserProfileService: Checking if profile exists for user:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out after 5 seconds')), 5000)
      );
      
      const profilePromise = supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

      console.log('UserProfileService: profileExists result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking profile existence:', error);
        throw error;
      }

      const exists = !!data;
      console.log('UserProfileService: Profile exists:', exists);
      return exists;
    } catch (error) {
      console.error('UserProfileService: profileExists error:', error);
      if (error.message.includes('timed out')) {
        throw new Error('Database connection timed out. Please check your connection.');
      }
      return false;
    }
  }
}
