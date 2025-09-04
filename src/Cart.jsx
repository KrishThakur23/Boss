import React, { useMemo, useCallback } from 'react';
import { useCart } from './contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CartLoadingSkeleton
} from './components/LoadingComponents';
import './Cart.css';

// Memoized CartItem component to prevent unnecessary re-renders
const CartItem = React.memo(({ item, index, onUpdateQuantity, onRemove }) => {
  const handleQuantityDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleQuantityIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  const handleImageError = useCallback((e) => {
    e.target.src = '/placeholder-image.jpg';
  }, []);

  const subtotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity]);

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img 
          src={item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '/placeholder-image.jpg'} 
          alt={item.name}
          onError={handleImageError}
        />
        <div className="item-number">{index + 1}</div>
      </div>
      
      <div className="cart-item-details">
        <div className="item-main-info">
          <h3 className="cart-item-name">{item.name}</h3>
          <div className="item-tags">
            <span className="tag">Healthcare</span>
            <span className="tag">Quality Assured</span>
          </div>
        </div>
        
        <div className="item-pricing">
          <div className="price-info">
            <span className="current-price">₹{item.price}</span>
            {item.mrp && item.mrp > item.price && (
              <span className="mrp-price">₹{item.mrp}</span>
            )}
          </div>
          
          <div className="cart-item-quantity">
            <label>Quantity:</label>
            <div className="quantity-controls" style={{ position: 'relative' }}>
              <button
                onClick={handleQuantityDecrease}
                className="quantity-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                </svg>
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button
                onClick={handleQuantityIncrease}
                className="quantity-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="cart-item-subtotal">
          <span className="subtotal-label">Subtotal:</span>
          <span className="subtotal-amount">₹{subtotal}</span>
        </div>
      </div>
      
      <div className="cart-item-actions">
        <button
          onClick={handleRemove}
          className="remove-item-btn"
          title="Remove item"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';



// Memoized CartSummary component
const CartSummary = React.memo(({ items, cartTotal, onCheckout }) => {
  const shippingCost = useMemo(() => cartTotal > 500 ? 0 : 50, [cartTotal]);
  const totalAmount = useMemo(() => cartTotal + shippingCost, [cartTotal, shippingCost]);
  const freeShippingRemaining = useMemo(() => Math.max(0, 500 - cartTotal), [cartTotal]);

  return (
    <div className="cart-summary">
      <div className="cart-summary-card">
        <div className="summary-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
          </svg>
          <h3>Order Summary</h3>
        </div>
        
        <div className="summary-details">
          <div className="summary-row">
            <span>Items ({items.length}):</span>
            <span>₹{cartTotal}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping:</span>
            <span className={shippingCost === 0 ? 'free-shipping' : ''}>
              {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
            </span>
          </div>
          
          {shippingCost > 0 && (
            <div className="free-shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Add ₹{freeShippingRemaining} more for free shipping!
            </div>
          )}
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
        
        <button 
          className="checkout-btn"
          onClick={onCheckout}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Proceed to Checkout
        </button>
        
        <Link to="/" className="continue-shopping-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Continue Shopping
        </Link>
      </div>
      
      <div className="cart-benefits">
        <div className="benefit-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span>Free shipping on orders above ₹500</span>
        </div>
        <div className="benefit-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
          </svg>
          <span>100% genuine products</span>
        </div>
        <div className="benefit-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
});

CartSummary.displayName = 'CartSummary';

const Cart = () => {
  const { 
    items, 
    isLoading, 
    isInitialized, 
    isStable, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal 
  } = useCart();
  const navigate = useNavigate();
  
  // Memoize callback functions to prevent unnecessary re-renders
  const handleUpdateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, quantity);
    }
  }, [updateQuantity, removeFromCart]);

  const handleRemoveFromCart = useCallback(async (itemId) => {
    await removeFromCart(itemId);
  }, [removeFromCart]);

  const handleClearCart = useCallback(async () => {
    await clearCart();
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  // Memoize computed values
  const itemsCount = useMemo(() => items.length, [items.length]);
  const itemsText = useMemo(() => itemsCount === 1 ? 'item' : 'items', [itemsCount]);

  // Show skeleton loading during initial load or when cart is not stable
  if (!isInitialized || (isLoading && !isStable)) {
    return <CartLoadingSkeleton />;
  }

  if (itemsCount === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <div className="cart-empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="continue-shopping-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div className="cart-header-left">
            <div className="cart-header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div>
              <h1>Shopping Cart</h1>
              <p className="cart-subtitle">{itemsCount} {itemsText} in your cart</p>
            </div>
          </div>
          <button onClick={handleClearCart} className="clear-cart-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-items-header">
              <h3>Cart Items</h3>
              <span className="items-count">{itemsCount} items</span>
            </div>
            
            {items.map((item, index) => (
              <CartItem
                key={item.id}
                item={item}
                index={index}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}

              />
            ))}
          </div>

          <CartSummary
            items={items}
            cartTotal={cartTotal}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
      
      {/* Remove all ContextualCartLoader components - they were causing infinite re-renders */}
    </div>
  );
};

export default Cart;
