import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // Form validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const showError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const hideError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      hideError(name);
    }
    
    // Clear auth error when user types
    if (authError) {
      setAuthError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    let hasErrors = false;
    
    if (!formData.firstName.trim()) {
      showError('firstName', 'First name is required');
      hasErrors = true;
    }
    
    if (!formData.lastName.trim()) {
      showError('lastName', 'Last name is required');
      hasErrors = true;
    }
    
    if (!formData.email) {
      showError('email', 'Email is required');
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      showError('email', 'Please enter a valid email');
      hasErrors = true;
    }
    
    if (!formData.password) {
      showError('password', 'Password is required');
      hasErrors = true;
    } else if (formData.password.length < 6) {
      showError('password', 'Password must be at least 6 characters');
      hasErrors = true;
    }
    
    if (!formData.confirmPassword) {
      showError('confirmPassword', 'Please confirm your password');
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      showError('confirmPassword', 'Passwords do not match');
      hasErrors = true;
    }
    
    if (!formData.phone) {
      showError('phone', 'Phone number is required');
      hasErrors = true;
    } else if (!validatePhone(formData.phone)) {
      showError('phone', 'Please enter a valid 10-digit phone number');
      hasErrors = true;
    }
    
    if (!formData.agreeToTerms) {
      showError('agreeToTerms', 'You must agree to the terms and conditions');
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Real authentication
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      console.log('Attempting sign up with:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      // Try real sign up first
      const { error, data } = await signUp(
        formData.email, 
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email
        }
      );
      
      console.log('Sign up response:', { error, data });
      
      if (error) {
        console.error('Sign up error details:', error);
        
        // If it's a Supabase configuration error, show helpful message
        if (error.message && error.message.includes('configuration') || 
            error.message && error.message.includes('credentials')) {
          setAuthError('Sign up service is not properly configured. Please contact support.');
        } else {
          setAuthError(error.message || 'Sign up failed. Please try again.');
        }
      } else {
        // Success - show email confirmation message
        setAuthError(''); // Clear any previous errors
        setIsSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          agreeToTerms: false
        });
      }
    } catch (err) {
      console.error('Sign up unexpected error:', err);
      
      // Check if it's a network or configuration issue
      if (err.message && err.message.includes('fetch')) {
        setAuthError('Network error. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('Supabase')) {
        setAuthError('Authentication service is not available. Please try again later.');
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join FlickXir India and start your healthcare journey</p>
        </div>
        
        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}
        
        {isSuccess && (
          <div className="auth-success">
            <h3>🎉 Account Created Successfully!</h3>
            <p>Please check your email to confirm your account before signing in.</p>
            <p><strong>Note:</strong> You must confirm your email before you can sign in.</p>
            <div className="success-actions">
              <Link to="/signin" className="success-link">Go to Sign In</Link>
            </div>
          </div>
        )}
        
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your 10-digit phone number"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              I agree to the <a href="/terms" className="terms-link">Terms & Conditions</a> and <a href="/privacy" className="terms-link">Privacy Policy</a>
            </label>
            {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
          </div>
          
          <button type="submit" className="signup-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        )}
        {!isSuccess && (
          <>
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="social-signup">
              <button type="button" className="social-button google" onClick={signInWithGoogle} disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" className="social-icon">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              
              <button type="button" className="social-button facebook" disabled>
                <svg viewBox="0 0 24 24" className="social-icon">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Continue with Facebook (Coming Soon)
              </button>
            </div>
            
            <div className="signin-prompt">
              <p>Already have an account? <Link to="/signin" className="signin-link">Sign in</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
