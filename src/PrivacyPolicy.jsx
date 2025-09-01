import React, { useEffect, useState } from 'react';
import Header from './Header';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    // Handle scroll for active section highlighting and progress
    const handleScroll = () => {
      const sections = document.querySelectorAll('.policy-section');
      const scrollPosition = window.scrollY + 100;
      
      // Calculate reading progress
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / documentHeight) * 100;
      setReadingProgress(Math.min(scrolled, 100));

      // Show/hide back to top button
      setShowBackToTop(window.scrollY > 300);

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="privacy-policy">
      <Header />
      <main className="privacy-main">
        {/* Hero Section */}
        <section className="privacy-hero">
          <div className="container">
            <div className="hero-content">
              <h1>Privacy Policy</h1>
              <p>Your privacy and data security are our top priorities. Learn how we collect, use, and protect your personal and medical information.</p>
              <div className="last-updated">
                <span>Last updated: December 2024</span>
              </div>
            </div>
          </div>
        </section>

        <div className="privacy-content">
          <div className="container">
            <div className="content-wrapper">
              {/* Table of Contents */}
              <aside className="toc-sidebar">
                <div className="toc-container">
                  <h3>Table of Contents</h3>
                  <nav className="toc-nav">
                    <ul>
                      <li>
                        <button 
                          className={activeSection === 'overview' ? 'active' : ''}
                          onClick={() => scrollToSection('overview')}
                        >
                          1. Overview
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'information-we-collect' ? 'active' : ''}
                          onClick={() => scrollToSection('information-we-collect')}
                        >
                          2. Information We Collect
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'how-we-use' ? 'active' : ''}
                          onClick={() => scrollToSection('how-we-use')}
                        >
                          3. How We Use Your Information
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'information-sharing' ? 'active' : ''}
                          onClick={() => scrollToSection('information-sharing')}
                        >
                          4. Information Sharing
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'data-security' ? 'active' : ''}
                          onClick={() => scrollToSection('data-security')}
                        >
                          5. Data Security
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'your-rights' ? 'active' : ''}
                          onClick={() => scrollToSection('your-rights')}
                        >
                          6. Your Rights
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'cookies' ? 'active' : ''}
                          onClick={() => scrollToSection('cookies')}
                        >
                          7. Cookies & Tracking
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'third-party' ? 'active' : ''}
                          onClick={() => scrollToSection('third-party')}
                        >
                          8. Third-Party Services
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'data-retention' ? 'active' : ''}
                          onClick={() => scrollToSection('data-retention')}
                        >
                          9. Data Retention
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'international' ? 'active' : ''}
                          onClick={() => scrollToSection('international')}
                        >
                          10. International Transfers
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'children' ? 'active' : ''}
                          onClick={() => scrollToSection('children')}
                        >
                          11. Children's Privacy
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'changes' ? 'active' : ''}
                          onClick={() => scrollToSection('changes')}
                        >
                          12. Policy Changes
                        </button>
                      </li>
                      <li>
                        <button 
                          className={activeSection === 'contact' ? 'active' : ''}
                          onClick={() => scrollToSection('contact')}
                        >
                          13. Contact Us
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div className="policy-content">
                {/* Overview */}
                <section id="overview" className="policy-section">
                  <h2>1. Overview</h2>
                  <div className="section-content">
                    <p>
                      FlickXir ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal and medical information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform and services.
                    </p>
                    <div className="highlight-box">
                      <h4>🔒 Our Commitment</h4>
                      <p>We adhere to the highest standards of data protection and comply with applicable healthcare privacy regulations, including HIPAA and other relevant data protection laws.</p>
                    </div>
                    <p>
                      By using our services, you consent to the collection and use of your information as described in this policy. If you do not agree with our policies and practices, please do not use our services.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section id="information-we-collect" className="policy-section">
                  <h2>2. Information We Collect</h2>
                  <div className="section-content">
                    <p>We collect several types of information to provide and improve our services:</p>
                    
                    <div className="info-category">
                      <h3>2.1 Personal Information</h3>
                      <ul>
                        <li><strong>Account Information:</strong> Name, email address, phone number, date of birth</li>
                        <li><strong>Contact Details:</strong> Billing and shipping addresses</li>
                        <li><strong>Identity Verification:</strong> Government-issued ID for prescription verification</li>
                        <li><strong>Profile Information:</strong> Profile picture, preferences, and settings</li>
                      </ul>
                    </div>

                    <div className="info-category">
                      <h3>2.2 Medical Information</h3>
                      <ul>
                        <li><strong>Prescription Data:</strong> Prescription details, dosage, and medical history</li>
                        <li><strong>Health Records:</strong> Medical conditions, allergies, and treatment history</li>
                        <li><strong>Healthcare Provider Information:</strong> Doctor details and medical facility information</li>
                        <li><strong>Insurance Information:</strong> Health insurance details for claims processing</li>
                      </ul>
                    </div>

                    <div className="info-category">
                      <h3>2.3 Transaction Information</h3>
                      <ul>
                        <li><strong>Payment Data:</strong> Credit card information, billing addresses (processed securely)</li>
                        <li><strong>Order History:</strong> Purchase records, delivery information, and transaction details</li>
                        <li><strong>Financial Information:</strong> Insurance claims and reimbursement data</li>
                      </ul>
                    </div>

                    <div className="info-category">
                      <h3>2.4 Technical Information</h3>
                      <ul>
                        <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                        <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                        <li><strong>Location Data:</strong> Approximate location for delivery services</li>
                        <li><strong>Cookies and Tracking:</strong> Website preferences and session information</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Information */}
                <section id="how-we-use" className="policy-section">
                  <h2>3. How We Use Your Information</h2>
                  <div className="section-content">
                    <p>We use your information for the following purposes:</p>
                    
                    <div className="usage-grid">
                      <div className="usage-item">
                        <div className="usage-icon">🏥</div>
                        <h4>Healthcare Services</h4>
                        <ul>
                          <li>Process and fulfill prescription orders</li>
                          <li>Verify prescriptions with healthcare providers</li>
                          <li>Provide medication counseling and support</li>
                          <li>Manage your health records and history</li>
                        </ul>
                      </div>

                      <div className="usage-item">
                        <div className="usage-icon">🛒</div>
                        <h4>Order Management</h4>
                        <ul>
                          <li>Process payments and transactions</li>
                          <li>Arrange delivery and shipping</li>
                          <li>Handle returns and refunds</li>
                          <li>Provide customer support</li>
                        </ul>
                      </div>

                      <div className="usage-item">
                        <div className="usage-icon">📊</div>
                        <h4>Service Improvement</h4>
                        <ul>
                          <li>Analyze usage patterns and preferences</li>
                          <li>Improve our platform and services</li>
                          <li>Develop new features and offerings</li>
                          <li>Conduct research and analytics</li>
                        </ul>
                      </div>

                      <div className="usage-item">
                        <div className="usage-icon">📢</div>
                        <h4>Communication</h4>
                        <ul>
                          <li>Send order confirmations and updates</li>
                          <li>Provide important health information</li>
                          <li>Send promotional offers (with consent)</li>
                          <li>Respond to inquiries and support requests</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Information Sharing */}
                <section id="information-sharing" className="policy-section">
                  <h2>4. Information Sharing</h2>
                  <div className="section-content">
                    <p>We may share your information in the following circumstances:</p>
                    
                    <div className="sharing-category">
                      <h3>4.1 Healthcare Partners</h3>
                      <p>We share medical information with:</p>
                      <ul>
                        <li>Licensed pharmacies and healthcare providers</li>
                        <li>Insurance companies for claims processing</li>
                        <li>Medical professionals for consultation</li>
                        <li>Regulatory authorities as required by law</li>
                      </ul>
                    </div>

                    <div className="sharing-category">
                      <h3>4.2 Service Providers</h3>
                      <p>We work with trusted third parties who help us operate our services:</p>
                      <ul>
                        <li>Payment processors for secure transactions</li>
                        <li>Delivery services for order fulfillment</li>
                        <li>Cloud storage providers for data hosting</li>
                        <li>Analytics services for platform improvement</li>
                      </ul>
                    </div>

                    <div className="sharing-category">
                      <h3>4.3 Legal Requirements</h3>
                      <p>We may disclose information when required by law or to:</p>
                      <ul>
                        <li>Comply with legal processes and court orders</li>
                        <li>Protect our rights and property</li>
                        <li>Ensure user safety and prevent fraud</li>
                        <li>Cooperate with law enforcement</li>
                      </ul>
                    </div>

                    <div className="important-note">
                      <h4>⚠️ Important Note</h4>
                      <p>We never sell your personal or medical information to third parties for marketing purposes. All sharing is done in accordance with healthcare privacy regulations and with appropriate safeguards.</p>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section id="data-security" className="policy-section">
                  <h2>5. Data Security</h2>
                  <div className="section-content">
                    <p>We implement comprehensive security measures to protect your information:</p>
                    
                    <div className="security-grid">
                      <div className="security-item">
                        <div className="security-icon">🔐</div>
                        <h4>Encryption</h4>
                        <p>All data is encrypted in transit and at rest using industry-standard encryption protocols (AES-256, TLS 1.3).</p>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">🛡️</div>
                        <h4>Access Controls</h4>
                        <p>Strict access controls ensure only authorized personnel can access your information on a need-to-know basis.</p>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">🔍</div>
                        <h4>Regular Audits</h4>
                        <p>We conduct regular security audits and vulnerability assessments to maintain the highest security standards.</p>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">💾</div>
                        <h4>Secure Storage</h4>
                        <p>Data is stored in secure, HIPAA-compliant data centers with multiple layers of physical and digital security.</p>
                      </div>
                    </div>

                    <div className="security-practices">
                      <h3>Additional Security Practices</h3>
                      <ul>
                        <li>Multi-factor authentication for account access</li>
                        <li>Regular security training for all employees</li>
                        <li>Incident response procedures for security breaches</li>
                        <li>Compliance with healthcare security standards</li>
                        <li>Regular backup and disaster recovery procedures</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Your Rights */}
                <section id="your-rights" className="policy-section">
                  <h2>6. Your Rights</h2>
                  <div className="section-content">
                    <p>You have several rights regarding your personal information:</p>
                    
                    <div className="rights-grid">
                      <div className="right-item">
                        <h4>👁️ Right to Access</h4>
                        <p>Request a copy of all personal information we hold about you, including medical records and transaction history.</p>
                      </div>

                      <div className="right-item">
                        <h4>✏️ Right to Rectification</h4>
                        <p>Request correction of inaccurate or incomplete personal information in your account or medical records.</p>
                      </div>

                      <div className="right-item">
                        <h4>🗑️ Right to Erasure</h4>
                        <p>Request deletion of your personal information, subject to legal and regulatory requirements.</p>
                      </div>

                      <div className="right-item">
                        <h4>⏸️ Right to Restrict Processing</h4>
                        <p>Request limitation of how we process your information in certain circumstances.</p>
                      </div>

                      <div className="right-item">
                        <h4>📤 Right to Data Portability</h4>
                        <p>Request transfer of your data to another service provider in a structured, machine-readable format.</p>
                      </div>

                      <div className="right-item">
                        <h4>❌ Right to Object</h4>
                        <p>Object to processing of your information for marketing purposes or other legitimate interests.</p>
                      </div>
                    </div>

                    <div className="rights-exercise">
                      <h3>How to Exercise Your Rights</h3>
                      <p>To exercise any of these rights, please contact us using the information provided in the "Contact Us" section. We will respond to your request within 30 days and may require identity verification for security purposes.</p>
                    </div>
                  </div>
                </section>

                {/* Cookies & Tracking */}
                <section id="cookies" className="policy-section">
                  <h2>7. Cookies & Tracking Technologies</h2>
                  <div className="section-content">
                    <p>We use cookies and similar technologies to enhance your experience:</p>
                    
                    <div className="cookie-types">
                      <div className="cookie-type">
                        <h4>Essential Cookies</h4>
                        <p>Required for basic website functionality, including login sessions and security features.</p>
                      </div>

                      <div className="cookie-type">
                        <h4>Performance Cookies</h4>
                        <p>Help us understand how visitors interact with our website to improve performance and user experience.</p>
                      </div>

                      <div className="cookie-type">
                        <h4>Functional Cookies</h4>
                        <p>Remember your preferences and settings to provide a personalized experience.</p>
                      </div>

                      <div className="cookie-type">
                        <h4>Marketing Cookies</h4>
                        <p>Used to deliver relevant advertisements and track the effectiveness of marketing campaigns (with your consent).</p>
                      </div>
                    </div>

                    <div className="cookie-control">
                      <h3>Cookie Management</h3>
                      <p>You can control cookies through your browser settings. However, disabling certain cookies may affect website functionality. You can also manage your cookie preferences through our cookie consent banner.</p>
                    </div>
                  </div>
                </section>

                {/* Third-Party Services */}
                <section id="third-party" className="policy-section">
                  <h2>8. Third-Party Services</h2>
                  <div className="section-content">
                    <p>We work with trusted third-party services to provide our platform:</p>
                    
                    <div className="third-party-list">
                      <div className="service-category">
                        <h4>Payment Processing</h4>
                        <p>Secure payment processing through certified PCI-DSS compliant providers.</p>
                      </div>

                      <div className="service-category">
                        <h4>Analytics Services</h4>
                        <p>Website analytics to understand user behavior and improve our services.</p>
                      </div>

                      <div className="service-category">
                        <h4>Customer Support</h4>
                        <p>Chat and support services to provide timely assistance to our users.</p>
                      </div>

                      <div className="service-category">
                        <h4>Delivery Partners</h4>
                        <p>Logistics and delivery services for order fulfillment and tracking.</p>
                      </div>
                    </div>

                    <p>All third-party services are carefully vetted and required to maintain appropriate data protection standards. We have data processing agreements in place to ensure your information is handled securely.</p>
                  </div>
                </section>

                {/* Data Retention */}
                <section id="data-retention" className="policy-section">
                  <h2>9. Data Retention</h2>
                  <div className="section-content">
                    <p>We retain your information for different periods based on the type of data and legal requirements:</p>
                    
                    <div className="retention-table">
                      <div className="retention-row">
                        <div className="data-type">Account Information</div>
                        <div className="retention-period">Until account deletion or 7 years after last activity</div>
                      </div>
                      <div className="retention-row">
                        <div className="data-type">Medical Records</div>
                        <div className="retention-period">As required by healthcare regulations (typically 7-10 years)</div>
                      </div>
                      <div className="retention-row">
                        <div className="data-type">Transaction Data</div>
                        <div className="retention-period">7 years for tax and regulatory compliance</div>
                      </div>
                      <div className="retention-row">
                        <div className="data-type">Marketing Data</div>
                        <div className="retention-period">Until consent is withdrawn or 3 years of inactivity</div>
                      </div>
                      <div className="retention-row">
                        <div className="data-type">Technical Logs</div>
                        <div className="retention-period">90 days for security and troubleshooting</div>
                      </div>
                    </div>

                    <p>When data is no longer needed, it is securely deleted or anonymized in accordance with our data retention policies and applicable regulations.</p>
                  </div>
                </section>

                {/* International Transfers */}
                <section id="international" className="policy-section">
                  <h2>10. International Data Transfers</h2>
                  <div className="section-content">
                    <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:</p>
                    
                    <ul>
                      <li>Data processing agreements with international partners</li>
                      <li>Compliance with applicable data protection frameworks</li>
                      <li>Use of standard contractual clauses for data transfers</li>
                      <li>Regular assessment of data protection standards in destination countries</li>
                    </ul>

                    <p>We only transfer data to countries that provide adequate protection or have appropriate safeguards in place to protect your information.</p>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section id="children" className="policy-section">
                  <h2>11. Children's Privacy</h2>
                  <div className="section-content">
                    <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
                    
                    <div className="children-policy">
                      <h4>For Minors (13-18 years)</h4>
                      <ul>
                        <li>Parental consent is required for account creation</li>
                        <li>Parents can access and control their child's information</li>
                        <li>Special protections apply to medical information</li>
                        <li>Limited data collection and processing</li>
                      </ul>
                    </div>

                    <p>If you believe we have collected information from a child under 13, please contact us immediately so we can delete such information.</p>
                  </div>
                </section>

                {/* Policy Changes */}
                <section id="changes" className="policy-section">
                  <h2>12. Changes to This Policy</h2>
                  <div className="section-content">
                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
                    
                    <div className="changes-process">
                      <h4>How We Handle Changes</h4>
                      <ul>
                        <li>Material changes will be communicated via email or platform notification</li>
                        <li>The updated policy will be posted on our website with a new effective date</li>
                        <li>Continued use of our services constitutes acceptance of the updated policy</li>
                        <li>You can review the full history of changes upon request</li>
                      </ul>
                    </div>

                    <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
                  </div>
                </section>

                {/* Contact Us */}
                <section id="contact" className="policy-section">
                  <h2>13. Contact Us</h2>
                  <div className="section-content">
                    <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                    
                    <div className="contact-info">
                      <div className="contact-method">
                        <h4>📧 Email</h4>
                        <p>privacy@flickxir.com</p>
                      </div>

                      <div className="contact-method">
                        <h4>📞 Phone</h4>
                        <p>+91-XXXX-XXXXXX (Privacy Hotline)</p>
                      </div>

                      <div className="contact-method">
                        <h4>📍 Address</h4>
                        <p>
                          FlickXir Privacy Office<br/>
                          [Your Address]<br/>
                          Greater Noida, UP, India
                        </p>
                      </div>

                      <div className="contact-method">
                        <h4>⏰ Response Time</h4>
                        <p>We aim to respond to all privacy inquiries within 48 hours.</p>
                      </div>
                    </div>

                    <div className="dpo-info">
                      <h4>Data Protection Officer</h4>
                      <p>For complex privacy matters, you can contact our Data Protection Officer directly at dpo@flickxir.com</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Back to Top Button */}
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>

      {/* Reading Progress Indicator */}
      <div 
        className={`reading-progress ${showBackToTop ? 'visible' : ''}`}
        style={{ '--progress': `${readingProgress}%` }}
        title={`Reading progress: ${Math.round(readingProgress)}%`}
      />
    </div>
  );
};

export default PrivacyPolicy;


