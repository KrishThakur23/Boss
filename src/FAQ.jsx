import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const faqs = [
  {
    q: 'How do I order medicines on FlickXir?',
    a: 'Search for your medicines, add them to cart, and upload a valid prescription when required. Proceed to checkout and choose your preferred delivery slot.'
  },
  {
    q: 'Do I need a prescription?',
    a: 'Prescription is required for all Schedule H and X medicines. OTC items (vitamins, personal care, wellness) can be ordered without a prescription.'
  },
  {
    q: 'What are the delivery timelines?',
    a: 'Most orders are delivered within 24-48 hours depending on your location and product availability. Express delivery may be available in select cities.'
  },
  {
    q: 'Can I return medicines?',
    a: 'Returns are restricted due to safety norms. Damaged, incorrect, or short-expiry items are eligible. See the Return Policy for details.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We follow industry-grade security and privacy practices to protect your personal and medical data.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="home">
      <Header />
      <main className="main-content">
        <section className="page-hero animate-on-scroll">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about ordering medicines and healthcare products</p>
        </section>

        <section className="page-section">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`faq-card animate-on-scroll ${openIndex === idx ? 'open' : ''}`}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                transition: 'transform .25s ease, box-shadow .25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'; }}
            >
              <button
                onClick={() => toggle(idx)}
                className="faq-question"
                aria-expanded={openIndex === idx}
                aria-controls={`faq-panel-${idx}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.q}</span>
                <span
                  aria-hidden
                  style={{
                    transition: 'transform .25s ease',
                    transform: openIndex === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                    color: '#059669',
                    fontSize: '1.5rem',
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </button>
              <div
                id={`faq-panel-${idx}`}
                role="region"
                style={{
                  maxHeight: openIndex === idx ? 500 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .35s ease',
                }}
              >
                <p style={{ marginTop: 8, color: '#334155' }}>{item.a}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="page-section animate-on-scroll" style={{ textAlign: 'center', padding: '10px 20px 60px' }}>
          <h2>Still have questions?</h2>
          <p style={{ marginBottom: 16 }}>Our support team is here to help you 24/7.</p>
          <div className="cta-buttons" style={{ display: 'inline-flex', gap: 12 }}>
            <button className="cta-btn primary">Chat with Support</button>
            <button className="cta-btn secondary">Contact Us</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;


