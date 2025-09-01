import { supabase } from '../config/supabase'

export class MedicineService {
  // Create a new medicine
  static async createMedicine(medicine) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert([medicine])
        .select('*')
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create medicine error:', error)
      return { data: null, error }
    }
  }

  // Get all medicines
  static async getAllMedicines() {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get medicines error:', error)
      return { data: null, error }
    }
  }

  // Get medicine by ID
  static async getMedicineById(id) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get medicine by ID error:', error)
      return { data: null, error }
    }
  }

  // Update medicine
  static async updateMedicine(id, updates) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update medicine error:', error)
      return { data: null, error }
    }
  }

  // Delete medicine
  static async deleteMedicine(id) {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete medicine error:', error)
      return { error }
    }
  }

  // Search medicines
  static async searchMedicines(searchTerm, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Search medicines error:', error)
      return { data: null, error }
    }
  }

  // Upload medicine image to Supabase Storage
  static async uploadMedicineImage(file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `medicines/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('product-images') // Using existing bucket
        .upload(fileName, file, { upsert: false })
      
      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      return { url: publicUrlData.publicUrl, error: null }
    } catch (error) {
      console.error('Upload medicine image error:', error)
      return { url: null, error }
    }
  }
}

export default MedicineService
