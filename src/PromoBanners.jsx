import React, { useState, useEffect } from 'react';
import './PromoBanners.css';

const PromoBanners = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const promotions = [
    {
      id: 1,
      category: 'Lab Test Deals',
      title: 'Buy 1 Get 1 FREE',
      subtitle: 'on Comprehensive full body checkup with Vitamin D & B12',
      offer: 'Extra 20% Plus FlickXir Credits',
      cta: 'Add to Health Basket',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="25" fill="url(#labGradient)" stroke="url(#labGradient)" strokeWidth="2"/>
          <path d="M20 25h20M20 30h15M20 35h20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="40" cy="25" r="3" fill="white"/>
          <defs>
            <linearGradient id="labGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="100%" stopColor="#EC4899"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)'
    },
    {
      id: 2,
      category: 'Wellness Offers',
      title: 'Glenmark Lightweight Sunscreen',
      subtitle: 'Your summer skin\'s best defence',
      offer: 'Get Extra 5% Plus FlickXir Credits',
      cta: 'Get Healthy Now',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="25" fill="url(#wellnessGradient)" stroke="url(#wellnessGradient)" strokeWidth="2"/>
          <path d="M20 20l10 10 20-20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10B981, #059669)'
    },
    {
      id: 3,
      category: 'Doctor-Recommended',
      title: 'Prohance',
      subtitle: 'Backed by science. Trusted by doctors.',
      offer: 'Expert Recommended',
      cta: 'Order on WhatsApp',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="30" height="30" rx="6" fill="url(#doctorGradient)" stroke="url(#doctorGradient)" strokeWidth="2"/>
          <rect x="25" y="10" width="10" height="40" rx="5" fill="url(#doctorGradient)"/>
          <rect x="10" y="25" width="40" height="10" rx="5" fill="url(#doctorGradient)"/>
          <defs>
            <linearGradient id="doctorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <section className="promo-banners">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Special Offers</h2>
          <p className="section-subtitle">Exclusive deals to keep you healthy</p>
        </div>
        
        <div className="carousel-section">
          <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className="carousel-container">
            <div className="carousel-wrapper">
              <div 
                className="carousel-track" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {promotions.map((promo) => (
                  <div key={promo.id} className="promo-slide">
                    <div className="promo-banner" style={{ background: promo.gradient }}>
                      <div className="banner-content">
                        <div className="promo-category">{promo.category}</div>
                        <h3 className="banner-title">{promo.title}</h3>
                        <p className="banner-subtitle">{promo.subtitle}</p>
                        <div className="banner-offer">{promo.offer}</div>
                        <button className="banner-btn">{promo.cta}</button>
                      </div>
                      <div className="banner-icon">
                        {promo.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        <div className="carousel-dots">
          {promotions.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
