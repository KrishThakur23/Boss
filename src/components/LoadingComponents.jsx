import React from 'react';
import './LoadingComponents.css';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}>
      <div className="spinner-ring"></div>
    </div>
  );
};

// Shimmer Loader Component
export const ShimmerLoader = ({ className = '', width = '100%', height = '20px' }) => {
  return (
    <div 
      className={`shimmer-wrapper ${className}`}
      style={{ width, height }}
    >
      <div className="shimmer-effect"></div>
    </div>
  );
};

// Cart Item Skeleton with improved animations
export const CartItemSkeleton = () => (
  <div className="cart-item skeleton-item">
    <div className="cart-item-image">
      <ShimmerLoader className="skeleton-image" width="64px" height="64px" />
      <ShimmerLoader className="skeleton-number" width="20px" height="20px" />
    </div>
    
    <div className="cart-item-details">
      <div className="item-main-info">
        <ShimmerLoader className="skeleton-title" width="75%" height="16px" />
        <div className="item-tags">
          <ShimmerLoader className="skeleton-tag" width="80px" height="12px" />
          <ShimmerLoader className="skeleton-tag" width="100px" height="12px" />
        </div>
      </div>
      
      <div className="item-pricing">
        <div className="price-info">
          <ShimmerLoader className="skeleton-price" width="60px" height="16px" />
          <ShimmerLoader className="skeleton-mrp" width="50px" height="14px" />
        </div>
        
        <div className="cart-item-quantity">
          <ShimmerLoader className="skeleton-label" width="60px" height="14px" />
          <div className="quantity-controls">
            <ShimmerLoader className="skeleton-btn" width="32px" height="32px" />
            <ShimmerLoader className="skeleton-quantity" width="24px" height="16px" />
            <ShimmerLoader className="skeleton-btn" width="32px" height="32px" />
          </div>
        </div>
      </div>
      
      <div className="cart-item-subtotal">
        <ShimmerLoader className="skeleton-subtotal-label" width="60px" height="14px" />
        <ShimmerLoader className="skeleton-subtotal-amount" width="70px" height="16px" />
      </div>
    </div>
    
    <div className="cart-item-actions">
      <ShimmerLoader className="skeleton-remove-btn" width="36px" height="36px" />
    </div>
  </div>
);

// Cart Summary Skeleton with shimmer effects
export const CartSummarySkeleton = () => (
  <div className="cart-summary">
    <div className="cart-summary-card">
      <div className="summary-header">
        <ShimmerLoader className="skeleton-icon" width="24px" height="24px" />
        <ShimmerLoader className="skeleton-summary-title" width="120px" height="18px" />
      </div>
      
      <div className="summary-details">
        <div className="summary-row">
          <ShimmerLoader className="skeleton-summary-label" width="80px" height="14px" />
          <ShimmerLoader className="skeleton-summary-value" width="60px" height="14px" />
        </div>
        <div className="summary-row">
          <ShimmerLoader className="skeleton-summary-label" width="60px" height="14px" />
          <ShimmerLoader className="skeleton-summary-value" width="40px" height="14px" />
        </div>
        <div className="summary-row total">
          <ShimmerLoader className="skeleton-total-label" width="50px" height="16px" />
          <ShimmerLoader className="skeleton-total-value" width="80px" height="18px" />
        </div>
      </div>
      
      <ShimmerLoader className="skeleton-checkout-btn" width="100%" height="48px" />
      <ShimmerLoader className="skeleton-continue-link" width="140px" height="16px" />
    </div>
    
    <div className="cart-benefits">
      <div className="benefit-item">
        <ShimmerLoader className="skeleton-benefit-icon" width="20px" height="20px" />
        <ShimmerLoader className="skeleton-benefit-text" width="180px" height="14px" />
      </div>
      <div className="benefit-item">
        <ShimmerLoader className="skeleton-benefit-icon" width="20px" height="20px" />
        <ShimmerLoader className="skeleton-benefit-text" width="140px" height="14px" />
      </div>
      <div className="benefit-item">
        <ShimmerLoader className="skeleton-benefit-icon" width="20px" height="20px" />
        <ShimmerLoader className="skeleton-benefit-text" width="120px" height="14px" />
      </div>
    </div>
  </div>
);

// Full Cart Loading Skeleton
export const CartLoadingSkeleton = () => (
  <div className="cart-page">
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-header-left">
          <ShimmerLoader className="skeleton-header-icon" width="32px" height="32px" />
          <div>
            <ShimmerLoader className="skeleton-header-title" width="150px" height="24px" />
            <ShimmerLoader className="skeleton-header-subtitle" width="120px" height="16px" />
          </div>
        </div>
        <ShimmerLoader className="skeleton-clear-btn" width="100px" height="36px" />
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">
            <ShimmerLoader className="skeleton-items-title" width="100px" height="18px" />
            <ShimmerLoader className="skeleton-items-count" width="60px" height="16px" />
          </div>
          
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>

        <CartSummarySkeleton />
      </div>
    </div>
  </div>
);

// Operation Loading Overlay (for quick operations)
export const OperationLoader = ({ isVisible, message = 'Processing...' }) => {
  if (!isVisible) return null;
  
  return (
    <div className="operation-loader-overlay">
      <div className="operation-loader-content">
        <LoadingSpinner size="md" />
        <span className="operation-message">{message}</span>
      </div>
    </div>
  );
};

// Quantity Update Loader (inline spinner for quantity changes)
export const QuantityLoader = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="quantity-loader">
      <LoadingSpinner size="sm" />
    </div>
  );
};

// Contextual Cart Loader (shows different animations based on operation)
export const ContextualCartLoader = ({ operationType, isVisible, message }) => {
  if (!isVisible) return null;
  
  const getLoaderContent = () => {
    switch (operationType) {
      case 'sync':
        return (
          <>
            <LoadingSpinner size="lg" />
            <span className="operation-message">Syncing cart...</span>
          </>
        );
      case 'add':
        return (
          <>
            <LoadingSpinner size="md" />
            <span className="operation-message">Adding to cart...</span>
          </>
        );
      case 'remove':
        return (
          <>
            <LoadingSpinner size="md" />
            <span className="operation-message">Removing item...</span>
          </>
        );
      case 'update':
        return (
          <>
            <LoadingSpinner size="sm" />
            <span className="operation-message">Updating quantity...</span>
          </>
        );
      case 'clear':
        return (
          <>
            <LoadingSpinner size="lg" />
            <span className="operation-message">Clearing cart...</span>
          </>
        );
      default:
        return (
          <>
            <LoadingSpinner size="md" />
            <span className="operation-message">{message || 'Processing...'}</span>
          </>
        );
    }
  };
  
  return (
    <div className="operation-loader-overlay" data-operation={operationType}>
      <div className="operation-loader-content">
        {getLoaderContent()}
      </div>
    </div>
  );
};