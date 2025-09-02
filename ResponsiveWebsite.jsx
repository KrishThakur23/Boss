import React, { useState } from 'react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">Logo</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Home
                </a>
                <a href="#about" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  About
                </a>
                <a href="#services" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Services
                </a>
                <a href="#contact" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Contact
                </a>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a
                href="#home"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                About
              </a>
              <a
                href="#services"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Services
              </a>
              <a
                href="#contact"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Modern
                </span>{' '}
                Responsive Design
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Experience seamless design that adapts perfectly to any device. 
                Built with modern technologies and mobile-first approach for 
                optimal user experience across all platforms.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Get Started
              </button>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl h-64 sm:h-80 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">🚀</div>
                      <p className="text-xl font-semibold">Your Image Here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 px-4 sm:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the powerful features that make our solution stand out
            </p>
          </div>

          {/* Cards Grid - Mobile First: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Optimized performance ensures your website loads instantly 
                  across all devices and platforms.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Mobile First
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Designed with mobile users in mind, ensuring perfect 
                  experience on smartphones and tablets.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Modern Design
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Beautiful, contemporary design with smooth animations 
                  and intuitive user interface elements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their digital presence with our responsive solutions.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300">
            Contact Us Today
          </button>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              © 2024 Your Company. All rights reserved. Built with React & Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}