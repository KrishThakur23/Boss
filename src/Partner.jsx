import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Partner = () => {
  return (
    <div className="partner">
      <Header />
      <main className="main-content">
        <div className="container">
          <h1>Partner with FlickXir</h1>
          <p>Join our network of healthcare partners.</p>
          <p>Together, we can make healthcare more accessible for everyone.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Partner;