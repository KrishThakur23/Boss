import React from 'react';

const QuantityCounter = ({ 
  quantity = 1, 
  onIncrease, 
  onDecrease, 
  min = 1, 
  max = 99, 
  disabled = false,
  size = 'md',
  className = ''
}) => {
  // Size variants
  const sizeClasses = {
    sm: {
      container: 'h-8 px-2',
      button: 'w-6 h-6 text-xs',
      quantity: 'text-sm px-2 min-w-[2rem]'
    },
    md: {
      container: 'h-10 px-3',
      button: 'w-8 h-8 text-sm',
      quantity: 'text-base px-3 min-w-[2.5rem]'
    },
    lg: {
      container: 'h-12 px-4',
      button: 'w-10 h-10 text-base',
      quantity: 'text-lg px-4 min-w-[3rem]'
    }
  };

  const currentSize = sizeClasses[size];

  const handleDecrease = () => {
    if (!disabled && quantity > min && onDecrease) {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (!disabled && quantity < max && onIncrease) {
      onIncrease();
    }
  };

  return (
    <div className={`
      inline-flex items-center justify-center
      bg-white border border-gray-200 rounded-full
      shadow-sm hover:shadow-md
      transition-all duration-200 ease-in-out
      ${currentSize.container}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
      ${className}
    `}>
      {/* Minus Button */}
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className={`
          flex items-center justify-center
          rounded-full border-0 bg-transparent
          text-gray-500 hover:text-white hover:bg-red-500
          transition-all duration-150 ease-in-out
          transform hover:scale-110 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-500 disabled:hover:bg-transparent
          focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50
          ${currentSize.button}
        `}
        aria-label="Decrease quantity"
      >
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M5 12h14"/>
        </svg>
      </button>

      {/* Quantity Display */}
      <div className={`
        flex items-center justify-center
        font-semibold text-gray-800
        select-none
        ${currentSize.quantity}
      `}>
        {quantity}
      </div>

      {/* Plus Button */}
      <button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className={`
          flex items-center justify-center
          rounded-full border-0 bg-transparent
          text-gray-500 hover:text-white hover:bg-green-500
          transition-all duration-150 ease-in-out
          transform hover:scale-110 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-500 disabled:hover:bg-transparent
          focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50
          ${currentSize.button}
        `}
        aria-label="Increase quantity"
      >
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
};

// Variant with colored buttons
export const ColoredQuantityCounter = ({ 
  quantity = 1, 
  onIncrease, 
  onDecrease, 
  min = 1, 
  max = 99, 
  disabled = false,
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      container: 'h-8 px-1',
      button: 'w-7 h-7 text-xs',
      quantity: 'text-sm px-2 min-w-[2rem]'
    },
    md: {
      container: 'h-10 px-1',
      button: 'w-9 h-9 text-sm',
      quantity: 'text-base px-3 min-w-[2.5rem]'
    },
    lg: {
      container: 'h-12 px-2',
      button: 'w-11 h-11 text-base',
      quantity: 'text-lg px-4 min-w-[3rem]'
    }
  };

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    red: 'bg-red-500 hover:bg-red-600 text-white',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
    gray: 'bg-gray-500 hover:bg-gray-600 text-white'
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];

  const handleDecrease = () => {
    if (!disabled && quantity > min && onDecrease) {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (!disabled && quantity < max && onIncrease) {
      onIncrease();
    }
  };

  return (
    <div className={`
      inline-flex items-center justify-center gap-1
      bg-gray-50 border border-gray-200 rounded-full
      shadow-sm hover:shadow-md
      transition-all duration-200 ease-in-out
      ${currentSize.container}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
      ${className}
    `}>
      {/* Minus Button */}
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className={`
          flex items-center justify-center
          rounded-full border-0
          transition-all duration-150 ease-in-out
          transform hover:scale-105 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${currentSize.button}
          ${disabled || quantity <= min ? 'bg-gray-300 text-gray-500' : currentColor}
          ${color === 'blue' ? 'focus:ring-blue-500' : 
            color === 'green' ? 'focus:ring-green-500' :
            color === 'red' ? 'focus:ring-red-500' :
            color === 'purple' ? 'focus:ring-purple-500' : 'focus:ring-gray-500'}
        `}
        aria-label="Decrease quantity"
      >
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M5 12h14"/>
        </svg>
      </button>

      {/* Quantity Display */}
      <div className={`
        flex items-center justify-center
        font-bold text-gray-800
        select-none
        ${currentSize.quantity}
      `}>
        {quantity}
      </div>

      {/* Plus Button */}
      <button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className={`
          flex items-center justify-center
          rounded-full border-0
          transition-all duration-150 ease-in-out
          transform hover:scale-105 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${currentSize.button}
          ${disabled || quantity >= max ? 'bg-gray-300 text-gray-500' : currentColor}
          ${color === 'blue' ? 'focus:ring-blue-500' : 
            color === 'green' ? 'focus:ring-green-500' :
            color === 'red' ? 'focus:ring-red-500' :
            color === 'purple' ? 'focus:ring-purple-500' : 'focus:ring-gray-500'}
        `}
        aria-label="Increase quantity"
      >
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
};

export default QuantityCounter;