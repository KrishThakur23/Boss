/**
 * User Feedback Components
 * Reusable components for displaying success, error, and warning messages
 */

import React, { useState, useEffect } from 'react';
import './UserFeedback.css';

/**
 * Base Message Component
 */
const BaseMessage = ({ 
  type, 
  title, 
  message, 
  suggestions = [], 
  onRetry, 
  onDismiss, 
  technicalDetails,
  autoHide = false,
  children 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className={`user-feedback-message ${type}`}>
      <div className="message-header">
        <div className="message-icon">{getIcon()}</div>
        <div className="message-content">
          {title && <h4 className="message-title">{title}</h4>}
          <p className="message-text">{message}</p>
        </div>
        <button 
          className="dismiss-button" 
          onClick={handleDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="message-suggestions">
          <p className="suggestions-title">Suggestions:</p>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {onRetry && (
        <div className="message-actions">
          <button 
            className="retry-button"
            onClick={onRetry}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {technicalDetails && (
        <div className="technical-details">
          <button 
            className="toggle-details-button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          >
            {showTechnicalDetails ? '▼' : '▶'} Technical Details
          </button>
          {showTechnicalDetails && (
            <div className="technical-details-content">
              <code>{technicalDetails}</code>
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

/**
 * Success Message Component
 */
export const SuccessMessage = (props) => (
  <BaseMessage type="success" {...props} />
);

/**
 * Error Message Component
 */
export const ErrorMessage = (props) => (
  <BaseMessage type="error" {...props} />
);

/**
 * Warning Message Component
 */
export const WarningMessage = (props) => (
  <BaseMessage type="warning" {...props} />
);

/**
 * Info Message Component
 */
export const InfoMessage = (props) => (
  <BaseMessage type="info" {...props} />
);

/**
 * Loading Message Component
 */
export const LoadingMessage = ({ message = 'Processing...', progress }) => (
  <div className="user-feedback-message loading">
    <div className="message-header">
      <div className="message-icon">
        <div className="spinner"></div>
      </div>
      <div className="message-content">
        <p className="message-text">{message}</p>
        {progress !== undefined && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Prescription Processing Status Component
 */
export const PrescriptionProcessingStatus = ({ 
  stage, 
  progress, 
  currentStep, 
  totalSteps,
  error 
}) => {
  const stages = {
    'uploading': { icon: '📤', message: 'Uploading prescription...' },
    'ocr': { icon: '👁️', message: 'Reading prescription text...' },
    'matching': { icon: '🔍', message: 'Finding matching medicines...' },
    'cart': { icon: '🛒', message: 'Adding to cart...' },
    'complete': { icon: '✅', message: 'Processing complete!' },
    'error': { icon: '❌', message: 'Processing failed' }
  };

  const currentStage = stages[stage] || stages['uploading'];

  if (error) {
    return <ErrorMessage title="Processing Failed" message={error} />;
  }

  return (
    <div className="prescription-processing-status">
      <div className="status-header">
        <span className="status-icon">{currentStage.icon}</span>
        <span className="status-message">{currentStage.message}</span>
      </div>
      
      {progress !== undefined && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {currentStep && totalSteps && (
        <div className="step-counter">
          Step {currentStep} of {totalSteps}
        </div>
      )}
    </div>
  );
};

/**
 * Medicine Match Result Component
 */
export const MedicineMatchResult = ({ 
  originalName, 
  matchedProduct, 
  confidence, 
  alternatives = [],
  onAddToCart,
  onSelectAlternative 
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (!matchedProduct) {
    return (
      <div className="medicine-match-result no-match">
        <div className="match-header">
          <span className="match-icon">❌</span>
          <div className="match-info">
            <h4 className="original-name">{originalName}</h4>
            <p className="match-status">Sorry, we don't have this product</p>
          </div>
        </div>
        
        {alternatives.length > 0 && (
          <div className="alternatives-section">
            <button 
              className="show-alternatives-button"
              onClick={() => setShowAlternatives(!showAlternatives)}
            >
              {showAlternatives ? '▼' : '▶'} View Similar Products ({alternatives.length})
            </button>
            
            {showAlternatives && (
              <div className="alternatives-list">
                {alternatives.map((alt, index) => (
                  <div key={index} className="alternative-item">
                    <span className="alt-name">{alt.name}</span>
                    <span className="alt-price">₹{alt.price}</span>
                    <button 
                      className="select-alt-button"
                      onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="medicine-match-result matched">
      <div className="match-header">
        <span className="match-icon">✅</span>
        <div className="match-info">
          <h4 className="matched-name">{matchedProduct.name}</h4>
          {originalName !== matchedProduct.name && (
            <p className="original-name">Originally: "{originalName}"</p>
          )}
          <div className="match-details">
            <span className="confidence">Confidence: {confidence}%</span>
            <span className="manufacturer">By {matchedProduct.manufacturer}</span>
          </div>
        </div>
      </div>
      
      <div className="product-details">
        <div className="price-info">
          <span className="price">₹{matchedProduct.price}</span>
          {matchedProduct.mrp && matchedProduct.mrp > matchedProduct.price && (
            <span className="mrp">MRP: ₹{matchedProduct.mrp}</span>
          )}
        </div>
        
        <div className="availability">
          <span className={`stock-status ${matchedProduct.inStock ? 'in-stock' : 'out-of-stock'}`}>
            {matchedProduct.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </span>
        </div>
        
        {matchedProduct.requiresPrescription && (
          <div className="prescription-required">
            📋 Prescription Required
          </div>
        )}
      </div>
      
      {matchedProduct.inStock && onAddToCart && (
        <div className="match-actions">
          <button 
            className="add-to-cart-button"
            onClick={() => onAddToCart(matchedProduct)}
          >
            🛒 Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Batch Operation Status Component
 */
export const BatchOperationStatus = ({ 
  operations, 
  onRetryFailed, 
  onDismiss 
}) => {
  const successful = operations.filter(op => op.status === 'success');
  const failed = operations.filter(op => op.status === 'error');
  const pending = operations.filter(op => op.status === 'pending');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="batch-operation-status">
      <div className="batch-summary">
        <h4>Operation Summary</h4>
        <div className="summary-stats">
          <span className="stat success">✅ {successful.length} successful</span>
          <span className="stat error">❌ {failed.length} failed</span>
          {pending.length > 0 && (
            <span className="stat pending">⏳ {pending.length} pending</span>
          )}
        </div>
      </div>
      
      {failed.length > 0 && (
        <div className="failed-operations">
          <h5>Failed Operations:</h5>
          <ul>
            {failed.map((op, index) => (
              <li key={index} className="failed-operation">
                <span className="op-name">{op.name}</span>
                <span className="op-error">{op.error}</span>
              </li>
            ))}
          </ul>
          
          {onRetryFailed && (
            <button 
              className="retry-failed-button"
              onClick={onRetryFailed}
            >
              🔄 Retry Failed Operations
            </button>
          )}
        </div>
      )}
      
      <div className="batch-actions">
        <button 
          className="dismiss-button"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};