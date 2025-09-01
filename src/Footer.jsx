import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const handleAboutClick = () => {
    if (location.pathname === '/about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <footer className="pe-footer">
      <div className="pe-footer-main">
        <div className="pe-footer-col">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about" onClick={handleAboutClick}>About Us</Link></li>
            <li><Link to="/donate">Donate Us</Link></li>
          </ul>
        </div>
        
        <div className="pe-footer-col">
          <h3>Customer Care</h3>
          <ul>
            <li><Link to="/help-center">Help Center</Link></li>
            <li><Link to="/order-tracking">Order Tracking</Link></li>
            <li><Link to="/shipping-info">Shipping Info</Link></li>
            <li><Link to="/return-policy">Return Policy</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        
        <div className="pe-footer-col">
          <h3>Legal</h3>
          <ul>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/disclaimer">Disclaimer</Link></li>
            <li><Link to="/report-vulnerability">Report a vulnerability</Link></li>
          </ul>
        </div>
        
        <div className="pe-footer-col">
          <h3>Contact Details</h3>
          <ul>
            <li><span>📧 support@Flickxirindia.com</span></li>
            <li><span>📞 +91-9876543210</span></li>
            <li><span>📍 Greater Noida, Uttar Pradesh, India</span></li>
          </ul>
        </div>
        
        <div className="pe-footer-col">
          <h3>Follow Us</h3>
          <div className="pe-social-links">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.333.011 7.053.069 2.59.285.285 2.59.069 7.053.011 8.333 0 8.74 0 12s.011 3.667.069 4.947c.216 4.46 2.525 6.765 7.053 6.981C8.333 23.989 8.74 24 12 24s3.667-.011 4.947-.069c4.46-.216 6.765-2.525 6.981-7.053C23.989 15.667 24 15.26 24 12s-.011-3.667-.069-4.947c-.216-4.46-2.525-6.765-6.981-7.053C15.667.011 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085 4.934 4.934 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="pe-footer-bottom">
        <div className="pe-footer-bottom-container">
          <div className="pe-copyright">
            <p>&copy; 2025 FlickXir India. All Rights Reserved.</p>
          </div>
          <div className="pe-disclaimer">
            <p><strong>Disclaimer:</strong> This is a clone for educational purposes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
