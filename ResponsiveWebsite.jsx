import React, { useState } from 'react';

export default function App() {
  // Add mobile-specific styles
  React.useEffect(() => {
    // Prevent zoom on double tap for mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Add touch-action CSS for better touch handling
    document.body.style.touchAction = 'manipulation';
    
    return () => {
      document.body.style.touchAction = '';
    };
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = useState(true);
  const [activeMobileSection, setActiveMobileSection] = useState('home');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMobileNav = () => {
    setIsMobileNavCollapsed(!isMobileNavCollapsed);
  };

  const handleMobileNavClick = (section) => {
    setActiveMobileSection(section);
    // Optional: collapse nav after selection
    setIsMobileNavCollapsed(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Layout - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
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
      {/* End Desktop Layout */}

      {/* Mobile-Only Layout */}
      <div className="block md:hidden w-full">
        {/* Mobile Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 via-white to-gray-50 px-6 py-12 pb-32">
          <div className="space-y-8">
            {/* Mobile Hero Content */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Modern
                </span>
                <br />
                <span className="text-gray-900">Mobile Experience</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-sm mx-auto">
                Designed specifically for mobile users with touch-friendly interactions and app-like experience.
              </p>
              
              {/* Large Mobile CTA Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 text-white font-semibold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl active:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[56px] touch-manipulation select-none">
                <span className="text-lg">Get Started Now</span>
                <div className="text-sm opacity-90 mt-1">Tap to begin your journey</div>
              </button>
            </div>

            {/* Mobile Hero Image */}
            <div className="flex justify-center pt-4">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 animate-pulse"></div>
                    
                    <div className="text-white text-center relative z-10">
                      <div className="text-7xl mb-4 animate-bounce">🚀</div>
                      <p className="text-xl font-semibold">Mobile First</p>
                      <p className="text-sm opacity-90 mt-1">Touch & Swipe Ready</p>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">99%</div>
                <div className="text-xs text-gray-600 mt-1">Mobile Ready</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">Fast</div>
                <div className="text-xs text-gray-600 mt-1">Loading</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-2xl font-bold text-pink-600">24/7</div>
                <div className="text-xs text-gray-600 mt-1">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Cards Section */}
        <section className="px-6 py-12 pb-32 bg-gray-50">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Features
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover what makes our mobile experience exceptional
            </p>
          </div>

          {/* Mobile Cards - Vertical Stack */}
          <div className="space-y-6 touch-manipulation">
            {/* Card 1 - Lightning Fast */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-50 active:scale-95 active:shadow-md transition-all duration-150 touch-manipulation select-none">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl w-20 h-20 flex items-center justify-center shadow-md">
                    <span className="text-4xl">⚡</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Lightning Fast
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">
                    Optimized performance ensures your mobile experience is instant and smooth across all devices.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:shadow-sm active:scale-90 transition-all duration-150 min-h-[44px] touch-manipulation select-none">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 - Mobile First */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-50 active:scale-95 active:shadow-md transition-all duration-150 touch-manipulation select-none">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl w-20 h-20 flex items-center justify-center shadow-md">
                    <span className="text-4xl">📱</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Mobile First Design
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">
                    Built specifically for mobile users with touch-friendly interactions and intuitive navigation.
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:shadow-sm active:scale-90 transition-all duration-150 min-h-[44px] touch-manipulation select-none">
                    Explore
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 - Modern Design */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-50 active:scale-95 active:shadow-md transition-all duration-150 touch-manipulation select-none">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl w-20 h-20 flex items-center justify-center shadow-md">
                    <span className="text-4xl">🎨</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Modern Design
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">
                    Beautiful, contemporary design with smooth animations and premium mobile interface elements.
                  </p>
                  <button className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:shadow-sm active:scale-90 transition-all duration-150 min-h-[44px] touch-manipulation select-none">
                    View Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Mobile-Specific Card */}
            <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl p-8 border border-pink-100 active:scale-95 active:shadow-md transition-all duration-150 touch-manipulation select-none">
              <div className="text-center">
                <div className="bg-gradient-to-br from-pink-100 to-orange-200 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  App-Like Experience
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Native mobile app feel with smooth gestures, haptic feedback, and intuitive touch interactions.
                </p>
                <button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 active:from-pink-800 active:to-orange-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg active:shadow-sm active:scale-90 transition-all duration-150 min-h-[44px] touch-manipulation select-none">
                  Try It Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Footer Section */}
        <footer className="bg-gradient-to-b from-gray-900 to-black text-white px-6 py-12 pb-32">
          <div className="text-center space-y-8">
            {/* Footer Header */}
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Ready to Get Started?</h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of mobile users who love our app-like experience
              </p>
            </div>

            {/* Mobile Stats */}
            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-blue-400">10K+</div>
                <div className="text-sm text-gray-300 mt-1">Happy Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-green-400">4.9★</div>
                <div className="text-sm text-gray-300 mt-1">App Rating</div>
              </div>
            </div>

            {/* Large Mobile CTA */}
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl active:scale-98 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[56px]">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">🚀</span>
                  <div>
                    <div className="text-lg font-bold">Start Your Journey</div>
                    <div className="text-sm opacity-90">Tap to begin now</div>
                  </div>
                </div>
              </button>

              {/* Secondary Action */}
              <button className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl border border-white/30 hover:border-white/50 active:scale-98 transition-all duration-200 min-h-[44px]">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">📞</span>
                  <span>Contact Support</span>
                </div>
              </button>
            </div>

            {/* Mobile Social Links */}
            <div className="flex justify-center space-x-6 py-4">
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-200">
                <span className="text-xl">📱</span>
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-200">
                <span className="text-xl">💬</span>
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-200">
                <span className="text-xl">📧</span>
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-200">
                <span className="text-xl">🌐</span>
              </button>
            </div>

            {/* Mobile App Download */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-4">Get Our Mobile App</h4>
              <div className="space-y-3">
                <button className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl border border-gray-700 active:scale-98 transition-all duration-200 min-h-[44px]">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-lg">📱</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-sm font-bold">App Store</div>
                    </div>
                  </div>
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl active:scale-98 transition-all duration-200 min-h-[44px]">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-lg">🤖</span>
                    <div className="text-left">
                      <div className="text-xs text-green-200">Get it on</div>
                      <div className="text-sm font-bold">Google Play</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-sm text-gray-400 leading-relaxed">
                © 2024 Your Company. All rights reserved.
                <br />
                <span className="text-xs">Built with ❤️ for mobile users</span>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile-Only Bottom Navigation */}
      <nav className="block md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 z-50">
        <div className="px-6 py-4">
          {/* Navigation Toggle Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleMobileNav}
              className="w-12 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors duration-200"
              aria-label="Toggle navigation"
            />
          </div>

          {/* Navigation Items */}
          <div className={`transition-all duration-300 ease-in-out ${
            isMobileNavCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'
          }`}>
            <div className="grid grid-cols-2 gap-4 pb-4">
              {/* Home */}
              <a
                href="#home"
                onClick={() => handleMobileNavClick('home')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-150 min-h-[44px] touch-manipulation select-none ${
                  activeMobileSection === 'home'
                    ? 'bg-blue-100 text-blue-600 shadow-md scale-95'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 active:bg-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">🏠</span>
                <span className="text-sm font-medium">Home</span>
              </a>

              {/* About */}
              <a
                href="#about"
                onClick={() => handleMobileNavClick('about')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-150 min-h-[44px] touch-manipulation select-none ${
                  activeMobileSection === 'about'
                    ? 'bg-blue-100 text-blue-600 shadow-md scale-95'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 active:bg-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">👥</span>
                <span className="text-sm font-medium">About</span>
              </a>

              {/* Services */}
              <a
                href="#services"
                onClick={() => handleMobileNavClick('services')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-150 min-h-[44px] touch-manipulation select-none ${
                  activeMobileSection === 'services'
                    ? 'bg-blue-100 text-blue-600 shadow-md scale-95'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 active:bg-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">⚡</span>
                <span className="text-sm font-medium">Services</span>
              </a>

              {/* Contact */}
              <a
                href="#contact"
                onClick={() => handleMobileNavClick('contact')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-150 min-h-[44px] touch-manipulation select-none ${
                  activeMobileSection === 'contact'
                    ? 'bg-blue-100 text-blue-600 shadow-md scale-95'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 active:bg-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">📞</span>
                <span className="text-sm font-medium">Contact</span>
              </a>
            </div>
          </div>

          {/* Always Visible Quick Actions */}
          <div className="flex justify-center space-x-4 pt-2 border-t border-gray-100">
            <button
              onClick={toggleMobileNav}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 active:scale-90 active:shadow-md transition-all duration-150 touch-manipulation select-none"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  isMobileNavCollapsed ? 'rotate-0' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}