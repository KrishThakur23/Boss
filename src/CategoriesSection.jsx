import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const navigate = useNavigate();


  const categories = [
    {
      name: 'Medicine',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="12" width="24" height="24" rx="4" fill="url(#medicineGradient)" stroke="url(#medicineGradient)" strokeWidth="2"/>
          <rect x="20" y="8" width="8" height="32" rx="4" fill="url(#medicineGradient)"/>
          <rect x="8" y="20" width="32" height="8" rx="4" fill="url(#medicineGradient)"/>
          <defs>
            <linearGradient id="medicineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'SAVE 23%'
    },
    {
      name: 'Doctor Consult',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="url(#doctorGradient)" stroke="url(#doctorGradient)" strokeWidth="2"/>
          <path d="M16 20h16M16 24h12M16 28h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="12" r="3" fill="white"/>
          <defs>
            <linearGradient id="doctorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4"/>
              <stop offset="100%" stopColor="#3B82F6"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'EXPERT CARE'
    },
    {
      name: 'Healthcare',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L30 10H38V18L44 24L38 30V38H30L24 44L18 38H10V30L4 24L10 18V10H18L24 4Z" fill="url(#healthcareGradient)"/>
          <path d="M20 20H28V28H20V20Z" fill="white"/>
          <defs>
            <linearGradient id="healthcareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#06B6D4"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'UPTO 60% OFF'
    },
    {
      name: 'Wellness',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C12 4 4 12 4 24s8 20 20 20 20-8 20-20S36 4 24 4z" fill="url(#wellnessGradient)"/>
          <path d="M16 20l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'HEALTHY LIVING'
    },
    {
      name: 'Diet Plan',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L28 8H40V20L44 24L40 28V40H28L24 44L20 40H8V28L4 24L8 20V8H20L24 4Z" fill="url(#dietGradient)"/>
          <path d="M18 18h12v12H18z" fill="white"/>
          <path d="M22 14h4v4h-4zM22 30h4v4h-4zM14 22h4v4h-4zM30 22h4v4h-4z" fill="white"/>
          <defs>
            <linearGradient id="dietGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#10B981"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'PERSONALIZED'
    }
  ];

  const diseases = [
    {
      name: 'Cardiovascular',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L24 10H30V16L34 20L30 24V30H24L20 34L16 30H10V24L6 20L10 16V10H16L20 6Z" fill="url(#heartGradient)"/>
          <path d="M16 16h8v8h-8z" fill="white"/>
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444"/>
              <stop offset="100%" stopColor="#DC2626"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'HEART HEALTH',
      categoryIds: ['fbefc7d5-0c94-4d02-8015-3dd555721040'], // Medical Equipment
      keywords: ['blood pressure', 'bp monitor', 'heart', 'cardiovascular']
    },
    {
      name: 'Diabetes',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="url(#diabetesGradient)"/>
          <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="3" fill="white"/>
          <defs>
            <linearGradient id="diabetesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'BLOOD SUGAR',
      categoryIds: ['33e6d1c2-473e-46c7-bbd5-95b7e5897dad', 'fbefc7d5-0c94-4d02-8015-3dd555721040'], // Essential Medicines + Medical Equipment
      keywords: ['diabetes', 'glucose', 'metformin', 'blood sugar', 'insulin']
    },
    {
      name: 'Respiratory',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4C12 4 4 12 4 20s8 16 16 16 16-8 16-16S28 4 20 4z" fill="url(#respiratoryGradient)"/>
          <path d="M12 16h16M12 20h12M12 24h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="28" cy="16" r="2" fill="white"/>
          <defs>
            <linearGradient id="respiratoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4"/>
              <stop offset="100%" stopColor="#0891B2"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      offer: 'LUNG CARE',
      categoryIds: ['fbefc7d5-0c94-4d02-8015-3dd555721040'], // Medical Equipment
      keywords: ['nebulizer', 'respiratory', 'asthma', 'bronchitis', 'copd', 'pulse oximeter']
    }
  ];

  // Function to handle disease button clicks
  const handleDiseaseClick = (disease) => {
    // Navigate to products page with disease filter
    const params = new URLSearchParams();
    params.set('disease', disease.name.toLowerCase());
    
    // Add category IDs if available
    if (disease.categoryIds && disease.categoryIds.length > 0) {
      params.set('categoryIds', disease.categoryIds.join(','));
    }
    
    // Add keywords if available
    if (disease.keywords && disease.keywords.length > 0) {
      params.set('keywords', disease.keywords.join(','));
    }
    
    navigate(`/products?${params.toString()}`);
  };





  return (
    <section className="categories-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">What do you need today?</h2>
          <p className="section-subtitle">Choose from our comprehensive healthcare services</p>
        </div>

        {/* Category Shortcuts */}
        <div className="category-shortcuts">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-item"
              onClick={() => {
                if (category.name === 'Medicine') {
                  navigate('/products?category=medicines');
                } else if (category.name === 'Healthcare') {
                  navigate('/products?category=healthcare');
                } else {
                  // inactive: do nothing for Doctor Consult, Wellness, Diet Plan
                }
              }}
              style={{ cursor: ['Doctor Consult','Wellness','Diet Plan'].includes(category.name) ? 'default' : 'pointer' }}
            >
              <div className="category-icon">
                {category.icon}
              </div>
              <div className="category-name">{category.name}</div>
              {category.offer && <div className="category-offer">{category.offer}</div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Diseases Section */}
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Health Conditions</h2>
          <p className="section-subtitle">Manage health conditions with trusted care</p>
        </div>
        <div className="diseases-grid">
          {diseases.map((disease, index) => (
            <div 
              key={index} 
              className="disease-card"
              onClick={() => handleDiseaseClick(disease)}
              style={{ cursor: 'pointer' }}
            >
              <div className="disease-icon">{disease.icon}</div>
              <div className="disease-content">
                <div className="disease-name">{disease.name}</div>
                <div className="disease-offer">{disease.offer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
