import React from 'react';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';

const CartDebug = () => {
  const { items, isLoading, getCartItemCount, debugCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '10px', 
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Cart Debug</h4>
      <p><strong>Items:</strong> {getCartItemCount()}</p>
      <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User ID:</strong> {user?.id || 'None'}</p>
      <button onClick={debugCart} style={{ marginTop: '5px', padding: '5px' }}>
        Log Debug Info
      </button>
      <div style={{ marginTop: '5px', maxHeight: '100px', overflow: 'auto' }}>
        <strong>Items:</strong>
        {items.map(item => (
          <div key={item.id} style={{ fontSize: '10px' }}>
            {item.name} (x{item.quantity})
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartDebug;