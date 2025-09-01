import React from 'react';
import './PromoBanners.css';

const PromoBanners = () => {
  return (
    <section className="promo-banners">
      <div className="container">
        <div className="banner-grid">
          <div className="promo-banner lab-test-banner">
            <div className="banner-content">
              <h3>Buy 1 Get 1 FREE</h3>
              <p>on Comprehensive full body checkup with Vitamin D & B12</p>
              <div className="banner-offer">Extra 20% Plus FlickXir Credits</div>
              <button className="banner-btn">BOGO Book Now</button>
            </div>
            <div className="banner-image">🩸</div>
          </div>
          
          <div className="promo-banner sunscreen-banner">
            <div className="banner-content">
              <h3>Glenmark Lightweight Sunscreen</h3>
              <p>Your summer skin's best defence</p>
              <div className="banner-offer">Get Extra 5% Plus FlickXir Credits</div>
              <button className="banner-btn">BUY NOW</button>
            </div>
            <div className="banner-image">🧴</div>
          </div>
          
          <div className="promo-banner supplement-banner">
            <div className="banner-content">
              <h3>Prohance</h3>
              <p>Backed by science. Trusted by doctors.</p>
              <button className="banner-btn whatsapp-btn">ORDER ON WHATSAPP</button>
            </div>
            <div className="banner-image">💊</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
