import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRTest = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testOCR = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing Tesseract.js...');
      
      // Create a simple test image with text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 200;
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 200);
      
      // Add some test text
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.fillText('Test Prescription', 50, 50);
      ctx.fillText('Patient: John Doe', 50, 80);
      ctx.fillText('Medicine: Paracetamol 500mg', 50, 110);
      ctx.fillText('Dosage: 1 tablet 3 times daily', 50, 140);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'test-prescription.png', { type: 'image/png' });
      
      console.log('🧪 Processing test image...');
      
      // Process with Tesseract
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`🧪 Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('✅ OCR Test completed:', result.data);
      setResult(result.data);
      
    } catch (err) {
      console.error('❌ OCR Test failed:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 OCR Test Component</h2>
      <p>This component tests if Tesseract.js is working correctly.</p>
      
      <button 
        onClick={testOCR}
        disabled={isProcessing}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          opacity: isProcessing ? 0.7 : 1
        }}
      >
        {isProcessing ? 'Testing...' : 'Test OCR'}
      </button>
      
      {isProcessing && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Processing test image...</p>
        </div>
      )}
      
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <h3>✅ OCR Result:</h3>
          <p><strong>Text:</strong></p>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>{result.text}</pre>
          <p><strong>Confidence:</strong> {Math.round(result.confidence)}%</p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OCRTest;
