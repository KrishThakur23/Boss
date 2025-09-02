import React, { useState } from 'react';
import QuantityCounter, { ColoredQuantityCounter } from './QuantityCounter';
import CartQuantityCounter, { CompactQuantityCounter } from './CartQuantityCounter';

// Example of how to integrate with your existing ProductSections component
const ProductCardExample = () => {
  const [cartItems, setCartItems] = useState({});
  const [loadingItems, setLoadingItems] = useState(new Set());

  const handleAddToCart = async (productId) => {
    setLoadingItems(prev => new Set(prev).add(productId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleUpdateQuantity = async (productId, delta) => {
    setLoadingItems(prev => new Set(prev).add(productId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCartItems(prev => {
      const newQuantity = (prev[productId] || 0) + delta;
      if (newQuantity <= 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
    
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const products = [
    { id: 1, name: 'Premium Headphones', price: 99.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
    { id: 2, name: 'Wireless Mouse', price: 29.99, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop' },
    { id: 3, name: 'Mechanical Keyboard', price: 149.99, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Product Cards with Quantity Counters
        </h1>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map(product => {
            const quantity = cartItems[product.id] || 0;
            const isInCart = quantity > 0;
            const isLoading = loadingItems.has(product.id);

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                  
                  {isInCart ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <CartQuantityCounter
                        quantity={quantity}
                        loading={isLoading}
                        onIncrease={() => handleUpdateQuantity(product.id, 1)}
                        onDecrease={() => handleUpdateQuantity(product.id, -1)}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        {Object.keys(cartItems).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cart Summary</h2>
            <div className="space-y-4">
              {Object.entries(cartItems).map(([productId, quantity]) => {
                const product = products.find(p => p.id === parseInt(productId));
                const isLoading = loadingItems.has(parseInt(productId));
                
                return (
                  <div key={productId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600">${product.price} each</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <CompactQuantityCounter
                        quantity={quantity}
                        loading={isLoading}
                        onIncrease={() => handleUpdateQuantity(parseInt(productId), 1)}
                        onDecrease={() => handleUpdateQuantity(parseInt(productId), -1)}
                      />
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ${(product.price * quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${Object.entries(cartItems).reduce((total, [productId, quantity]) => {
                      const product = products.find(p => p.id === parseInt(productId));
                      return total + (product.price * quantity);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Different Counter Styles Showcase */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Counter Style Variations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Standard</h3>
              <QuantityCounter
                quantity={3}
                onIncrease={() => {}}
                onDecrease={() => {}}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Colored</h3>
              <ColoredQuantityCounter
                color="green"
                quantity={2}
                onIncrease={() => {}}
                onDecrease={() => {}}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Cart Style</h3>
              <CartQuantityCounter
                quantity={5}
                onIncrease={() => {}}
                onDecrease={() => {}}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Compact</h3>
              <CompactQuantityCounter
                quantity={1}
                onIncrease={() => {}}
                onDecrease={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardExample;