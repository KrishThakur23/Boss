import { supabase } from '../config/supabase'

export default class PrescriptionService {
  static async uploadPrescription(prescriptionData, file) {
    try {
      // First, upload the file to Supabase storage
      const fileName = `prescriptions/${Date.now()}_${file.name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file);

      if (fileError) {
        throw new Error(`File upload failed: ${fileError.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      // Prepare prescription data for database
      const prescriptionRecord = {
        ...prescriptionData,
        file_url: publicUrl,
        file_name: fileName,
        status: 'pending',
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save prescription data to database
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescriptionRecord])
        .select('*')
        .single();

      if (error) {
        // If database insert fails, delete the uploaded file
        await supabase.storage
          .from('prescriptions')
          .remove([fileName]);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Prescription upload error:', error);
      return { data: null, error };
    }
  }

  static async getUserPrescriptions(userId) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user prescriptions error:', error);
      return { data: null, error };
    }
  }

  static async getPrescriptionById(prescriptionId) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get prescription error:', error);
      return { data: null, error };
    }
  }

  static async updatePrescriptionStatus(prescriptionId, status, adminNotes = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .update(updateData)
        .eq('id', prescriptionId)
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update prescription status error:', error);
      return { data: null, error };
    }
  }

  static async getAllPrescriptions(status = null) {
    try {
      let query = supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get all prescriptions error:', error);
      return { data: null, error };
    }
  }

  static async deletePrescription(prescriptionId) {
    try {
      // First get the prescription to get the file name
      const { data: prescription, error: fetchError } = await this.getPrescriptionById(prescriptionId);
      if (fetchError) throw fetchError;

      // Delete the file from storage
      if (prescription.file_name) {
        const { error: fileError } = await supabase.storage
          .from('prescriptions')
          .remove([prescription.file_name]);
        
        if (fileError) {
          console.warn('Failed to delete file:', fileError);
        }
      }

      // Delete the prescription record
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete prescription error:', error);
      return { error };
    }
  }
}
