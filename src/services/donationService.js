import { supabase } from '../config/supabase'

export default class DonationService {
  static async createDonation(donation) {
    try {
      // Validate required fields
      const requiredFields = [
        'medicineName', 'medicineType', 'quantity', 'expiryDate', 
        'condition', 'donorName', 'donorEmail', 'donorPhone',
        'pickupAddress', 'city', 'state', 'pincode'
      ];
      
      for (const field of requiredFields) {
        if (!donation[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate expiry date (must be at least 6 months from now)
      const expiryDate = new Date(donation.expiryDate);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (expiryDate <= sixMonthsFromNow) {
        throw new Error('Medicine must have at least 6 months expiry date');
      }

      // Add timestamp and status
      const donationData = {
        ...donation,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('medicine_donations')
        .insert([donationData])
        .select('*')
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Create donation error:', error)
      return { data: null, error }
    }
  }

  static async getDonationsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('medicine_donations')
        .select('*')
        .eq('donor_email', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user donations error:', error)
      return { data: null, error }
    }
  }

  static async updateDonationStatus(donationId, status) {
    try {
      const { data, error } = await supabase
        .from('medicine_donations')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', donationId)
        .select('*')
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update donation status error:', error)
      return { data: null, error }
    }
  }
}


