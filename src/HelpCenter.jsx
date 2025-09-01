import React, { useState, useEffect } from 'react';
import Header from './Header';
import './HelpCenter.css';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [popularFAQs, setPopularFAQs] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set popular FAQs (simulate analytics data)
    setPopularFAQs([
      { categoryId: 'general', questionIndex: 0 },
      { categoryId: 'orders', questionIndex: 0 },
      { categoryId: 'prescriptions', questionIndex: 0 },
      { categoryId: 'payments', questionIndex: 0 }
    ]);
  }, []);

  const categories = [
    { id: 'general', name: 'General Questions', icon: '❓' },
    { id: 'orders', name: 'Orders & Delivery', icon: '📦' },
    { id: 'prescriptions', name: 'Prescriptions', icon: '💊' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'payments', name: 'Payments & Billing', icon: '💳' },
    { id: 'returns', name: 'Returns & Refunds', icon: '↩️' },
    { id: 'technical', name: 'Technical Issues', icon: '🔧' },
    { id: 'privacy', name: 'Privacy & Security', icon: '🔒' }
  ];

  const faqData = {
    general: [
      {
        question: "What is FlickXir and how does it work?",
        answer: "FlickXir is an online pharmacy platform that allows you to order medicines and healthcare products from the comfort of your home. Simply browse our catalog, add items to your cart, upload prescriptions if needed, and we'll deliver them to your doorstep."
      },
      {
        question: "Is FlickXir a licensed pharmacy?",
        answer: "Yes, FlickXir operates under proper pharmaceutical licenses and complies with all regulatory requirements. We work only with licensed pharmacies and certified healthcare providers to ensure the authenticity and quality of all medicines."
      },
      {
        question: "What areas do you deliver to?",
        answer: "We currently deliver to over 50+ cities across India. You can check if we deliver to your area by entering your pincode during checkout. We're constantly expanding our delivery network to serve more locations."
      },
      {
        question: "Are the medicines genuine?",
        answer: "Absolutely. All medicines on FlickXir are sourced directly from licensed manufacturers and authorized distributors. We maintain strict quality control measures and proper storage conditions to ensure medicine authenticity and efficacy."
      }
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer: "To place an order: 1) Browse our medicine catalog or search for specific items, 2) Add medicines to your cart, 3) Upload prescription if required, 4) Proceed to checkout and enter delivery details, 5) Choose payment method and complete your order."
      },
      {
        question: "How long does delivery take?",
        answer: "Standard delivery takes 24-48 hours within city limits and 2-5 business days for other areas. We also offer express delivery (same-day or next-day) in select cities for urgent requirements."
      },
      {
        question: "Can I track my order?",
        answer: "Yes, you can track your order in real-time through your account dashboard or the tracking link sent via SMS/email. You'll receive updates at every stage from order confirmation to delivery."
      },
      {
        question: "What if I need to cancel or modify my order?",
        answer: "You can cancel or modify your order within 30 minutes of placing it, provided it hasn't been processed by our pharmacy. Contact our support team immediately for assistance with order changes."
      }
    ],
    prescriptions: [
      {
        question: "Do I need a prescription for all medicines?",
        answer: "Prescription medicines require a valid prescription from a registered medical practitioner. Over-the-counter (OTC) medicines, health supplements, and wellness products can be purchased without a prescription."
      },
      {
        question: "How do I upload my prescription?",
        answer: "You can upload prescriptions during checkout by taking a clear photo or scanning the document. Ensure all details are visible including doctor's name, patient name, medicine names, and dosage instructions."
      },
      {
        question: "What prescription formats do you accept?",
        answer: "We accept prescriptions in various formats: physical prescriptions (photographed), digital prescriptions, e-prescriptions from healthcare providers, and hospital discharge summaries with medicine recommendations."
      },
      {
        question: "How long is a prescription valid?",
        answer: "Prescription validity varies by medicine type and doctor's instructions. Generally, acute medicine prescriptions are valid for 6 months, while chronic medication prescriptions may be valid for up to 1 year. We'll verify validity during order processing."
      }
    ],
    account: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' on our homepage, enter your mobile number and email, verify with OTP, and complete your profile with basic information. You can also sign up during your first order checkout."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "Click 'Forgot Password' on the login page, enter your registered email or mobile number, and follow the reset instructions sent to you. You can then create a new password for your account."
      },
      {
        question: "How do I update my profile information?",
        answer: "Log into your account, go to 'Profile Settings', and update your personal information, contact details, or delivery addresses. Remember to save changes after updating."
      },
      {
        question: "Can I have multiple delivery addresses?",
        answer: "Yes, you can save multiple delivery addresses in your account for convenience. During checkout, you can select from saved addresses or add a new one for that specific order."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including credit/debit cards, net banking, UPI, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery (where available)."
      },
      {
        question: "Is it safe to pay online?",
        answer: "Yes, all online payments are processed through secure, encrypted gateways that comply with industry security standards. We don't store your payment information on our servers."
      },
      {
        question: "Can I pay cash on delivery?",
        answer: "Cash on delivery is available in select cities and for orders below ₹2000. This option will be shown during checkout if available for your location and order value."
      },
      {
        question: "What if my payment fails?",
        answer: "If payment fails, you can retry with the same or different payment method. If the issue persists, contact your bank or try an alternative payment method. Our support team can also assist with payment issues."
      }
    ],
    returns: [
      {
        question: "What is your return policy?",
        answer: "We accept returns for unopened, unused medicines within 7 days of delivery if there's a quality issue or wrong item delivered. Prescription medicines cannot be returned unless there's a dispensing error from our side."
      },
      {
        question: "How do I initiate a return?",
        answer: "Contact our support team within 7 days of delivery with your order details and reason for return. We'll guide you through the return process and arrange pickup if the return is approved."
      },
      {
        question: "When will I get my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive and verify the returned items. The amount will be credited to your original payment method or FlickXir wallet as per your preference."
      },
      {
        question: "Can I exchange a medicine?",
        answer: "Direct exchanges are not available due to regulatory requirements. However, you can return the item (if eligible) and place a new order for the correct medicine."
      }
    ],
    technical: [
      {
        question: "The website/app is not working properly. What should I do?",
        answer: "Try refreshing the page, clearing your browser cache, or updating your app to the latest version. If the issue persists, contact our technical support team with details about the problem you're experiencing."
      },
      {
        question: "I'm having trouble uploading my prescription.",
        answer: "Ensure your prescription image is clear, well-lit, and under 5MB in size. Supported formats are JPG, PNG, and PDF. Try using a different browser or device if the upload continues to fail."
      },
      {
        question: "Why can't I find a specific medicine?",
        answer: "The medicine might be out of stock, discontinued, or not available in your area. Try searching with different spellings or generic names. Contact our support team for assistance in finding alternatives."
      },
      {
        question: "The search function isn't working correctly.",
        answer: "Try using different keywords, check spelling, or browse by categories. Our search function works with medicine names, brands, and generic names. Clear your browser cache if search results seem outdated."
      }
    ],
    privacy: [
      {
        question: "How do you protect my personal information?",
        answer: "We use industry-standard encryption and security measures to protect your data. Your personal and medical information is stored securely and accessed only by authorized personnel for order processing and customer service."
      },
      {
        question: "Do you share my information with third parties?",
        answer: "We only share necessary information with our pharmacy partners, delivery services, and payment processors to fulfill your orders. We never sell your personal information to third parties for marketing purposes."
      },
      {
        question: "Can I delete my account and data?",
        answer: "Yes, you can request account deletion by contacting our support team. We'll delete your personal information while retaining transaction records as required by law for regulatory compliance."
      },
      {
        question: "How do you handle my prescription data?",
        answer: "Prescription data is handled with utmost care and stored securely in compliance with healthcare regulations. Only licensed pharmacists and authorized medical professionals can access this information for dispensing purposes."
      }
    ]
  };

  const filteredFAQs = faqData[activeCategory]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
      setShowContactForm(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }, 2000);
  };

  const getPopularFAQs = () => {
    return popularFAQs.map(item => ({
      ...faqData[item.categoryId][item.questionIndex],
      category: categories.find(cat => cat.id === item.categoryId)?.name,
      categoryId: item.categoryId
    }));
  };

  return (
    <div className="help-center">
      <Header />
      <main className="help-center-main">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-banner">
            <div className="container">
              <div className="success-content">
                <span className="success-icon">✅</span>
                <div>
                  <h3>Message Sent Successfully!</h3>
                  <p>Thank you for contacting us. Our support team will get back to you within 24 hours.</p>
                </div>
                <button 
                  className="close-success"
                  onClick={() => setShowSuccessMessage(false)}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="help-hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-icon">🆘</div>
              <h1>How can we help you?</h1>
              <p>Find answers to your questions, get support, and learn more about FlickXir services</p>
              
              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  className="help-search"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn">
                  🔍
                </button>
              </div>

              {/* Quick Stats */}
              <div className="help-stats">
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Help Articles</span>
                </div>
                <div className="stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support Available</span>
                </div>
                <div className="stat">
                  <span className="stat-number">&lt; 2hrs</span>
                  <span className="stat-label">Average Response</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular FAQs Section */}
        <section className="popular-faqs-section">
          <div className="container">
            <div className="section-header">
              <h2>🔥 Most Popular Questions</h2>
              <p>Quick answers to the questions we get asked most often</p>
            </div>
            <div className="popular-faqs-grid">
              {getPopularFAQs().map((faq, index) => (
                <div key={index} className="popular-faq-card">
                  <div className="faq-category-badge">{faq.category}</div>
                  <h4>{faq.question}</h4>
                  <p>{faq.answer.substring(0, 120)}...</p>
                  <button 
                    className="read-more-btn"
                    onClick={() => {
                      setActiveCategory(faq.categoryId);
                      document.getElementById('main-faqs').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="quick-help-section">
          <div className="container">
            <div className="section-header">
              <h2>⚡ Quick Help</h2>
              <p>Get instant help with common tasks</p>
            </div>
            <div className="quick-help-grid">
              <div className="quick-help-card">
                <div className="help-card-icon">📋</div>
                <h3>Track Your Order</h3>
                <p>Check the status of your medicine delivery in real-time</p>
                <button className="help-action-btn">Track Order</button>
              </div>
              <div className="quick-help-card">
                <div className="help-card-icon">📄</div>
                <h3>Upload Prescription</h3>
                <p>Easily upload your prescription for medicine orders</p>
                <button className="help-action-btn">Upload Now</button>
              </div>
              <div className="quick-help-card">
                <div className="help-card-icon">💰</div>
                <h3>Check Refund Status</h3>
                <p>View the status of your refund requests</p>
                <button className="help-action-btn">Check Status</button>
              </div>
              <div className="quick-help-card">
                <div className="help-card-icon">🏥</div>
                <h3>Find Nearby Pharmacy</h3>
                <p>Locate partner pharmacies in your area</p>
                <button className="help-action-btn">Find Pharmacy</button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="help-content-section" id="main-faqs">
          <div className="container">
            <div className="help-layout">
              
              {/* Sidebar */}
              <aside className="help-sidebar">
                <h3>📚 Browse by Category</h3>
                <div className="category-list">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h4>Quick Actions</h4>
                  <button 
                    className="action-btn"
                    onClick={() => setShowContactForm(true)}
                  >
                    💬 Contact Support
                  </button>
                  <button className="action-btn">
                    📞 Request Callback
                  </button>
                  <button className="action-btn">
                    📧 Email Us
                  </button>
                </div>
              </aside>

              {/* Main Content */}
              <div className="help-main-content">
                <div className="content-header">
                  <h2>
                    {categories.find(cat => cat.id === activeCategory)?.icon} {' '}
                    {categories.find(cat => cat.id === activeCategory)?.name}
                  </h2>
                  <p>Find answers to common questions in this category</p>
                </div>

                {/* FAQ List */}
                <div className="faq-list">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <div key={index} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleFAQ(index)}
                        >
                          <span>{faq.question}</span>
                          <span className={`faq-toggle ${expandedFAQ === index ? 'expanded' : ''}`}>
                            {expandedFAQ === index ? '−' : '+'}
                          </span>
                        </button>
                        {expandedFAQ === index && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <div className="no-results-icon">🔍</div>
                      <h3>No results found</h3>
                      <p>Try adjusting your search terms or browse different categories</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="help-contact-section">
          <div className="container">
            <div className="contact-header">
              <h2>Still need help?</h2>
              <p>Our support team is here to assist you 24/7</p>
            </div>

            <div className="contact-options">
              <div className="contact-option">
                <div className="contact-icon">💬</div>
                <div className="contact-info">
                  <h4>Live Chat</h4>
                  <p>Chat with our support team in real-time</p>
                  <button className="contact-btn">Start Chat</button>
                </div>
              </div>

              <div className="contact-option">
                <div className="contact-icon">📞</div>
                <div className="contact-info">
                  <h4>Phone Support</h4>
                  <p>Call us at +91-XXXX-XXXXXX</p>
                  <button className="contact-btn">Call Now</button>
                </div>
              </div>

              <div className="contact-option">
                <div className="contact-icon">📧</div>
                <div className="contact-info">
                  <h4>Email Support</h4>
                  <p>Send us an email at support@flickxir.com</p>
                  <button 
                    className="contact-btn"
                    onClick={() => setShowContactForm(true)}
                  >
                    Send Email
                  </button>
                </div>
              </div>

              <div className="contact-option">
                <div className="contact-icon">📱</div>
                <div className="contact-info">
                  <h4>WhatsApp</h4>
                  <p>Message us on WhatsApp for quick support</p>
                  <button className="contact-btn">WhatsApp Us</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="modal-overlay">
            <div className="contact-form-modal">
              <div className="modal-header">
                <h3>Contact Support</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowContactForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => handleContactFormChange('category', e.target.value)}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => handleContactFormChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleContactFormChange('message', e.target.value)}
                    placeholder="Please provide detailed information about your question or issue..."
                    rows="5"
                    maxLength="500"
                    required
                  />
                  <div className="char-count">
                    {contactForm.message.length}/500 characters
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setShowContactForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Help Button */}
        <button 
          className="floating-help-btn"
          onClick={() => setShowContactForm(true)}
          title="Need help? Contact us!"
        >
          💬
        </button>
      </main>
    </div>
  );
};

export default HelpCenter;