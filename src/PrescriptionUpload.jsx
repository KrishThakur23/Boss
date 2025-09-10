import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrescriptionService from './services/prescriptionService';
import Header from './Header';
import Footer from './Footer';
import './PrescriptionUpload.css';
import OCRService from './services/ocrService';
import ProductSearchService from './services/productSearchService';
import PrescriptionMatchingService from './services/prescriptionMatchingService';
import PrescriptionCartService from './services/prescriptionCartService';
import ErrorHandlingService from './services/errorHandlingService';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorMessage, SuccessMessage, WarningMessage } from './components/UserFeedback';
import { supabase } from './config/supabase';

const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [matchingResults, setMatchingResults] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [cartOperations, setCartOperations] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [feedbackMessages, setFeedbackMessages] = useState([]);

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
      setMatchingResults(null);
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

      
      // Process the image with OCR
      const { data: ocrData, error: ocrError } = await OCRService.processPrescriptionImage(prescriptionFile);
      
      if (ocrError) {
        throw new Error(`OCR processing failed: ${ocrError.message}`);
      }




      if (!ocrData || !ocrData.medicineNames || ocrData.medicineNames.length === 0) {
        throw new Error('No medicine names could be extracted from the prescription. Please ensure the image is clear and contains readable text.');
      }


      
      // Use the new prescription matching service
      setIsSearchingProducts(true);
      const { data: matchingData, error: matchingError } = await PrescriptionMatchingService.processOCRResults(ocrData);
      
      if (matchingError) {
        throw new Error(`Medicine matching failed: ${matchingError.message}`);
      }

      if (!matchingData) {
        throw new Error('No matching data returned from prescription matching service');
      }


      setMatchingResults(matchingData);

      // Create extracted data structure for backward compatibility
      const extractedData = {
        medicines: (matchingData.matchedMedicines || []).map(match => ({
          id: match.bestMatch?.id || 'unknown',
          name: match.bestMatch?.name || match.originalName || 'Unknown Medicine',
          originalName: match.originalName || 'Unknown',
          dosage: match.dosage || match.bestMatch?.dosageForm || 'As prescribed',
          quantity: 1, // Default quantity, can be adjusted by user
          inStock: match.bestMatch?.inStock || false,
          price: match.bestMatch?.price || 0,
          discount: match.bestMatch?.discountPercentage || 0,
          manufacturer: match.bestMatch?.manufacturer || 'Unknown',
          genericName: match.bestMatch?.genericName || '',
          requiresPrescription: match.bestMatch?.requiresPrescription || false,
          matchScore: match.bestMatch?.relevanceScore || 0,
          confidence: match.confidence || 0
        })),
        unmatchedMedicines: (matchingData.unmatchedMedicines || []).map(unmatched => ({
          ...unmatched,
          suggestions: unmatched.suggestions || [],
          suggestedAlternatives: unmatched.suggestedAlternatives || []
        })),
        patientName: matchingData.originalOCRData?.patientInfo?.patientName || 'Not detected',
        doctorName: matchingData.originalOCRData?.patientInfo?.doctorName || 'Not detected',
        prescriptionDate: matchingData.originalOCRData?.patientInfo?.prescriptionDate || 'Not detected',
        rawText: matchingData.originalOCRData?.rawText || '',
        confidence: matchingData.confidence || 0,
        summary: matchingData.summary || {
          totalMedicines: 0,
          matchedCount: 0,
          matchRate: 0,
          availability: { inStock: 0, outOfStock: 0, availabilityRate: 0 },
          estimatedCost: { total: 0, currency: 'INR' }
        },
        totalAmount: matchingData.summary?.estimatedCost?.total || 0
      };
      
      setExtractedData(extractedData);
      
      // Check stock status
      const stockCheck = matchingData.summary.availability.availabilityRate === 100;
      setStockStatus(stockCheck ? 'available' : 'partial');
      

      
    } catch (error) {
      console.error('❌ Prescription processing error:', error);
      
      // Use error handling service to get user-friendly error info
      let errorInfo;
      if (error.message.includes('OCR') || error.message.includes('text extraction')) {
        errorInfo = ErrorHandlingService.handleOCRError(error, { prescriptionFile: prescriptionFile.name });
      } else if (error.message.includes('matching') || error.message.includes('search')) {
        errorInfo = ErrorHandlingService.handleMatchingError(error, { ocrData });
      } else {
        errorInfo = ErrorHandlingService.handleGeneralError(error, { step: 'prescription_processing' });
      }
      
      // Add error message to feedback
      setFeedbackMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        ...ErrorHandlingService.getErrorMessageProps(errorInfo),
        onRetry: errorInfo.retryable ? () => processPrescription() : null
      }]);
      
      setErrors(prev => ({ ...prev, processing: errorInfo.userMessage }));
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
      setMatchingResults(null);
      setStockStatus(null);
      setMatchedProducts([]);
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

    
    try {
      // Test search for metformin
      const { data: metforminResults, error: metforminError } = await ProductSearchService.fuzzySearch('metformin');


      
      // Test search for paracetamol
      const { data: paracetamolResults, error: paracetamolError } = await ProductSearchService.fuzzySearch('paracetamol');


      
      // Test direct database query
      const { data: allProducts, error: allProductsError } = await ProductSearchService.searchProductsByName('metformin');


      
      // Test direct Supabase query to see what's in the table
      const { data: directQuery, error: directError } = await supabase
        .from('products')
        .select('id, name, price, in_stock')
        .limit(5);
      


      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  const handleAddToCart = async (medicine, quantity = 1) => {
    const medicineKey = medicine.id;
    setCartOperations(prev => ({ ...prev, [medicineKey]: 'adding' }));
    
    try {
      const prescriptionItem = {
        id: medicine.id,
        name: medicine.name,
        originalName: medicine.originalName,
        price: medicine.price,
        quantity: quantity,
        dosage: medicine.dosage,
        requiresPrescription: medicine.requiresPrescription,
        matchScore: medicine.matchScore,
        confidence: medicine.confidence
      };

      const { data: cartResult, error: cartError } = await PrescriptionCartService.addPrescriptionItemsToCart(
        [prescriptionItem],
        matchingResults?.prescriptionId
      );

      if (cartError) {
        throw new Error(cartError.message);
      }

      if (cartResult.errors && cartResult.errors.length > 0) {
        throw new Error(cartResult.errors[0].error);
      }

      setCartOperations(prev => ({ ...prev, [medicineKey]: 'success' }));
      
      // Show success message
      setFeedbackMessages(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        title: 'Added to Cart',
        message: `${medicine.name} has been added to your cart successfully.`,
        autoHide: true
      }]);
      
      // Show success message briefly
      setTimeout(() => {
        setCartOperations(prev => {
          const newState = { ...prev };
          delete newState[medicineKey];
          return newState;
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to add medicine to cart:', error);
      setCartOperations(prev => ({ ...prev, [medicineKey]: 'error' }));
      
      // Handle cart error with error service
      const errorInfo = ErrorHandlingService.handleCartError(error, { 
        medicine: medicine.name,
        quantity 
      });
      
      setFeedbackMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        ...ErrorHandlingService.getErrorMessageProps(errorInfo),
        onRetry: errorInfo.retryable ? () => handleAddToCart(medicine, quantity) : null
      }]);
      
      // Clear error state after 3 seconds
      setTimeout(() => {
        setCartOperations(prev => {
          const newState = { ...prev };
          delete newState[medicineKey];
          return newState;
        });
      }, 3000);
    }
  };

  const handleAddAllToCart = async () => {
    if (!extractedData || !extractedData.medicines || !extractedData.medicines.length) return;
    
    setCartOperations(prev => ({ ...prev, 'all': 'adding' }));
    
    try {
      const prescriptionItems = (extractedData.medicines || [])
        .filter(medicine => medicine.inStock)
        .map(medicine => ({
          id: medicine.id,
          name: medicine.name,
          originalName: medicine.originalName,
          price: medicine.price,
          quantity: 1,
          dosage: medicine.dosage,
          requiresPrescription: medicine.requiresPrescription,
          matchScore: medicine.matchScore,
          confidence: medicine.confidence
        }));

      if (prescriptionItems.length === 0) {
        throw new Error('No in-stock medicines to add to cart');
      }

      const { data: cartResult, error: cartError } = await PrescriptionCartService.addPrescriptionItemsToCart(
        prescriptionItems,
        matchingResults?.prescriptionId
      );

      if (cartError) {
        throw new Error(cartError.message);
      }

      setCartOperations(prev => ({ ...prev, 'all': 'success' }));
      
      // Show success message
      setTimeout(() => {
        setCartOperations(prev => {
          const newState = { ...prev };
          delete newState['all'];
          return newState;
        });
      }, 3000);

    } catch (error) {
      console.error('❌ Failed to add medicines to cart:', error);
      setCartOperations(prev => ({ ...prev, 'all': 'error' }));
      
      setTimeout(() => {
        setCartOperations(prev => {
          const newState = { ...prev };
          delete newState['all'];
          return newState;
        });
      }, 3000);
    }
  };

  const handleQuantityChange = (medicineId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setExtractedData(prev => ({
      ...prev,
      medicines: (prev.medicines || []).map(medicine => 
        medicine.id === medicineId 
          ? { ...medicine, quantity: newQuantity }
          : medicine
      )
    }));
  };

  const dismissFeedbackMessage = (messageId) => {
    setFeedbackMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const clearAllFeedbackMessages = () => {
    setFeedbackMessages([]);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <ErrorBoundary>
      <div className="prescription-upload-container">
        <Header />
        <div className="prescription-upload-content">
          
          {/* Feedback Messages */}
          {feedbackMessages.length > 0 && (
            <div className="feedback-messages">
              {feedbackMessages.map(message => {
                const FeedbackComponent = message.type === 'success' ? SuccessMessage :
                                        message.type === 'warning' ? WarningMessage :
                                        ErrorMessage;
                
                return (
                  <FeedbackComponent
                    key={message.id}
                    title={message.title}
                    message={message.message}
                    suggestions={message.suggestions}
                    onRetry={message.onRetry}
                    onDismiss={() => dismissFeedbackMessage(message.id)}
                    technicalDetails={message.technicalDetails}
                    autoHide={message.autoHide}
                  />
                );
              })}
              {feedbackMessages.length > 1 && (
                <button 
                  className="clear-all-messages"
                  onClick={clearAllFeedbackMessages}
                >
                  Clear All Messages
                </button>
              )}
            </div>
          )}
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
                   
                   {isSearchingProducts && (
                     <div className="processing-indicator">
                       <div className="spinner"></div>
                       <span>Processing prescription and matching medicines...</span>
                     </div>
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
                        <p><strong>Patient:</strong> {extractedData.patientName || 'Not detected'}</p>
                        <p><strong>Doctor:</strong> {extractedData.doctorName || 'Not detected'}</p>
                        <p><strong>Date:</strong> {extractedData.prescriptionDate || 'Not detected'}</p>
                        <p><strong>Processing Confidence:</strong> {extractedData.confidence || 0}%</p>
                      </div>
                      
                      {/* Matching Summary */}
                      {extractedData.summary && (
                        <div className="matching-summary">
                          <h4>Matching Summary</h4>
                          <div className="summary-stats">
                            <div className="stat-item">
                              <span className="stat-label">Medicines Found:</span>
                              <span className="stat-value">{extractedData.summary.matchedCount} of {extractedData.summary.totalMedicines}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Match Rate:</span>
                              <span className="stat-value">{extractedData.summary.matchRate}%</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Available in Stock:</span>
                              <span className="stat-value">{extractedData.summary.availability.inStock} of {extractedData.summary.matchedCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Available Medicines */}
                      {extractedData.medicines && extractedData.medicines.length > 0 && (
                        <div className="medicines-list">
                          <h4>✅ Available Medicines ({extractedData.medicines.length})</h4>
                          {extractedData.medicines.map((medicine, index) => (
                            <div key={index} className={`medicine-item ${medicine.inStock ? 'in-stock' : 'out-of-stock'}`}>
                              <div className="medicine-details">
                                <h5>{medicine.name}</h5>
                                {medicine.originalName !== medicine.name && (
                                  <p className="original-name">Originally: "{medicine.originalName}"</p>
                                )}
                                <p className="dosage">{medicine.dosage}</p>
                                <p className="manufacturer">By {medicine.manufacturer}</p>
                                {medicine.genericName && (
                                  <p className="generic-name">Generic: {medicine.genericName}</p>
                                )}
                                <div className="match-info">
                                  <span className="match-score">Match: {medicine.matchScore}%</span>
                                  <span className="confidence">Confidence: {medicine.confidence}%</span>
                                </div>
                              </div>
                              <div className="medicine-status">
                                <span className={`stock-badge ${medicine.inStock ? 'available' : 'unavailable'}`}>
                                  {medicine.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                                </span>
                                <div className="price-info">
                                  <p className="price">₹{medicine.price}</p>
                                  {medicine.discount > 0 && (
                                    <p className="discount">{medicine.discount}% OFF</p>
                                  )}
                                </div>
                                {medicine.requiresPrescription && (
                                  <span className="prescription-required">📋 Prescription Required</span>
                                )}
                              </div>
                              <div className="medicine-actions">
                                <div className="quantity-selector">
                                  <label>Qty:</label>
                                  <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(medicine.id, medicine.quantity - 1)}
                                    disabled={medicine.quantity <= 1}
                                    className="qty-btn"
                                  >
                                    -
                                  </button>
                                  <span className="quantity">{medicine.quantity}</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(medicine.id, medicine.quantity + 1)}
                                    disabled={medicine.quantity >= 10}
                                    className="qty-btn"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  className={`add-to-cart-btn ${cartOperations[medicine.id] || ''}`}
                                  onClick={() => handleAddToCart(medicine, medicine.quantity)}
                                  disabled={!medicine.inStock || cartOperations[medicine.id] === 'adding'}
                                >
                                  {cartOperations[medicine.id] === 'adding' && '⏳ Adding...'}
                                  {cartOperations[medicine.id] === 'success' && '✅ Added!'}
                                  {cartOperations[medicine.id] === 'error' && '❌ Error'}
                                  {!cartOperations[medicine.id] && (medicine.inStock ? '🛒 Add to Cart' : '❌ Out of Stock')}
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {extractedData.medicines.filter(m => m.inStock).length > 0 && (
                            <div className="bulk-actions">
                              <button
                                type="button"
                                className={`add-all-to-cart-btn ${cartOperations['all'] || ''}`}
                                onClick={handleAddAllToCart}
                                disabled={cartOperations['all'] === 'adding'}
                              >
                                {cartOperations['all'] === 'adding' && '⏳ Adding All...'}
                                {cartOperations['all'] === 'success' && '✅ All Added to Cart!'}
                                {cartOperations['all'] === 'error' && '❌ Error Adding Items'}
                                {!cartOperations['all'] && '🛒 Add All Available to Cart'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Unavailable Medicines */}
                      {extractedData.unmatchedMedicines && extractedData.unmatchedMedicines.length > 0 && (
                        <div className="unmatched-medicines">
                          <h4>❌ Sorry, we don't have these products ({extractedData.unmatchedMedicines.length})</h4>
                          {extractedData.unmatchedMedicines.map((medicine, index) => (
                            <div key={index} className="unmatched-item">
                              <div className="unmatched-details">
                                <h5>"{medicine.originalName}"</h5>
                                {medicine.normalizedName !== medicine.originalName && (
                                  <p className="normalized-name">Processed as: "{medicine.normalizedName}"</p>
                                )}
                                <p className="reason">
                                  {medicine.reason === 'not_found' && 'No matching products found in our database'}
                                  {medicine.reason === 'search_error' && 'Search error occurred'}
                                  {medicine.reason === 'processing_error' && 'Processing error occurred'}
                                </p>
                                {medicine.errorMessage && (
                                  <p className="error-details">Details: {medicine.errorMessage}</p>
                                )}
                              </div>
                              {medicine.suggestions && medicine.suggestions.length > 0 && (
                                <div className="suggestions">
                                  <h6>Suggestions:</h6>
                                  <ul>
                                    {medicine.suggestions.map((suggestion, idx) => (
                                      <li key={idx}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="order-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-row">
                          <span>Available Medicines:</span>
                          <span className="available-count">{extractedData.medicines.length}</span>
                        </div>
                        {extractedData.unmatchedMedicines && extractedData.unmatchedMedicines.length > 0 && (
                          <div className="summary-row">
                            <span>Unavailable Medicines:</span>
                            <span className="unavailable-count">{extractedData.unmatchedMedicines.length}</span>
                          </div>
                        )}
                        <div className="summary-row">
                          <span>Total Amount (Available):</span>
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
    </ErrorBoundary>
  );
};

export default PrescriptionUpload;
