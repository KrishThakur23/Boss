import Tesseract from 'tesseract.js';

export default class OCRService {
  /**
   * Extract text from an image file using Tesseract.js
   * @param {File} imageFile - The image file to process
   * @returns {Promise<{text: string, confidence: number, error: Error|null}>}
   */
  static async extractTextFromImage(imageFile) {
    try {
      console.log('🔍 OCRService: Starting text extraction from image');
      
      if (!imageFile) {
        throw new Error('No image file provided');
      }

      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create a URL for the image file
      const imageUrl = URL.createObjectURL(imageFile);
      
      console.log('🔍 OCRService: Processing image with Tesseract...');
      
      // Process the image with Tesseract
      const result = await Tesseract.recognize(
        imageUrl,
        'eng', // English language
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`🔍 OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      // Clean up the URL
      URL.revokeObjectURL(imageUrl);

      console.log('✅ OCRService: Text extraction completed');
      console.log('📝 Extracted text:', result.data.text);
      console.log('🎯 Confidence:', result.data.confidence);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        error: null
      };
    } catch (error) {
      console.error('❌ OCRService: Text extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        error: error
      };
    }
  }

  /**
   * Extract medicine names from OCR text with focus on exact names
   * @param {string} ocrText - The text extracted from the prescription
   * @returns {Array<string>} Array of potential medicine names
   */
  static extractMedicineNames(ocrText) {
    try {
      if (!ocrText || typeof ocrText !== 'string') {
        return [];
      }

      console.log('🔍 OCRService: Extracting medicine names from text');
      
      // Common medicine names to look for (exact matches)
      const commonMedicineNames = [
        'paracetamol', 'amoxicillin', 'ibuprofen', 'vitamin', 'calcium',
        'metformin', 'omeprazole', 'pantoprazole', 'azithromycin', 'ceftriaxone',
        'diclofenac', 'acetaminophen', 'aspirin', 'cetirizine', 'loratadine',
        'ranitidine', 'famotidine', 'cimetidine', 'lansoprazole', 'rabeprazole',
        'esomeprazole', 'dexlansoprazole', 'clopidogrel', 'atorvastatin',
        'simvastatin', 'rosuvastatin', 'pravastatin', 'fluvastatin',
        'amlodipine', 'losartan', 'valsartan', 'irbesartan', 'candesartan',
        'olmesartan', 'telmisartan', 'enalapril', 'lisinopril', 'ramipril',
        'quinapril', 'perindopril', 'trandolapril', 'fosinopril', 'benazepril',
        'moexipril', 'spirapril', 'zofenopril', 'captopril', 'imipenem',
        'meropenem', 'ertapenem', 'doripenem', 'imipenem', 'cilastatin',
        'vancomycin', 'teicoplanin', 'daptomycin', 'linezolid', 'tedizolid',
        'ceftazidime', 'cefepime', 'ceftriaxone', 'cefotaxime', 'cefuroxime',
        'cefazolin', 'cefoxitin', 'cefotetan', 'cefmetazole', 'cefotetan',
        'cefmetazole', 'cefoxitin', 'cefazolin', 'cefuroxime', 'cefotaxime',
        'ceftriaxone', 'cefepime', 'ceftazidime', 'cefoperazone', 'cefpirome',
        'cefquinome', 'cefoselis', 'cefpirome', 'cefquinome', 'cefoselis'
      ];

      // Common medicine-related keywords for context
      const medicineKeywords = [
        'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops',
        'mg', 'mcg', 'ml', 'g', 'kg', 'units', 'iu', 'mcg/ml', 'mg/ml'
      ];

      // Split text into lines and words
      const lines = ocrText.split('\n').filter(line => line.trim().length > 0);
      const words = ocrText.split(/\s+/).filter(word => word.trim().length > 0);
      
      const potentialMedicines = new Set();

      // Look for exact medicine name matches first
      words.forEach(word => {
        const cleanedWord = word
          .replace(/[^\w\-\.]/g, '') // Remove special characters except hyphens and dots
          .toLowerCase()
          .trim();
        
        if (cleanedWord.length > 2) {
          // Check if it's a known medicine name
          if (commonMedicineNames.includes(cleanedWord)) {
            potentialMedicines.add(cleanedWord);
          }
          
          // Check if it contains medicine-related keywords
          if (medicineKeywords.some(keyword => cleanedWord.includes(keyword))) {
            potentialMedicines.add(cleanedWord);
          }
        }
      });

      // Look for lines that might contain medicine names
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Look for lines that contain medicine-related keywords
        const hasMedicineKeyword = medicineKeywords.some(keyword => 
          trimmedLine.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasMedicineKeyword && trimmedLine.length > 3) {
          // Extract individual words from the line
          const lineWords = trimmedLine.split(/\s+/);
          lineWords.forEach(word => {
            const cleanedWord = word
              .replace(/[^\w\-\.]/g, '')
              .toLowerCase()
              .trim();
            
            if (cleanedWord.length > 2 && commonMedicineNames.includes(cleanedWord)) {
              potentialMedicines.add(cleanedWord);
            }
          });
        }
      });

      // Also look for patterns like "Medicine: Name" or "Rx: Name"
      const medicinePatterns = [
        /(?:medicine|rx|drug|med)[:\s]+([^\n\r]+)/gi,
        /([a-zA-Z]+(?:\s+\d+[mgmcgml])?)/g
      ];

      medicinePatterns.forEach(pattern => {
        const matches = ocrText.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleanedMatch = match
              .replace(/[^\w\s\-\.]/g, ' ')
              .trim()
              .toLowerCase();
            
            if (cleanedMatch.length > 2) {
              // Check if any part of the match is a known medicine
              const matchWords = cleanedMatch.split(/\s+/);
              matchWords.forEach(word => {
                if (commonMedicineNames.includes(word) || word.length > 3) {
                  potentialMedicines.add(word);
                }
              });
            }
          });
        }
      });

      const result = Array.from(potentialMedicines);
      console.log('✅ OCRService: Extracted potential medicine names:', result);
      
      return result;
    } catch (error) {
      console.error('❌ OCRService: Medicine name extraction failed:', error);
      return [];
    }
  }

  /**
   * Extract patient information from OCR text
   * @param {string} ocrText - The text extracted from the prescription
   * @returns {Object} Object containing patient information
   */
  static extractPatientInfo(ocrText) {
    try {
      if (!ocrText || typeof ocrText !== 'string') {
        return {};
      }

      console.log('🔍 OCRService: Extracting patient information from text');
      
      const lines = ocrText.split('\n').filter(line => line.trim().length > 0);
      const patientInfo = {};

      lines.forEach(line => {
        const trimmedLine = line.trim().toLowerCase();
        
        // Look for patient name patterns
        if (trimmedLine.includes('patient') || trimmedLine.includes('name')) {
          const nameMatch = line.match(/(?:patient|name)[:\s]+([^\n\r]+)/i);
          if (nameMatch && nameMatch[1]) {
            patientInfo.patientName = nameMatch[1].trim();
          }
        }

        // Look for doctor name patterns
        if (trimmedLine.includes('doctor') || trimmedLine.includes('dr.') || trimmedLine.includes('dr ')) {
          const doctorMatch = line.match(/(?:doctor|dr\.?)[:\s]+([^\n\r]+)/i);
          if (doctorMatch && doctorMatch[1]) {
            patientInfo.doctorName = doctorMatch[1].trim();
          }
        }

        // Look for date patterns
        if (trimmedLine.includes('date') || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)) {
          const dateMatch = line.match(/(?:date)[:\s]+([^\n\r]+)/i) || 
                           line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          if (dateMatch && dateMatch[1]) {
            patientInfo.prescriptionDate = dateMatch[1].trim();
          }
        }
      });

      console.log('✅ OCRService: Extracted patient information:', patientInfo);
      return patientInfo;
    } catch (error) {
      console.error('❌ OCRService: Patient info extraction failed:', error);
      return {};
    }
  }

  /**
   * Process prescription image and extract structured data
   * @param {File} imageFile - The prescription image file
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async processPrescriptionImage(imageFile) {
    try {
      console.log('🔍 OCRService: Starting prescription processing');
      
      // Extract text from image
      const { text, confidence, error: ocrError } = await this.extractTextFromImage(imageFile);
      
      if (ocrError) {
        throw ocrError;
      }

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      // Extract medicine names
      const medicineNames = this.extractMedicineNames(text);
      
      // Extract patient information
      const patientInfo = this.extractPatientInfo(text);

      const result = {
        rawText: text,
        confidence: confidence,
        medicineNames: medicineNames,
        patientInfo: patientInfo,
        extractedAt: new Date().toISOString()
      };

      console.log('✅ OCRService: Prescription processing completed:', result);
      return { data: result, error: null };
    } catch (error) {
      console.error('❌ OCRService: Prescription processing failed:', error);
      return { data: null, error };
    }
  }
}
