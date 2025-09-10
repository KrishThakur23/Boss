import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VoiceSearchButton from './VoiceSearchButton';
import ProductSearchService from './services/productSearchService';
import './HeroSection.css';

const HeroSection = forwardRef(({ currentSearchTerm }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestions(searchQuery.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const { data: products, error } = await ProductSearchService.searchProductsByName(query);
      
      if (!error && products) {
        // Get top 5 suggestions with different categories
        const topSuggestions = products
          .slice(0, 8)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            inStock: product.in_stock,
            manufacturer: product.manufacturer,
            relevanceScore: 100 // Default relevance score for simple search
          }));
        
        setSuggestions(topSuggestions);
        setShowSuggestions(topSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Navigate to products page with the selected product name as search
    navigate(`/products?search=${encodeURIComponent(suggestion.name)}`);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <section className="hero-section" ref={ref}>
      <div className="container">
        <div className="hero-content">
          <h1>Search for essentials</h1>
          <p>Find medicines, lab tests, and more</p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="hero-search-container">
              <input 
                ref={searchInputRef}
                type="text" 
                className="hero-search-bar" 
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={isFocused || searchQuery ? '' : `Search for ${currentSearchTerm || 'medicines, healthcare products...'}`}
                autoComplete="off"
              />
              
              {/* Loading indicator */}
              {isSearching && (
                <div className="search-loading">
                  <div className="search-spinner"></div>
                </div>
              )}

              <VoiceSearchButton
                className="voice-search-btn hero-voice-btn"
                aria-label="Voice Search"
                title="Voice Search"
                onResult={(result) => {
                  setSearchQuery(result);
                  if (result.trim()) {
                    navigate(`/products?search=${encodeURIComponent(result.trim())}`);
                  }
                }}
              />
              
              <button 
                type="submit" 
                className="hero-search-btn" 
                aria-label="Search"
                disabled={!searchQuery.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
                </svg>
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="search-suggestions">
                  <div className="suggestions-header">
                    <span>Suggested Products</span>
                  </div>
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion) => (
                      <li 
                        key={suggestion.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="suggestion-content">
                          <div className="suggestion-name">{suggestion.name}</div>
                          <div className="suggestion-details">
                            <span className="suggestion-manufacturer">{suggestion.manufacturer}</span>
                            <span className="suggestion-price">₹{suggestion.price}</span>
                            <span className={`suggestion-stock ${suggestion.inStock ? 'in-stock' : 'out-of-stock'}`}>
                              {suggestion.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </span>
                          </div>
                        </div>
                        <div className="suggestion-arrow">→</div>
                      </li>
                    ))}
                  </ul>
                  <div className="suggestions-footer">
                    <button 
                      type="button"
                      className="view-all-results"
                      onClick={() => handleSearchSubmit({ preventDefault: () => {} })}
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}

              {/* No results message */}
              {showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                <div ref={suggestionsRef} className="search-suggestions">
                  <div className="no-suggestions">
                    <div className="no-suggestions-icon">🔍</div>
                    <div className="no-suggestions-text">
                      <p>No products found for "{searchQuery}"</p>
                      <p className="no-suggestions-hint">Try searching for generic names or check spelling</p>
                    </div>
                    <button 
                      type="button"
                      className="search-anyway-btn"
                      onClick={() => handleSearchSubmit({ preventDefault: () => {} })}
                    >
                      Search anyway
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Prescription Upload */}
          <div className="hero-prescription">
            <span>Order with prescription.</span>
            <Link to="/prescription-upload" className="hero-upload-link">UPLOAD NOW &gt;</Link>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
