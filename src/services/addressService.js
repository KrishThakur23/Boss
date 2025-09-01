import { supabase } from '../config/supabase';

export const addressService = {
  // Get all addresses for a user
  async getUserAddresses(userId) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Get default address for a user
  async getDefaultAddress(userId) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  },

  // Add a new address
  async addAddress(addressData) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([addressData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // Update an address
  async updateAddress(addressId, updates) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete an address
  async deleteAddress(addressId) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Set an address as default (removes default from others first)
  async setDefaultAddress(userId, addressId) {
    try {
      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected address as default
      const { data, error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
};
