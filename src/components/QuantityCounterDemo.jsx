import React, { useState } from 'react';
import QuantityCounter, { ColoredQuantityCounter } from './QuantityCounter';

const QuantityCounterDemo = () => {
  const [quantities, setQuantities] = useState({
    basic: 1,
    small: 2,
    large: 3,
    colored1: 1,
    colored2: 5,
    colored3: 2,
    disabled: 1,
    limited: 1
  });

  const updateQuantity = (key, delta) => {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(1, prev[key] + delta)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quantity Counter Components
          </h1>
          <p className="text-lg text-gray-600">
            Modern, responsive quantity selectors with smooth animations
          </p>
        </div>

        {/* Basic Variants */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Basic Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Small</h3>
              <QuantityCounter
                size="sm"
                quantity={quantities.small}
                onIncrease={() => updateQuantity('small', 1)}
                onDecrease={() => updateQuantity('small', -1)}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Medium (Default)</h3>
              <QuantityCounter
                quantity={quantities.basic}
                onIncrease={() => updateQuantity('basic', 1)}
                onDecrease={() => updateQuantity('basic', -1)}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Large</h3>
              <QuantityCounter
                size="lg"
                quantity={quantities.large}
                onIncrease={() => updateQuantity('large', 1)}
                onDecrease={() => updateQuantity('large', -1)}
              />
            </div>
          </div>
        </div>

        {/* Colored Variants */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Colored Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Blue</h3>
              <ColoredQuantityCounter
                color="blue"
                quantity={quantities.colored1}
                onIncrease={() => updateQuantity('colored1', 1)}
                onDecrease={() => updateQuantity('colored1', -1)}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Green</h3>
              <ColoredQuantityCounter
                color="green"
                quantity={quantities.colored2}
                onIncrease={() => updateQuantity('colored2', 1)}
                onDecrease={() => updateQuantity('colored2', -1)}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Purple</h3>
              <ColoredQuantityCounter
                color="purple"
                quantity={quantities.colored3}
                onIncrease={() => updateQuantity('colored3', 1)}
                onDecrease={() => updateQuantity('colored3', -1)}
              />
            </div>
          </div>
        </div>

        {/* Special States */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Special States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Disabled</h3>
              <QuantityCounter
                quantity={quantities.disabled}
                disabled={true}
                onIncrease={() => updateQuantity('disabled', 1)}
                onDecrease={() => updateQuantity('disabled', -1)}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Limited Range (1-5)</h3>
              <ColoredQuantityCounter
                color="red"
                quantity={quantities.limited}
                min={1}
                max={5}
                onIncrease={() => updateQuantity('limited', 1)}
                onDecrease={() => updateQuantity('limited', -1)}
              />
              <p className="text-sm text-gray-500 mt-2">Max: 5 items</p>
            </div>
          </div>
        </div>

        {/* E-commerce Example */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">E-commerce Example</h2>
          
          <div className="max-w-md mx-auto">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop&crop=center" 
                  alt="Product" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Premium Headphones</h3>
                  <p className="text-gray-600">$99.99</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <ColoredQuantityCounter
                    color="blue"
                    size="sm"
                    quantity={quantities.basic}
                    onIncrease={() => updateQuantity('basic', 1)}
                    onDecrease={() => updateQuantity('basic', -1)}
                  />
                  <p className="text-sm text-gray-500">
                    Total: ${(99.99 * quantities.basic).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Code */}
        <div className="bg-gray-900 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Usage Example</h2>
          <pre className="text-green-400 text-sm overflow-x-auto">
{`import QuantityCounter, { ColoredQuantityCounter } from './QuantityCounter';

// Basic usage
<QuantityCounter
  quantity={quantity}
  onIncrease={() => setQuantity(q => q + 1)}
  onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
  min={1}
  max={10}
  size="md"
/>

// Colored variant
<ColoredQuantityCounter
  color="blue"
  quantity={quantity}
  onIncrease={() => setQuantity(q => q + 1)}
  onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
  size="sm"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QuantityCounterDemo;