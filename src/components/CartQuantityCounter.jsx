import React from 'react';

const CartQuantityCounter = ({ 
  quantity = 1, 
  onIncrease, 
  onDecrease, 
  min = 1, 
  max = 99, 
  disabled = false,
  loading = false,
  className = ''
}) => {
  const handleDecrease = () => {
    if (!disabled && !loading && quantity > min && onDecrease) {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (!disabled && !loading && quantity < max && onIncrease) {
      onIncrease();
    }
  };

  return (
    <div className={`
      inline-flex items-center justify-center
      bg-white border-2 border-gray-100 rounded-full
      shadow-sm hover:shadow-md hover:border-blue-200
      transition-all duration-200 ease-in-out
      h-9 px-1
      ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
      ${className}
    `}>
      {/* Minus Button */}
      <button
        onClick={handleDecrease}
        disabled={disabled || loading || quantity <= min}
        className={`
          flex items-center justify-center
          w-7 h-7 rounded-full
          text-gray-400 hover:text-white
          hover:bg-red-500 active:bg-red-600
          transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-400 disabled:hover:bg-transparent
          focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50
          group
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
          className="transition-transform duration-150 group-hover:scale-110"
        >
          <path d="M5 12h14"/>
        </svg>
      </button>

      {/* Quantity Display */}
      <div className="flex items-center justify-center px-3 min-w-[2.5rem]">
        {loading ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="font-bold text-gray-800 text-sm select-none">
            {quantity}
          </span>
        )}
      </div>

      {/* Plus Button */}
      <button
        onClick={handleIncrease}
        disabled={disabled || loading || quantity >= max}
        className={`
          flex items-center justify-center
          w-7 h-7 rounded-full
          text-gray-400 hover:text-white
          hover:bg-green-500 active:bg-green-600
          transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-400 disabled:hover:bg-transparent
          focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50
          group
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
          className="transition-transform duration-150 group-hover:scale-110"
        >
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
};

// Compact version for tight spaces
export const CompactQuantityCounter = ({ 
  quantity = 1, 
  onIncrease, 
  onDecrease, 
  min = 1, 
  max = 99, 
  disabled = false,
  loading = false,
  className = ''
}) => {
  const handleDecrease = () => {
    if (!disabled && !loading && quantity > min && onDecrease) {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (!disabled && !loading && quantity < max && onIncrease) {
      onIncrease();
    }
  };

  return (
    <div className={`
      inline-flex items-center justify-center
      bg-gray-50 border border-gray-200 rounded-lg
      shadow-sm hover:shadow-md
      transition-all duration-200 ease-in-out
      h-8 px-1
      ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300'}
      ${className}
    `}>
      {/* Minus Button */}
      <button
        onClick={handleDecrease}
        disabled={disabled || loading || quantity <= min}
        className={`
          flex items-center justify-center
          w-6 h-6 rounded
          text-gray-500 hover:text-white hover:bg-red-500
          transition-all duration-150 ease-in-out
          transform active:scale-90
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-500 disabled:hover:bg-transparent
          focus:outline-none focus:ring-1 focus:ring-red-300
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
      <div className="flex items-center justify-center px-2 min-w-[1.5rem]">
        {loading ? (
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="font-semibold text-gray-800 text-xs select-none">
            {quantity}
          </span>
        )}
      </div>

      {/* Plus Button */}
      <button
        onClick={handleIncrease}
        disabled={disabled || loading || quantity >= max}
        className={`
          flex items-center justify-center
          w-6 h-6 rounded
          text-gray-500 hover:text-white hover:bg-green-500
          transition-all duration-150 ease-in-out
          transform active:scale-90
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:scale-100 disabled:hover:text-gray-500 disabled:hover:bg-transparent
          focus:outline-none focus:ring-1 focus:ring-green-300
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

export default CartQuantityCounter;