import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, resetPassword, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    
    if (hasErrors) return;
    
    // Real authentication
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
             if (error) {
         // Handle specific email confirmation error
         if (error.message.includes('Email not confirmed')) {
           setAuthError('❌ Email not confirmed. Please check your email and click the confirmation link before signing in.');
         } else {
           setAuthError(error.message || 'Sign in failed. Please try again.');
         }
       } else {
         // Success - user will be redirected by useEffect
         console.log('Sign in successful!');
       }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    // Require a valid email to send reset
    if (!formData.email) {
      showError('email', 'Enter your email to reset password');
      return;
    }
    if (!validateEmail(formData.email)) {
      showError('email', 'Please enter a valid email');
      return;
    }
    setIsResetting(true);
    setResetMessage('');
    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        setResetMessage(error.message || 'Failed to send reset email. Please try again.');
      } else {
        setResetMessage('✅ Password reset email sent. Check your inbox and follow the link.');
      }
    } catch (err) {
      setResetMessage('Failed to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };



  if (loading) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your FlickXir India account</p>
        </div>
        
        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="signin-form">
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <button type="button" onClick={handleForgotPassword} className="forgot-password" disabled={isResetting}>
              {isResetting ? 'Sending...' : 'Forgot Password?'}
            </button>
          </div>

          {resetMessage && (
            <div className="reset-info" style={{ marginTop: '8px', color: resetMessage.startsWith('✅') ? '#047857' : '#b91c1c' }}>
              {resetMessage}
            </div>
          )}
          
          <button type="submit" className="signin-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <div className="social-login">
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
        
        <div className="signup-prompt">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
