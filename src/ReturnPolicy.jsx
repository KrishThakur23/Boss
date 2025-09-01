import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './ReturnPolicy.css';

const ReturnPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

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

    const sections = document.querySelectorAll('.return-section[id]');
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

  const returnEligibility = [
    {
      icon: '📦',
      title: 'Damaged or Wrong Item',
      description: 'Eligible for return or replacement if reported within 48 hours of delivery',
      details: ['Unboxing photos required', 'Original packaging needed', 'Full refund or replacement'],
      status: 'eligible'
    },
    {
      icon: '⏱️',
      title: 'Short Expiry Products',
      description: 'Products received with near/expired shelf life are eligible for full refund',
      details: ['Less than 6 months expiry', 'Immediate replacement', 'No questions asked'],
      status: 'eligible'
    },
    {
      icon: '💊',
      title: 'Prescription Medicines',
      description: 'Returns restricted unless item is damaged, defective, or incorrect',
      details: ['Safety regulations apply', 'Pharmacist verification', 'Case-by-case review'],
      status: 'restricted'
    },
    {
      icon: '🧪',
      title: 'Diagnostics/Lab Tests',
      description: 'Free cancellation if sample not collected',
      details: ['Pre-collection cancellation', 'Lab policy dependent', 'Partial refunds possible'],
      status: 'conditional'
    }
  ];

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Go to your Orders section and select the item you want to return',
      icon: '📱',
      details: 'Available 24/7 through your account dashboard'
    },
    {
      step: 2,
      title: 'Upload Evidence',
      description: 'Provide photos of the product, packaging, and invoice',
      icon: '📸',
      details: 'Clear images help us process your request faster'
    },
    {
      step: 3,
      title: 'Verification',
      description: 'Our team reviews your request within 2-4 hours',
      icon: '🔍',
      details: 'Pharmacist and quality team verification'
    },
    {
      step: 4,
      title: 'Resolution',
      description: 'Pickup arranged or instant refund processed',
      icon: '✅',
      details: 'Refund or replacement as per your preference'
    }
  ];

  const refundTimelines = [
    { method: 'UPI/Digital Wallets', time: '1-2 hours', icon: '📱' },
    { method: 'Credit/Debit Cards', time: '3-5 business days', icon: '💳' },
    { method: 'Net Banking', time: '2-4 business days', icon: '🏦' },
    { method: 'Cash on Delivery', time: '5-7 business days', icon: '💰' }
  ];

  const faqs = [
    {
      question: 'Can I return medicines after opening the package?',
      answer: 'Due to safety regulations, opened medicines cannot be returned unless they are damaged or incorrect. This policy ensures the safety and integrity of medicines for all customers.'
    },
    {
      question: 'What if I receive a damaged product?',
      answer: 'If you receive a damaged product, please report it within 48 hours of delivery with unboxing photos. We will arrange for immediate replacement or full refund.'
    },
    {
      question: 'How long does the refund process take?',
      answer: 'Refund processing time varies by payment method. UPI and digital wallets are fastest (1-2 hours), while bank transfers may take 3-7 business days.'
    },
    {
      question: 'Can I exchange a product instead of returning it?',
      answer: 'Yes, for eligible items, you can choose exchange instead of refund. The replacement product will be delivered within 24-48 hours of pickup.'
    }
  ];

  const tableOfContents = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'eligibility', title: 'Return Eligibility', icon: '✅' },
    { id: 'non-returnable', title: 'Non-Returnable Items', icon: '❌' },
    { id: 'process', title: 'Return Process', icon: '🔄' },
    { id: 'timelines', title: 'Refund Timelines', icon: '⏰' },
    { id: 'faqs', title: 'FAQs', icon: '❓' }
  ];

  return (
    <div className="return-policy-page">
      <Header />
      <main className="return-main">
        {/* Hero Section */}
        <section className="return-hero">
          <div className="hero-background">
            <div className="hero-pattern"></div>
          </div>
          <div className="hero-content">
            <div className="hero-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18l-2 13H5L3 6z"></path>
                <path d="M3 6L2.25 3H1"></path>
                <path d="M16 10a4 4 0 01-8 0"></path>
              </svg>
            </div>
            <h1>Return & Refund Policy</h1>
            <p>Your satisfaction is our priority. Learn about our return and refund process for medicines and healthcare products.</p>
            <div className="hero-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">⚡</span>
                <span>48-hour return window</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">💯</span>
                <span>100% refund guarantee</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🚚</span>
                <span>Free pickup service</span>
              </div>
            </div>
          </div>
        </section>

        <div className="return-container">
          {/* Table of Contents Sidebar */}
          <aside className="return-sidebar">
            <div className="sidebar-sticky">
              <h3>Quick Navigation</h3>
              <nav className="return-nav">
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
          <div className="return-content">
            {/* Overview Section */}
            <section id="overview" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">📋</span>
                  Overview
                </h2>
              </div>
              <div className="overview-card">
                <p>
                  Your health and safety are our top priorities. Due to regulatory and safety norms,
                  returns for medicines and certain healthcare products are restricted. However, we
                  ensure a fair and hassle-free experience in all eligible scenarios.
                </p>
                <div className="policy-highlights">
                  <div className="policy-highlight">
                    <div className="highlight-icon">🛡️</div>
                    <div>
                      <h4>Safety First</h4>
                      <p>All return policies comply with pharmaceutical safety regulations</p>
                    </div>
                  </div>
                  <div className="policy-highlight">
                    <div className="highlight-icon">⚖️</div>
                    <div>
                      <h4>Fair Process</h4>
                      <p>Transparent and customer-friendly return procedures</p>
                    </div>
                  </div>
                  <div className="policy-highlight">
                    <div className="highlight-icon">🤝</div>
                    <div>
                      <h4>Customer Support</h4>
                      <p>Dedicated team to help with all return-related queries</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Return Eligibility Section */}
            <section id="eligibility" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">✅</span>
                  Return Eligibility
                </h2>
                <p>Understanding what can and cannot be returned</p>
              </div>
              <div className="eligibility-grid">
                {returnEligibility.map((item, index) => (
                  <div key={index} className={`eligibility-card ${item.status}`}>
                    <div className="card-header">
                      <div className="card-icon">{item.icon}</div>
                      <div className="card-status">
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'eligible' ? 'Eligible' : 
                           item.status === 'restricted' ? 'Restricted' : 'Conditional'}
                        </span>
                      </div>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="card-details">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Non-Returnable Items Section */}
            <section id="non-returnable" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">❌</span>
                  Non-Returnable Items
                </h2>
                <p>Items that cannot be returned due to safety and regulatory requirements</p>
              </div>
              <div className="non-returnable-card">
                <div className="warning-banner">
                  <div className="warning-icon">⚠️</div>
                  <div>
                    <h4>Important Safety Notice</h4>
                    <p>These restrictions are in place to ensure the safety and integrity of medicines for all customers.</p>
                  </div>
                </div>
                <div className="non-returnable-list">
                  <div className="non-returnable-item">
                    <div className="item-icon">🌡️</div>
                    <div>
                      <h4>Temperature-Controlled Medicines</h4>
                      <p>Vaccines, insulin, and other cold-chain products that require specific storage conditions.</p>
                    </div>
                  </div>
                  <div className="non-returnable-item">
                    <div className="item-icon">🔓</div>
                    <div>
                      <h4>Opened Products</h4>
                      <p>Any medicine or healthcare product with broken safety seals or opened packaging.</p>
                    </div>
                  </div>
                  <div className="non-returnable-item">
                    <div className="item-icon">🩺</div>
                    <div>
                      <h4>Personal Care Items</h4>
                      <p>Thermometers, nebulizers, body supports, and other personal medical devices once opened.</p>
                    </div>
                  </div>
                  <div className="non-returnable-item">
                    <div className="item-icon">📄</div>
                    <div>
                      <h4>Items Without Documentation</h4>
                      <p>Products without original packaging, invoices, or batch details cannot be processed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Return Process Section */}
            <section id="process" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">🔄</span>
                  Return Process
                </h2>
                <p>Simple steps to initiate and complete your return</p>
              </div>
              <div className="process-timeline">
                {returnProcess.map((step, index) => (
                  <div key={index} className="process-step">
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                      <div className="step-header">
                        <div className="step-icon">{step.icon}</div>
                        <h3>{step.title}</h3>
                      </div>
                      <p>{step.description}</p>
                      <div className="step-details">{step.details}</div>
                    </div>
                    {index < returnProcess.length - 1 && <div className="step-connector"></div>}
                  </div>
                ))}
              </div>
            </section>

            {/* Refund Timelines Section */}
            <section id="timelines" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">⏰</span>
                  Refund Timelines
                </h2>
                <p>Expected refund processing times by payment method</p>
              </div>
              <div className="timelines-grid">
                {refundTimelines.map((timeline, index) => (
                  <div key={index} className="timeline-card">
                    <div className="timeline-icon">{timeline.icon}</div>
                    <h3>{timeline.method}</h3>
                    <div className="timeline-duration">{timeline.time}</div>
                  </div>
                ))}
              </div>
              <div className="timeline-note">
                <div className="note-icon">💡</div>
                <div>
                  <h4>Processing Note</h4>
                  <p>Refunds are initiated within 24-48 hours of approval. Actual credit time depends on your bank or payment provider.</p>
                </div>
              </div>
            </section>

            {/* FAQs Section */}
            <section id="faqs" className="return-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">❓</span>
                  Frequently Asked Questions
                </h2>
                <p>Common questions about returns and refunds</p>
              </div>
              <div className="faqs-container">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <button
                      className={`faq-question ${expandedFaq === index ? 'expanded' : ''}`}
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className="faq-icon"
                      >
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </button>
                    <div className={`faq-answer ${expandedFaq === index ? 'expanded' : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Help Section */}
            <div className="return-help">
              <div className="help-card">
                <h3>Need Help with Returns?</h3>
                <p>Our customer support team is available 24/7 to assist you with any return or refund queries.</p>
                <div className="help-actions">
                  <a href="/help-center" className="help-button primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                    </svg>
                    Chat Support
                  </a>
                  <a href="tel:+911234567890" className="help-button secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call Us
                  </a>
                  <a href="mailto:returns@flickxir.com" className="help-button secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;


