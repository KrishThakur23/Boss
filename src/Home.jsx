import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import PromoBanners from './PromoBanners';
import CategoriesSection from './CategoriesSection';
import ProductSections from './ProductSections';
import { useAuth } from './contexts/AuthContext';

import './Home.css';

const Home = () => {
  const [isHeaderSearchActive, setIsHeaderSearchActive] = useState(false);
  const [animatedElements, setAnimatedElements] = useState([]);
  const [searchTerms] = useState(["medicines", "shampoo", "health drinks", "vitamins"]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(5000);
  const heroSearchRef = useRef(null);
  const headerRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => [...prev, entry.target]);
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Scroll event handler for header search
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroSection = heroSearchRef.current;
      
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        
        // Show header search when scrolling past hero section
        if (scrollY > heroBottom - 100) {
          setIsHeaderSearchActive(true);
        } else {
          setIsHeaderSearchActive(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for sticky header
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            headerRef.current?.classList.add('sticky');
          } else {
            headerRef.current?.classList.remove('sticky');
          }
        });
      },
      { threshold: 0 }
    );

    if (heroSearchRef.current) {
      observer.observe(heroSearchRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated search terms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTermIndex((prevIndex) => 
        (prevIndex + 1) % searchTerms.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [searchTerms.length]);

  // Animated delivery counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Personalized Greeting Component
  const PersonalizedGreeting = () => {
    if (!isAuthenticated || !user) return null;

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
      <section className="personalized-greeting">
        <div className="container">
          <div className="greeting-card">
            <div className="greeting-content">
              <h2 className="greeting-title">
                {greeting}, {userName}! 👋
              </h2>
              <p className="greeting-subtitle">
                Ready to take care of your health today?
              </p>
              <div className="quick-actions">
                <button className="quick-action-btn">
                  <span className="action-icon">💊</span>
                  <span>Reorder Medicines</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📋</span>
                  <span>Upload Prescription</span>
                </button>
              </div>
            </div>
            <div className="greeting-stats">
              <div className="stat-item">
                <div className="stat-number">{deliveryCount.toLocaleString()}+</div>
                <div className="stat-label">Prescriptions Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Trust Signals Component
  const TrustSignals = () => (
    <section className="trust-signals">
      <div className="container">
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon">🏥</div>
            <div className="trust-content">
              <h3>Licensed Pharmacy</h3>
              <p>Verified by Govt. of India</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <div className="trust-content">
              <h3>100% Secure</h3>
              <p>SSL Encrypted Transactions</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <div className="trust-content">
              <h3>Fast Delivery</h3>
              <p>Same Day Delivery Available</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">✅</div>
            <div className="trust-content">
              <h3>Genuine Products</h3>
              <p>100% Authentic Medicines</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="home">
      <Header ref={headerRef} isSearchActive={isHeaderSearchActive} currentSearchTerm={searchTerms[currentTermIndex]} />
      <main className="main-content">
        <HeroSection ref={heroSearchRef} currentSearchTerm={searchTerms[currentTermIndex]} />
        <PersonalizedGreeting />
        <TrustSignals />
        <PromoBanners />
        <CategoriesSection />
        <ProductSections />
      </main>
    </div>
  );
};

export default Home;
