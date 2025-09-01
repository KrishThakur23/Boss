import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import VoiceSearchButton from './VoiceSearchButton';
import './HeroSection.css';

const HeroSection = forwardRef(({ currentSearchTerm }, ref) => {
  return (
    <section className="hero-section" ref={ref}>
      <div className="container">
        <div className="hero-content">
          <h1>What are you looking for?</h1>
          <p>Find medicines, lab tests, and more</p>

          {/* Search Bar */}
          <div className="hero-search-container">
            <input type="text" className="hero-search-bar" placeholder=" " />
            <div className="custom-placeholder">
              <span className="static-text">Search for&nbsp;</span>
              <div className="dynamic-text-wrapper">
                <span className="dynamic-text">{currentSearchTerm}</span>
              </div>
            </div>
            <VoiceSearchButton
              className="voice-search-btn hero-voice-btn"
              aria-label="Voice Search"
              title="Voice Search"
            />
            <button className="hero-search-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
              </svg>
            </button>
          </div>

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
