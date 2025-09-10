import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const navigate = useNavigate();


  const categories = [
    {
      name: 'Medicine',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 8H15V4C15 2.9 14.1 2 13 2H11C9.9 2 9 2.9 9 4V8H5C3.9 8 3 8.9 3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V10C21 8.9 20.1 8 19 8ZM11 4H13V8H11V4ZM19 20H5V10H19V20Z" fill="currentColor"/>
          <path d="M12 12H10V14H8V16H10V18H12V16H14V14H12V12Z" fill="currentColor"/>
        </svg>
      ),
      offer: 'SAVE 23%'
    },
    {
      name: 'Doctor Consult',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11V22H11V11C9.9 11 9 10.1 9 9V7.5L3 7V9C3 10.1 3.9 11 5 11V22H7V11C8.1 11 9 10.1 9 9V7.5L15 7.5V9C15 10.1 15.9 11 17 11V22H19V11C20.1 11 21 10.1 21 9Z" fill="currentColor"/>
        </svg>
      ),
      offer: ''
    },
    {
      name: 'Healthcare',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
          <path d="M19 15H17V13H15V15H13V17H15V19H17V17H19V15Z" fill="currentColor"/>
          <path d="M5 15H7V17H9V15H11V13H9V11H7V13H5V15Z" fill="currentColor"/>
        </svg>
      ),
      offer: 'UPTO 60% OFF'
    },
    {
      name: 'Offers',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
          <path d="M7 7H17V9H7V7Z" fill="currentColor"/>
          <path d="M7 11H17V13H7V11Z" fill="currentColor"/>
          <path d="M7 15H13V17H7V15Z" fill="currentColor"/>
        </svg>
      ),
      offer: ''
    },
    {
      name: 'Value Store',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="currentColor"/>
          <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="currentColor"/>
        </svg>
      ),
      offer: 'UPTO 50% OFF'
    },
    {
      name: 'Diet Plan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
          <path d="M8 12L9.5 15.5L13 17L9.5 18.5L8 22L6.5 18.5L3 17L6.5 15.5L8 12Z" fill="currentColor"/>
          <path d="M16 12L17.5 15.5L21 17L17.5 18.5L16 22L14.5 18.5L11 17L14.5 15.5L16 12Z" fill="currentColor"/>
        </svg>
      ),
      offer: 'PERSONALIZED'
    }
  ];

  const diseases = [
    {
      name: 'Cardiovascular',
      icon: '❤️',
      offer: 'HEART HEALTH',
      categoryIds: ['fbefc7d5-0c94-4d02-8015-3dd555721040'], // Medical Equipment
      keywords: ['blood pressure', 'bp monitor', 'heart', 'cardiovascular']
    },
    {
      name: 'Diabetes',
      icon: '🩸',
      offer: 'BLOOD SUGAR',
      categoryIds: ['33e6d1c2-473e-46c7-bbd5-95b7e5897dad', 'fbefc7d5-0c94-4d02-8015-3dd555721040'], // Essential Medicines + Medical Equipment
      keywords: ['diabetes', 'glucose', 'metformin', 'blood sugar', 'insulin']
    },
    {
      name: 'Respiratory',
      icon: '🫁',
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
                }
              }}
              style={{ cursor: category.name === 'Medicine' || category.name === 'Healthcare' ? 'pointer' : 'default' }}
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
          <h2 className="section-title">Diseases</h2>
        </div>
        <div className="category-shortcuts">
          {diseases.map((disease, index) => (
            <div 
              key={index} 
              className="category-item disease-item"
              onClick={() => handleDiseaseClick(disease)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-icon">{disease.icon}</div>
              <div className="category-name">{disease.name}</div>
              <div className="category-offer">{disease.offer}</div>
            </div>
          ))}
        </div>
      </div>


    </section>
  );
};

export default CategoriesSection;
