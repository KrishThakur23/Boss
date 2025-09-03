import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrescriptionService from './services/prescriptionService';
import Header from './Header';
import Footer from './Footer';
import './PrescriptionUpload.css';
import OCRService from './services/ocrService';
import ProductSearchService from './services/productSearchService';
import { supabase } from './config/supabase';

const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  // Scroll to top when the PrescriptionUpload page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, prescriptionFile: 'Please upload a valid file (JPEG, PNG, or PDF)' }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, prescriptionFile: 'File size must be less than 10MB' }));
        return;
      }
      
      setPrescriptionFile(file);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.prescriptionFile;
        return newErrors;
      });
      
      // Clear previous data
      setExtractedData(null);
      setStockStatus(null);
    }
  };

  const processPrescription = async () => {
    if (!prescriptionFile) {
      setErrors(prev => ({ ...prev, prescriptionFile: 'Please upload a prescription first' }));
      return;
    }

    setIsProcessing(true);
    setErrors({});
    setOcrProgress(0);
    
    try {
      console.log('🔍 Processing prescription with OCR...');
      
      // Process the image with OCR
      const { data: ocrData, error: ocrError } = await OCRService.processPrescriptionImage(prescriptionFile);
      
      if (ocrError) {
        throw new Error(`OCR processing failed: ${ocrError.message}`);
      }

      console.log('📝 OCR Raw Text:', ocrData.rawText);
      console.log('💊 Extracted Medicine Names:', ocrData.medicineNames);

      if (!ocrData || !ocrData.medicineNames || ocrData.medicineNames.length === 0) {
        throw new Error('No medicine names could be extracted from the prescription. Please ensure the image is clear and contains readable text.');
      }

      console.log('✅ OCR completed, searching for matching products...');
      
      // Search for matching products for each extracted medicine name
      setIsSearchingProducts(true);
      const allMatchedProducts = [];
      
      for (const medicineName of ocrData.medicineNames) {
        console.log(`🔍 Searching for medicine: "${medicineName}"`);
        const { data: products, error: searchError } = await ProductSearchService.fuzzySearch(medicineName);
        
        console.log(`📦 Search results for "${medicineName}":`, products);
        console.log(`❌ Search error for "${medicineName}":`, searchError);
        
        if (!searchError && products && products.length > 0) {
          // Add the medicine name that was searched for
          const productsWithSearchTerm = products.map(product => ({
            ...product,
            searchedFor: medicineName,
            matchScore: calculateMatchScore(medicineName, product.name)
          }));
          allMatchedProducts.push(...productsWithSearchTerm);
        } else {
          console.log(`⚠️ No products found for "${medicineName}"`);
        }
      }

      console.log('🎯 All matched products:', allMatchedProducts);

      // Remove duplicates and sort by match score
      const uniqueProducts = removeDuplicateProducts(allMatchedProducts);
      uniqueProducts.sort((a, b) => b.matchScore - a.matchScore);
      
      console.log('✨ Final unique products:', uniqueProducts);
      
      setMatchedProducts(uniqueProducts);

      // Create extracted data structure
      const extractedData = {
        medicines: uniqueProducts.map(product => ({
          id: product.id,
          name: product.name,
          dosage: product.dosage_form && product.strength ? 
            `${product.strength} ${product.dosage_form}` : 
            product.dosage_form || 'As prescribed',
          quantity: 1, // Default quantity, can be adjusted by user
          inStock: product.in_stock,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount_percentage,
          manufacturer: product.manufacturer,
          genericName: product.generic_name,
          requiresPrescription: product.requires_prescription,
          searchedFor: product.searchedFor,
          matchScore: product.matchScore
        })),
        patientName: ocrData.patientInfo.patientName || 'Not detected',
        doctorName: ocrData.patientInfo.doctorName || 'Not detected',
        prescriptionDate: ocrData.patientInfo.prescriptionDate || 'Not detected',
        rawText: ocrData.rawText,
        confidence: ocrData.confidence,
        totalAmount: uniqueProducts.reduce((sum, med) => sum + (med.price || 0), 0)
      };
      
      setExtractedData(extractedData);
      
      // Check stock status
      const stockCheck = extractedData.medicines.every(med => med.inStock);
      setStockStatus(stockCheck ? 'available' : 'partial');
      
      console.log('✅ Prescription processing completed successfully');
      
    } catch (error) {
      console.error('❌ Prescription processing error:', error);
      setErrors(prev => ({ ...prev, processing: error.message || 'Failed to process prescription. Please try again.' }));
    } finally {
      setIsProcessing(false);
      setIsSearchingProducts(false);
      setOcrProgress(0);
    }
  };

  const calculateMatchScore = (searchTerm, productName) => {
    const searchLower = searchTerm.toLowerCase();
    const productLower = productName.toLowerCase();
    
    // Exact match gets highest score
    if (productLower === searchLower) return 100;
    
    // Product name contains the exact search term
    if (productLower.includes(searchLower)) return 85;
    
    // Product name starts with search term
    if (productLower.startsWith(searchLower)) return 80;
    
    // Check for word matches (for compound names)
    const searchWords = searchLower.split(/\s+/);
    const productWords = productLower.split(/\s+/);
    
    let wordMatches = 0;
    searchWords.forEach(searchWord => {
      if (productWords.some(productWord => productWord === searchWord)) {
        wordMatches++;
      }
    });
    
    if (wordMatches > 0) {
      return Math.min(70, wordMatches * 25);
    }
    
    // Partial word match
    if (productWords.some(word => word.includes(searchLower))) return 50;
    
    return 0;
  };

  const removeDuplicateProducts = (products) => {
    const seen = new Set();
    return products.filter(product => {
      const key = product.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!extractedData) {
      setErrors(prev => ({ ...prev, submit: 'Please process the prescription first' }));
      return;
    }
    
    setIsProcessing(true);
    setSubmitMessage('');
    
    try {
      // Use the prescription service to upload
      const { error } = await PrescriptionService.uploadPrescription({
        extractedData,
        stockStatus,
        totalAmount: extractedData.totalAmount
      }, prescriptionFile);
      
      if (error) {
        throw new Error(error.message || 'Failed to submit prescription');
      }
      
      setSubmitMessage('success');
      
      // Reset form
      setPrescriptionFile(null);
      setExtractedData(null);
      setStockStatus(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      setSubmitMessage('error');
      console.error('Prescription submission error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleFileChange(event);
    }
  };

  // Test function to verify product search is working
  const testProductSearch = async () => {
    console.log('🧪 Testing product search...');
    
    try {
      // Test search for metformin
      const { data: metforminResults, error: metforminError } = await ProductSearchService.fuzzySearch('metformin');
      console.log('🔍 Metformin search results:', metforminResults);
      console.log('❌ Metformin search error:', metforminError);
      
      // Test search for paracetamol
      const { data: paracetamolResults, error: paracetamolError } = await ProductSearchService.fuzzySearch('paracetamol');
      console.log('🔍 Paracetamol search results:', paracetamolResults);
      console.log('❌ Paracetamol search error:', paracetamolError);
      
      // Test direct database query
      const { data: allProducts, error: allProductsError } = await ProductSearchService.searchProductsByName('metformin');
      console.log('📦 All products search results:', allProducts);
      console.log('❌ All products search error:', allProductsError);
      
      // Test direct Supabase query to see what's in the table
      const { data: directQuery, error: directError } = await supabase
        .from('products')
        .select('id, name, price, in_stock')
        .limit(5);
      
      console.log('🔍 Direct Supabase query results:', directQuery);
      console.log('❌ Direct Supabase query error:', directError);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div className="prescription-upload-container">
      <Header />
      <div className="prescription-upload-content">
        <div className="upload-hero">
          <h1>AI-Powered Prescription Processing</h1>
          <p>Just upload your prescription and our AI will handle the rest!</p>
        </div>
        
        <div className="upload-section">
          <div className="upload-info-card">
            <h2>How It Works</h2>
            <div className="info-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Upload Prescription</h3>
                <p>Take a photo or scan your prescription</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>AI Processing</h3>
                <p>Our ML model extracts medicine details</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Stock Check</h3>
                <p>Automatically verify availability & pricing</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Order Confirmation</h3>
                <p>Review and confirm your order</p>
              </div>
            </div>
          </div>

          <div className="upload-form-card">
            <h2>Upload Your Prescription</h2>
            
            {submitMessage === 'success' && (
              <div className="success-message">
                <h3>🎉 Prescription Submitted Successfully!</h3>
                <p>Your prescription has been processed and submitted. Our team will review the AI extraction and contact you within 1 hour to confirm your order.</p>
                <button 
                  className="upload-another-btn"
                  onClick={() => setSubmitMessage('')}
                >
                  Upload Another Prescription
                </button>
              </div>
            )}

            {submitMessage === 'error' && (
              <div className="error-message">
                <h3>❌ Submission Failed</h3>
                <p>There was an error submitting your prescription. Please try again or contact support.</p>
                <button 
                  className="try-again-btn"
                  onClick={() => setSubmitMessage('')}
                >
                  Try Again
                </button>
              </div>
            )}

            {!submitMessage && (
              <div className="prescription-form">
                <div className="form-section">
                  <h3>Prescription File</h3>
                  <div 
                    className="file-upload-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">📄</div>
                    <p className="upload-text">
                      {prescriptionFile ? prescriptionFile.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="upload-hint">
                      Supported formats: JPEG, PNG, PDF (Max 10MB)
                    </p>
                  </div>
                  {errors.prescriptionFile && (
                    <span className="error-message">{errors.prescriptionFile}</span>
                  )}
                  
                                     {prescriptionFile && (
                     <button 
                       type="button"
                       className="process-prescription-btn"
                       onClick={processPrescription}
                       disabled={isProcessing}
                     >
                       {isProcessing ? 'Processing...' : '🔍 Process with AI'}
                     </button>
                   )}
                   
                   <button 
                     type="button"
                     className="test-search-btn"
                     onClick={testProductSearch}
                     style={{
                       marginTop: '1rem',
                       padding: '0.5rem 1rem',
                       backgroundColor: '#28a745',
                       color: 'white',
                       border: 'none',
                       borderRadius: '6px',
                       fontSize: '0.9rem',
                       cursor: 'pointer'
                     }}
                   >
                     🧪 Test Product Search
                   </button>
                </div>

                {extractedData && (
                  <div className="form-section">
                    <h3>AI Extracted Information</h3>
                    <div className="extracted-info">
                      <div className="patient-info">
                        <p><strong>Patient:</strong> {extractedData.patientName}</p>
                        <p><strong>Doctor:</strong> {extractedData.doctorName}</p>
                        <p><strong>Date:</strong> {extractedData.prescriptionDate}</p>
                      </div>
                      
                      <div className="medicines-list">
                        <h4>Medicines Detected:</h4>
                        {extractedData.medicines.map((medicine, index) => (
                          <div key={index} className={`medicine-item ${medicine.inStock ? 'in-stock' : 'out-of-stock'}`}>
                            <div className="medicine-details">
                              <h5>{medicine.name}</h5>
                              <p>{medicine.dosage}</p>
                              <p>Quantity: {medicine.quantity}</p>
                            </div>
                            <div className="medicine-status">
                              <span className={`stock-badge ${medicine.inStock ? 'available' : 'unavailable'}`}>
                                {medicine.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                              </span>
                              <p className="price">₹{medicine.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-row">
                          <span>Total Amount:</span>
                          <span className="total-amount">₹{extractedData.totalAmount}</span>
                        </div>
                        <div className="stock-status">
                          <span>Stock Status:</span>
                          <span className={`status-badge ${stockStatus}`}>
                            {stockStatus === 'available' ? '✅ All Available' : '⚠️ Partial Availability'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {errors.processing && (
                  <div className="error-message">
                    {errors.processing}
                  </div>
                )}

                {extractedData && (
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="submit-prescription-btn" 
                      onClick={handleSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Submitting...' : '📋 Submit Prescription Order'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrescriptionUpload;
