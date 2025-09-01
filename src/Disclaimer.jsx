import React, { useEffect } from 'react';
import Header from './Header';
import './Disclaimer.css';

const Disclaimer = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="disclaimer-page">
      <Header />
      <main className="disclaimer-main">
        {/* Hero Section */}
        <section className="disclaimer-hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-icon">⚠️</div>
              <h1>Important Disclaimer</h1>
              <p>Please read this disclaimer carefully before using FlickXir services</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="disclaimer-content">
          <div className="container">
            <div className="content-grid">
              
              {/* Educational Purpose */}
              <div className="disclaimer-card">
                <div className="card-icon">📚</div>
                <h2>Educational Purpose Only</h2>
                <div className="card-content">
                  <p>This website is created for <strong>educational and demonstration purposes only</strong>. FlickXir is a portfolio project showcasing modern web development technologies and e-commerce functionality.</p>
                  <ul>
                    <li>This is not a real pharmacy or medical service</li>
                    <li>No actual medicines are sold through this platform</li>
                    <li>All product listings are for demonstration purposes</li>
                    <li>No real transactions or payments are processed</li>
                  </ul>
                </div>
              </div>

              {/* Medical Advice */}
              <div className="disclaimer-card">
                <div className="card-icon">👨‍⚕️</div>
                <h2>Medical Advice Disclaimer</h2>
                <div className="card-content">
                  <p>The information provided on this website is <strong>not intended as medical advice</strong> and should not be used as a substitute for professional medical consultation.</p>
                  <ul>
                    <li>Always consult a qualified healthcare professional for medical advice</li>
                    <li>Never disregard professional medical advice based on information from this site</li>
                    <li>Seek immediate medical attention for any medical emergencies</li>
                    <li>This platform does not provide medical diagnoses or treatment recommendations</li>
                  </ul>
                </div>
              </div>

              {/* Product Information */}
              <div className="disclaimer-card">
                <div className="card-icon">💊</div>
                <h2>Product Information</h2>
                <div className="card-content">
                  <p>All medicine names, images, descriptions, and pricing displayed on this website are <strong>for representational purposes only</strong>.</p>
                  <ul>
                    <li>Product information may not reflect actual medicine specifications</li>
                    <li>Images are used for demonstration and may not represent actual products</li>
                    <li>Pricing is fictional and for display purposes only</li>
                    <li>Availability information is simulated for demonstration</li>
                  </ul>
                </div>
              </div>

              {/* Legal Compliance */}
              <div className="disclaimer-card">
                <div className="card-icon">⚖️</div>
                <h2>Legal Compliance</h2>
                <div className="card-content">
                  <p>This project acknowledges and respects all applicable laws and regulations regarding <strong>pharmaceutical services and online medicine sales</strong>.</p>
                  <ul>
                    <li>No actual pharmaceutical licenses are held or claimed</li>
                    <li>This platform does not engage in real pharmaceutical commerce</li>
                    <li>All regulatory requirements for actual pharmacy operations are acknowledged</li>
                    <li>This is purely a technical demonstration project</li>
                  </ul>
                </div>
              </div>

              {/* Data and Privacy */}
              <div className="disclaimer-card">
                <div className="card-icon">🔒</div>
                <h2>Data and Privacy</h2>
                <div className="card-content">
                  <p>While this is a demonstration project, we take <strong>data privacy seriously</strong> and follow best practices for user information handling.</p>
                  <ul>
                    <li>Any data entered is for demonstration purposes only</li>
                    <li>No real personal or medical information should be submitted</li>
                    <li>Use test data when exploring the platform features</li>
                    <li>Data handling follows standard security practices</li>
                  </ul>
                </div>
              </div>

              {/* Technology Demonstration */}
              <div className="disclaimer-card">
                <div className="card-icon">💻</div>
                <h2>Technology Demonstration</h2>
                <div className="card-content">
                  <p>This project demonstrates various <strong>modern web technologies</strong> and development practices in the context of a healthcare e-commerce platform.</p>
                  <ul>
                    <li>React.js for frontend development</li>
                    <li>Supabase for backend services and database</li>
                    <li>Modern UI/UX design principles</li>
                    <li>Responsive web design and accessibility features</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Important Notice */}
            <div className="important-notice">
              <div className="notice-icon">🚨</div>
              <div className="notice-content">
                <h3>Important Notice</h3>
                <p>If you are looking for actual medical services or need to purchase medicines, please consult with licensed healthcare providers and use authorized pharmacy services in your area. This website cannot and should not be used for any real medical or pharmaceutical needs.</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="disclaimer-footer">
              <h3>Questions About This Disclaimer?</h3>
              <p>If you have any questions about this disclaimer or the educational nature of this project, please feel free to contact us through our <a href="/help-center">Help Center</a>.</p>
              <p className="last-updated">Last updated: December 2024</p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default Disclaimer;


