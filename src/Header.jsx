import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { supabase } from './config/supabase';
import VoiceSearchButton from './VoiceSearchButton';
import './Header.css';

const Header = forwardRef(({ isSearchActive, currentSearchTerm = 'medicines' }, ref) => {
  const { isAuthenticated, user } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  // You can change this email to your own admin email
  const ADMIN_EMAIL = 'bhalackdhebil@gmail.com'; // Change this to your email
  const isAdminUser = user?.email ? user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : false;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);
  const [displayText, setDisplayText] = useState(currentSearchTerm);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userAddresses, setUserAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setShowUserDropdown(prev => !prev);
  };

  // Update display text when currentSearchTerm changes with animation
  useEffect(() => {
    if (currentSearchTerm && currentSearchTerm !== displayText) {
      setIsAnimating(true);
      
      // Small delay to show the animation
      setTimeout(() => {
        setDisplayText(currentSearchTerm);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentSearchTerm, displayText]);


  const changeLocation = () => {
    navigate('/addresses');
  };

  const addAddress = () => {
    navigate('/addresses');
  };

  // Fetch user addresses
  const fetchUserAddresses = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoadingAddresses(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setUserAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Load addresses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserAddresses();
    } else {
      setUserAddresses([]);
    }
  }, [isAuthenticated, user]);

  // Refresh addresses when page becomes visible (user returns from addresses page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user) {
        fetchUserAddresses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
        setShowUserDropdown(false);
        setIsMobileMenuOpen(false);
      }
    };
    if (isUserMenuOpen || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, showUserDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setShowUserDropdown(false);
  }, [window.location.pathname]);

  // Handle sign out and redirect to sign in page
  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (_) {}
      
      // Redirect to sign in page
      navigate('/signin');
    } catch (error) {
      // Even if sign out fails, redirect to sign in page
      navigate('/signin');
    }
  };

  return (
    <header className={`header ${isSearchActive ? 'search-active' : ''}`} ref={ref}>
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">FlickXir</Link>
          <div className="location-container">
            {isAuthenticated ? (
              userAddresses && userAddresses.length > 0 ? (
                <div className="location-display">
                  <span className="location-text">
                    {userAddresses[0]?.city}, {userAddresses[0]?.state}
                  </span>
                  <button className="location-change-btn" onClick={() => navigate('/addresses')}>
                    Change
                  </button>
                </div>
              ) : (
                <button className="location-add-btn" onClick={() => navigate('/addresses')}>
                  Add Address
                </button>
              )
            ) : (
              <button className="location-add-btn" onClick={() => navigate('/signin')}>
                Add Address
              </button>
            )}
          </div>
        </div>



        <div className="user-actions">
          <div className="header-search-container">
            <input 
              type="text" 
              className="header-search-bar" 
              placeholder=" "
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className={`custom-placeholder header-placeholder ${searchValue ? 'hidden' : ''}`}>
              <span className="static-text">Search for&nbsp;</span>
              <div className="dynamic-text-wrapper">
                <span className={`dynamic-text ${isAnimating ? 'exit' : ''}`}>
                  {displayText}
                </span>
              </div>
            </div>
            <div className="search-icons">
              <VoiceSearchButton 
                className="voice-search-btn"
                aria-label="Voice Search"
                title="Voice Search"
              />
              <button className="header-search-btn" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop/User actions (hidden on mobile via CSS) */}
        {isAuthenticated ? (
          <div className="user-section" ref={userMenuRef}>
            <button className="header-btn btn-user" onClick={toggleUserDropdown}>
              <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {/* User/account icon */}
                <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 
                        7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4
                        c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4
                        c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
              <span className="btn-text">Hello, {user?.user_metadata?.first_name || 'User'}</span>
            </button>

            {showUserDropdown && (
              <div className="user-dropdown">
                <Link to="/profile" className="user-dropdown-item">
                  👤 Profile
                </Link>
                <Link to="/my-orders" className="user-dropdown-item">
                  📦 My Orders
                </Link>
                {isAdminUser && (
                  <Link to="/admin" className="user-dropdown-item">
                    🛠️ Admin Dashboard
                  </Link>
                )}
                <button onClick={handleSignOut} className="user-dropdown-item signout-btn">
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signup" className="header-btn btn-user">
            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {/* User/account icon */}
              <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 
                      7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4
                      c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4
                      c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            <span className="btn-text">Sign up</span>
          </Link>
        )}

        <Link to="/donate" className="header-btn btn-donate">
          <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="btn-text">Donate here</span>
        </Link>

        <Link to="/cart" className="header-btn btn-cart">
          <div className="cart-icon-wrapper">
            <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            {getCartItemCount() > 0 && (
              <span className="cart-badge">{getCartItemCount()}</span>
            )}
          </div>
          <span className="btn-text">Cart</span>
        </Link>

        {/* Mobile hamburger button (shown on mobile via CSS) */}
        <button
          className="mobile-menu-btn"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" ref={userMenuRef}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              {isAdminUser && (
                <Link to="/admin" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <Link to="/donate" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Donate here</Link>
              <Link to="/cart" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Cart ({getCartItemCount()})</Link>
              <button className="mobile-menu-item signout" onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              <Link to="/donate" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Donate here</Link>
              <Link to="/cart" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>Cart ({getCartItemCount()})</Link>
            </>
          )}
        </div>
      )}

    </header>
  );
});

Header.displayName = 'Header';

export default Header;
