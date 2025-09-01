import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import PromoBanners from './PromoBanners';
import CategoriesSection from './CategoriesSection';
import ProductSections from './ProductSections';

import './Home.css';

const Home = () => {
  const [isHeaderSearchActive, setIsHeaderSearchActive] = useState(false);
  const [animatedElements, setAnimatedElements] = useState([]);
  const [searchTerms] = useState(["medicines", "shampoo", "health drinks", "vitamins"]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const heroSearchRef = useRef(null);
  const headerRef = useRef(null);

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

  return (
    <div className="home">
      <Header ref={headerRef} isSearchActive={isHeaderSearchActive} currentSearchTerm={searchTerms[currentTermIndex]} />
      <main className="main-content">
        <HeroSection ref={heroSearchRef} currentSearchTerm={searchTerms[currentTermIndex]} />
        <PromoBanners />
        <CategoriesSection />
        <ProductSections />
      </main>

    </div>
  );
};

export default Home;
