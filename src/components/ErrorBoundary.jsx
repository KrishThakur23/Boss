/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays fallback UI
 */

import React from 'react';
import { ErrorMessage } from './UserFeedback';
import ErrorHandlingService from '../services/errorHandlingService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Handle the error using our error handling service
    const errorDetails = ErrorHandlingService.handleGeneralError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId
    });

    // Log the structured error
    ErrorHandlingService.logError(errorDetails, {
      component: 'ErrorBoundary',
      props: this.props,
      errorInfo
    });
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    // Reload the page as a last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <ErrorMessage
            title="Something went wrong"
            message="An unexpected error occurred while loading this section. This has been automatically reported to our team."
            suggestions={[
              'Try refreshing the page',
              'Clear your browser cache and cookies',
              'Try again in a few minutes',
              'Contact support if the problem persists'
            ]}
            onRetry={this.handleRetry}
            technicalDetails={
              this.props.showTechnicalDetails 
                ? `${this.state.error?.message}\n\nError ID: ${this.state.errorId}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`
                : `Error ID: ${this.state.errorId}`
            }
          />
          
          <div className="error-boundary-actions">
            <button 
              className="reload-button"
              onClick={this.handleReload}
            >
              🔄 Reload Page
            </button>
            
            {this.props.onError && (
              <button 
                className="report-button"
                onClick={() => this.props.onError(this.state.error, this.state.errorInfo)}
              >
                📧 Report Issue
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error, context = {}) => {
    console.error('Error handled by useErrorHandler:', error);
    
    const errorDetails = ErrorHandlingService.handleGeneralError(error, {
      ...context,
      hook: 'useErrorHandler'
    });

    ErrorHandlingService.logError(errorDetails, context);
    setError(errorDetails);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

export default ErrorBoundary;