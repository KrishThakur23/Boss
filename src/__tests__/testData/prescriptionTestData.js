/**
 * Test Data for Prescription Matching Tests
 * Contains sample OCR data, product data, and expected results for testing
 */

export const sampleOCRData = {
  simple: {
    medicineNames: ['Paracetamol 500mg', 'Aspirin 100mg'],
    confidence: 85,
    rawText: 'Dr. Smith\nPatient: John Doe\nParacetamol 500mg\nAspirin 100mg',
    patientInfo: {
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      prescriptionDate: '2024-01-15'
    }
  },
  
  complex: {
    medicineNames: [
      'Paracetamol 650mg tablet',
      'Amoxicillin 500mg capsule',
      'Omeprazole 20mg',
      'Cetirizine 10mg',
      'Vitamin D3 2000 IU'
    ],
    confidence: 78,
    rawText: `
      City Hospital
      Dr. Johnson, MD
      Patient: Sarah Wilson
      Date: 2024-01-20
      
      Rx:
      1. Paracetamol 650mg tablet - TID x 5 days
      2. Amoxicillin 500mg capsule - BID x 7 days
      3. Omeprazole 20mg - OD x 14 days
      4. Cetirizine 10mg - OD PRN
      5. Vitamin D3 2000 IU - OD x 30 days
    `,
    patientInfo: {
      patientName: 'Sarah Wilson',
      doctorName: 'Dr. Johnson',
      prescriptionDate: '2024-01-20'
    }
  },
  
  lowQuality: {
    medicineNames: ['Para@cetamol', 'Asp1rin', 'V1tamin'],
    confidence: 45,
    rawText: 'Poor quality scan with OCR artifacts',
    patientInfo: {
      patientName: 'Not detected',
      doctorName: 'Not detected',
      prescriptionDate: 'Not detected'
    }
  }
};

export const sampleProductData = {
  paracetamol: {
    id: 'prod-para-500',
    name: 'Paracetamol 500mg Tablets',
    generic_name: 'Acetaminophen',
    manufacturer: 'Generic Pharma Ltd',
    price: 45,
    mrp: 50,
    discount_percentage: 10,
    in_stock: true,
    stock_quantity: 150,
    dosage_form: 'Tablet',
    strength: '500mg',
    pack_size: '10 tablets',
    requires_prescription: false,
    image_urls: ['paracetamol-500.jpg'],
    is_active: true
  }
};