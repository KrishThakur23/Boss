import React, { useEffect, useState } from 'react';
import Header from './Header';
import './Terms.css';

const Terms = () => {
  const [activeSection, setActiveSection] = useState('');
  const [lastUpdated] = useState('January 15, 2024');

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.terms-section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.offsetTop - headerOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const tableOfContents = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: '📋' },
    { id: 'definitions', title: 'Definitions', icon: '📖' },
    { id: 'services', title: 'Our Services', icon: '🏥' },
    { id: 'user-obligations', title: 'User Obligations', icon: '👤' },
    { id: 'prescriptions', title: 'Prescription Requirements', icon: '💊' },
    { id: 'donations', title: 'Medicine Donations', icon: '❤️' },
    { id: 'privacy', title: 'Privacy & Data Protection', icon: '🔒' },
    { id: 'payments', title: 'Payments & Refunds', icon: '💳' },
    { id: 'liability', title: 'Liability & Disclaimers', icon: '⚖️' },
    { id: 'termination', title: 'Account Termination', icon: '🚪' },
    { id: 'governing-law', title: 'Governing Law', icon: '🏛️' },
    { id: 'contact', title: 'Contact Information', icon: '📞' }
  ];

  return (
    <div className="terms-page">
      <Header />
      <main className="terms-main">
        {/* Hero Section */}
        <section className="terms-hero">
          <div className="hero-background">
            <div className="hero-pattern"></div>
          </div>
          <div className="hero-content">
            <div className="hero-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <h1>Terms & Conditions</h1>
            <p>Please read these terms carefully before using FlickXir India</p>
            <div className="last-updated">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              Last updated: {lastUpdated}
            </div>
          </div>
        </section>

        <div className="terms-container">
          {/* Table of Contents Sidebar */}
          <aside className="terms-sidebar">
            <div className="sidebar-sticky">
              <h3>Table of Contents</h3>
              <nav className="terms-nav">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-title">{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="terms-content">
            {/* Introduction */}
            <div className="terms-intro">
              <div className="intro-card">
                <h2>Welcome to FlickXir India</h2>
                <p>
                  These Terms and Conditions ("Terms") govern your use of the FlickXir India platform, 
                  including our website, mobile applications, and related services. By accessing or using 
                  our platform, you agree to be bound by these Terms.
                </p>
                <div className="important-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <strong>Important:</strong> If you do not agree to these Terms, please do not use our services.
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Sections */}
            <section id="acceptance" className="terms-section">
              <h2>
                <span className="section-icon">📋</span>
                1. Acceptance of Terms
              </h2>
              <div className="section-content">
                <p>
                  By creating an account, accessing, or using FlickXir India's services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
                <div className="highlight-box">
                  <h4>Key Points:</h4>
                  <ul>
                    <li>You must be at least 18 years old to use our services</li>
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You agree to provide accurate and complete information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="definitions" className="terms-section">
              <h2>
                <span className="section-icon">📖</span>
                2. Definitions
              </h2>
              <div className="section-content">
                <div className="definitions-grid">
                  <div className="definition-item">
                    <h4>"Platform"</h4>
                    <p>Refers to FlickXir India's website, mobile applications, and all related services.</p>
                  </div>
                  <div className="definition-item">
                    <h4>"User" or "You"</h4>
                    <p>Any individual who accesses or uses our Platform.</p>
                  </div>
                  <div className="definition-item">
                    <h4>"Services"</h4>
                    <p>All features, functionalities, and services provided through our Platform.</p>
                  </div>
                  <div className="definition-item">
                    <h4>"Content"</h4>
                    <p>All information, data, text, images, and other materials on our Platform.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="services" className="terms-section">
              <h2>
                <span className="section-icon">🏥</span>
                3. Our Services
              </h2>
              <div className="section-content">
                <p>FlickXir India provides the following services:</p>
                <div className="services-grid">
                  <div className="service-card">
                    <div className="service-icon">💊</div>
                    <h4>Medicine Ordering</h4>
                    <p>Online ordering and delivery of prescription and over-the-counter medicines.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-icon">❤️</div>
                    <h4>Medicine Donations</h4>
                    <p>Platform for donating unused medicines to those in need.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-icon">📋</div>
                    <h4>Prescription Management</h4>
                    <p>Digital prescription upload and verification services.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-icon">🚚</div>
                    <h4>Delivery Services</h4>
                    <p>Home delivery of medicines and healthcare products.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="user-obligations" className="terms-section">
              <h2>
                <span className="section-icon">👤</span>
                4. User Obligations
              </h2>
              <div className="section-content">
                <p>As a user of our Platform, you agree to:</p>
                <div className="obligations-list">
                  <div className="obligation-item">
                    <div className="obligation-icon">✅</div>
                    <div>
                      <h4>Provide Accurate Information</h4>
                      <p>Ensure all personal and medical information provided is accurate and up-to-date.</p>
                    </div>
                  </div>
                  <div className="obligation-item">
                    <div className="obligation-icon">⚖️</div>
                    <div>
                      <h4>Comply with Laws</h4>
                      <p>Use our services in compliance with all applicable laws and regulations.</p>
                    </div>
                  </div>
                  <div className="obligation-item">
                    <div className="obligation-icon">🔒</div>
                    <div>
                      <h4>Protect Your Account</h4>
                      <p>Maintain the security and confidentiality of your account credentials.</p>
                    </div>
                  </div>
                  <div className="obligation-item">
                    <div className="obligation-icon">🚫</div>
                    <div>
                      <h4>Prohibited Activities</h4>
                      <p>Not engage in any fraudulent, abusive, or illegal activities on our Platform.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="prescriptions" className="terms-section">
              <h2>
                <span className="section-icon">💊</span>
                5. Prescription Requirements
              </h2>
              <div className="section-content">
                <div className="warning-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <div>
                    <strong>Important Medical Disclaimer:</strong> We are not a medical provider. Always consult 
                    qualified healthcare practitioners for medical advice, diagnosis, or treatment.
                  </div>
                </div>
                <h4>Prescription Medicine Requirements:</h4>
                <ul>
                  <li>Valid prescription from a licensed medical practitioner is required</li>
                  <li>Prescriptions must be clear, legible, and contain all required information</li>
                  <li>We reserve the right to verify prescriptions with the prescribing doctor</li>
                  <li>Expired or invalid prescriptions will not be accepted</li>
                </ul>
              </div>
            </section>

            <section id="donations" className="terms-section">
              <h2>
                <span className="section-icon">❤️</span>
                6. Medicine Donations
              </h2>
              <div className="section-content">
                <p>Our medicine donation program allows users to donate unused medicines to help others in need.</p>
                <h4>Donation Guidelines:</h4>
                <div className="donation-guidelines">
                  <div className="guideline-item">
                    <span className="guideline-number">1</span>
                    <div>
                      <h5>Medicine Condition</h5>
                      <p>Medicines must be unexpired and in good condition</p>
                    </div>
                  </div>
                  <div className="guideline-item">
                    <span className="guideline-number">2</span>
                    <div>
                      <h5>Original Packaging</h5>
                      <p>Medicines should be in original, unopened packaging when possible</p>
                    </div>
                  </div>
                  <div className="guideline-item">
                    <span className="guideline-number">3</span>
                    <div>
                      <h5>Quality Verification</h5>
                      <p>All donated medicines undergo quality verification before redistribution</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="privacy" className="terms-section">
              <h2>
                <span className="section-icon">🔒</span>
                7. Privacy & Data Protection
              </h2>
              <div className="section-content">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                  use, and protect your personal information.
                </p>
                <div className="privacy-highlights">
                  <div className="privacy-item">
                    <div className="privacy-icon">🛡️</div>
                    <h4>Data Security</h4>
                    <p>We implement industry-standard security measures to protect your data.</p>
                  </div>
                  <div className="privacy-item">
                    <div className="privacy-icon">🎯</div>
                    <h4>Purpose Limitation</h4>
                    <p>We only use your data for the purposes stated in our Privacy Policy.</p>
                  </div>
                  <div className="privacy-item">
                    <div className="privacy-icon">👥</div>
                    <h4>No Unauthorized Sharing</h4>
                    <p>We do not sell or share your personal information with third parties without consent.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="payments" className="terms-section">
              <h2>
                <span className="section-icon">💳</span>
                8. Payments & Refunds
              </h2>
              <div className="section-content">
                <h4>Payment Terms:</h4>
                <ul>
                  <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
                  <li>Payment must be completed before order processing</li>
                  <li>We accept various payment methods including cards, UPI, and digital wallets</li>
                </ul>
                <h4>Refund Policy:</h4>
                <div className="refund-policy">
                  <div className="refund-item">
                    <span className="refund-icon">✅</span>
                    <div>
                      <strong>Eligible for Refund:</strong> Damaged products, wrong items delivered, 
                      or cancelled orders before dispatch.
                    </div>
                  </div>
                  <div className="refund-item">
                    <span className="refund-icon">❌</span>
                    <div>
                      <strong>Not Eligible:</strong> Medicines that have been opened or used, 
                      or orders cancelled after dispatch.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="liability" className="terms-section">
              <h2>
                <span className="section-icon">⚖️</span>
                9. Liability & Disclaimers
              </h2>
              <div className="section-content">
                <div className="disclaimer-box">
                  <h4>Medical Disclaimer</h4>
                  <p>
                    FlickXir India is a technology platform that facilitates the ordering and delivery of medicines. 
                    We are not a medical practice and do not provide medical advice, diagnosis, or treatment. 
                    Always consult with qualified healthcare professionals for medical concerns.
                  </p>
                </div>
                <h4>Limitation of Liability:</h4>
                <ul>
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our liability is limited to the amount paid for the specific service or product</li>
                  <li>We are not responsible for delays caused by factors beyond our control</li>
                </ul>
              </div>
            </section>

            <section id="termination" className="terms-section">
              <h2>
                <span className="section-icon">🚪</span>
                10. Account Termination
              </h2>
              <div className="section-content">
                <p>Either party may terminate the account relationship:</p>
                <div className="termination-reasons">
                  <div className="termination-item">
                    <h4>User-Initiated Termination</h4>
                    <p>You may delete your account at any time through your account settings.</p>
                  </div>
                  <div className="termination-item">
                    <h4>Platform-Initiated Termination</h4>
                    <p>We may suspend or terminate accounts for violations of these Terms or illegal activities.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="governing-law" className="terms-section">
              <h2>
                <span className="section-icon">🏛️</span>
                11. Governing Law
              </h2>
              <div className="section-content">
                <p>
                  These Terms are governed by the laws of India. Any disputes arising from these Terms 
                  or your use of our services will be subject to the exclusive jurisdiction of the courts 
                  in New Delhi, India.
                </p>
              </div>
            </section>

            <section id="contact" className="terms-section">
              <h2>
                <span className="section-icon">📞</span>
                12. Contact Information
              </h2>
              <div className="section-content">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="contact-grid">
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    <div>
                      <h4>Email</h4>
                      <p>legal@flickxir.com</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <div>
                      <h4>Phone</h4>
                      <p>+91 1234 567 890</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div>
                      <h4>Address</h4>
                      <p>FlickXir India Pvt. Ltd.<br />Greater Noida, UP, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <div className="terms-footer">
              <div className="footer-card">
                <h3>Questions about our Terms?</h3>
                <p>Our legal team is here to help clarify any questions you may have.</p>
                <div className="footer-actions">
                  <a href="/help-center" className="footer-button primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Help Center
                  </a>
                  <a href="mailto:legal@flickxir.com" className="footer-button secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Contact Legal Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;


