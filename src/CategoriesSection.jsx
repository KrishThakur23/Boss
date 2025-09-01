import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const navigate = useNavigate();


  const categories = [
    {
      name: 'Medicine',
      image: 'https://assets.pharmeasy.in/apothecary/images/medicine_ff.webp?dim=256x0',
      offer: 'SAVE 23%'
    },
    {
      name: 'Doctor Consult',
      image: 'https://assets.pharmeasy.in/web-assets/images/icon_doc_consult_tile.webp?dim=256x0:',
      offer: ''
    },
    {
      name: 'Healthcare',
      image: 'https://assets.pharmeasy.in/apothecary/images/healthcare_ff.webp?dim=256x0',
      offer: 'UPTO 60% OFF'
    },
    {
      name: 'Offers',
      image: 'https://assets.pharmeasy.in/apothecary/images/offers_ff.webp?dim=256x0',
      offer: ''
    },
    {
      name: 'Value Store',
      image: 'https://assets.pharmeasy.in/apothecary/images/value_store.png?dim=256x0',
      offer: 'UPTO 50% OFF'
    },
    {
      name: 'Diet Plan',
      image: 'https://assets.pharmeasy.in/apothecary/images/healthcare_ff.webp?dim=256x0',
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
                <img src={category.image} alt={category.name} className="category-img" />
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
