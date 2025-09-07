/**
 * Performance Monitoring Service
 * Tracks and logs performance metrics for prescription matching operations
 */

import { supabase } from '../config/supabase';

export default class PerformanceMonitoringService {
  
  /**
   * Operation types for performance tracking
   */
  static OPERATION_TYPES = {
    OCR_PROCESSING: 'ocr',
    MEDICINE_MATCHING: 'matching',
    CART_OPERATIONS: 'cart',
    FULL_PIPELINE: 'full_pipeline',
    DATABASE_SEARCH: 'database_search',
    CACHE_OPERATIONS: 'cache'
  };

  /**
   * Performance thresholds (in milliseconds)
   */
  static PERFORMANCE_THRESHOLDS = {
    OCR_PROCESSING: 10000,      // 10 seconds
    MEDICINE_MATCHING: 5000,    // 5 seconds
    CART_OPERATIONS: 2000,      // 2 seconds
    FULL_PIPELINE: 15000,       // 15 seconds
    DATABASE_SEARCH: 1000,      // 1 second
    CACHE_OPERATIONS: 100       // 100ms
  };

  /**
   * Start performance tracking for an operation
   * @param {string} operationType - Type of operation
   * @param {Object} context - Additional context
   * @returns {Object} Performance tracker
   */
  static startTracking(operationType, context = {}) {
    const startTime = performance.now();
    const trackingId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    `);
    
    return {
      trackingId,
      operationType,
      startTime,
      context,
      
      // Method to end tracking and log results
      end: (success = true, error = null, additionalContext = {}) => {
        return this.endTracking({
          trackingId,
          operationType,
          startTime,
          success,
          error,
          context: { ...context, ...additionalContext }
        });
      },
      
      // Method to add checkpoint
      checkpoint: (checkpointName, checkpointContext = {}) => {
        const checkpointTime = performance.now();
        const duration = checkpointTime - startTime;
        
        }ms`);
        
        return {
          name: checkpointName,
          duration,
          timestamp: checkpointTime,
          context: checkpointContext
        };
      }
    };
  }

  /**
   * End performance tracking and log results
   * @param {Object} trackingData - Tracking data from startTracking
   * @returns {Promise<Object>} Performance results
   */
  static async endTracking(trackingData) {
    const endTime = performance.now();
    const duration = Math.round(endTime - trackingData.startTime);
    
    const performanceResult = {
      trackingId: trackingData.trackingId,
      operationType: trackingData.operationType,
      duration,
      success: trackingData.success,
      error: trackingData.error,
      context: trackingData.context,
      timestamp: new Date().toISOString(),
      isSlowOperation: this.isSlowOperation(trackingData.operationType, duration)
    };

    // Log to database
    try {
      await this.logPerformanceMetric(performanceResult);
    } catch (logError) {
      console.warn('Failed to log performance metric:', logError);
    }

    // Log to browser performance API if available
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      try {
        window.performance.mark(`${trackingData.operationType}-end`);
        window.performance.measure(
          `${trackingData.operationType}-duration`,
          `${trackingData.operationType}-start`,
          `${trackingData.operationType}-end`
        );
      } catch (perfError) {
        console.warn('Failed to log to Performance API:', perfError);
      }
    }

    return performanceResult;
  }

  /**
   * Log performance metric to database
   * @param {Object} performanceData - Performance data to log
   * @returns {Promise<void>}
   */
  static async logPerformanceMetric(performanceData) {
    try {
      const { error } = await supabase.rpc('log_prescription_performance', {
        operation_type_param: performanceData.operationType,
        duration_ms_param: performanceData.duration,
        success_param: performanceData.success,
        error_message_param: performanceData.error?.message || null,
        context_param: performanceData.context || {}
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to log performance metric to database:', error);
      // Store in local storage as fallback
      this.logToLocalStorage(performanceData);
    }
  }

  /**
   * Log performance data to local storage as fallback
   * @param {Object} performanceData - Performance data
   */
  static logToLocalStorage(performanceData) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('performanceLogs') || '[]');
      existingLogs.push(performanceData);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('performanceLogs', JSON.stringify(existingLogs));
    } catch (storageError) {
      console.warn('Failed to store performance log locally:', storageError);
    }
  }

  /**
   * Check if operation duration exceeds threshold
   * @param {string} operationType - Type of operation
   * @param {number} duration - Duration in milliseconds
   * @returns {boolean} True if operation is slow
   */
  static isSlowOperation(operationType, duration) {
    const threshold = this.PERFORMANCE_THRESHOLDS[operationType.toUpperCase()] || 5000;
    return duration > threshold;
  }

  /**
   * Get performance statistics from database
   * @param {string} operationType - Optional operation type filter
   * @param {number} hoursBack - Hours to look back (default 24)
   * @returns {Promise<Array>} Performance statistics
   */
  static async getPerformanceStats(operationType = null, hoursBack = 24) {
    try {
      const { data, error } = await supabase.rpc('get_performance_stats', {
        operation_type_param: operationType,
        hours_back: hoursBack
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return [];
    }
  }

  /**
   * Get real-time performance metrics from local storage
   * @returns {Array} Local performance logs
   */
  static getLocalPerformanceLogs() {
    try {
      return JSON.parse(localStorage.getItem('performanceLogs') || '[]');
    } catch (error) {
      console.warn('Failed to get local performance logs:', error);
      return [];
    }
  }

  /**
   * Monitor prescription processing pipeline
   * @param {Function} pipelineFunction - Function to monitor
   * @param {Object} context - Context for monitoring
   * @returns {Function} Wrapped function with monitoring
   */
  static monitorPipeline(pipelineFunction, context = {}) {
    return async (...args) => {
      const tracker = this.startTracking(this.OPERATION_TYPES.FULL_PIPELINE, {
        ...context,
        functionName: pipelineFunction.name,
        argumentCount: args.length
      });

      try {
        const result = await pipelineFunction(...args);
        tracker.end(true, null, { resultType: typeof result });
        return result;
      } catch (error) {
        tracker.end(false, error, { errorType: error.constructor.name });
        throw error;
      }
    };
  }

  /**
   * Monitor database operations
   * @param {Function} dbOperation - Database operation to monitor
   * @param {string} operationName - Name of the operation
   * @returns {Function} Wrapped function with monitoring
   */
  static monitorDatabaseOperation(dbOperation, operationName) {
    return async (...args) => {
      const tracker = this.startTracking(this.OPERATION_TYPES.DATABASE_SEARCH, {
        operationName,
        argumentCount: args.length
      });

      try {
        const result = await dbOperation(...args);
        const resultCount = Array.isArray(result?.data) ? result.data.length : 0;
        
        tracker.end(true, null, { 
          resultCount,
          hasError: !!result?.error 
        });
        
        return result;
      } catch (error) {
        tracker.end(false, error);
        throw error;
      }
    };
  }

  /**
   * Create performance alert if operation is too slow
   * @param {Object} performanceResult - Performance result
   * @returns {Object|null} Alert object if threshold exceeded
   */
  static createPerformanceAlert(performanceResult) {
    if (!performanceResult.isSlowOperation) {
      return null;
    }

    const threshold = this.PERFORMANCE_THRESHOLDS[performanceResult.operationType.toUpperCase()];
    const exceedanceRatio = performanceResult.duration / threshold;

    return {
      type: 'performance_alert',
      severity: exceedanceRatio > 2 ? 'high' : 'medium',
      operationType: performanceResult.operationType,
      duration: performanceResult.duration,
      threshold,
      exceedanceRatio: Math.round(exceedanceRatio * 100) / 100,
      message: `${performanceResult.operationType} operation took ${performanceResult.duration}ms (${exceedanceRatio.toFixed(1)}x threshold)`,
      timestamp: performanceResult.timestamp,
      context: performanceResult.context
    };
  }

  /**
   * Get performance summary for dashboard
   * @returns {Promise<Object>} Performance summary
   */
  static async getPerformanceSummary() {
    try {
      const stats = await this.getPerformanceStats();
      const localLogs = this.getLocalPerformanceLogs();
      
      // Calculate recent performance from local logs
      const recentLogs = localLogs.filter(log => {
        const logTime = new Date(log.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return logTime > oneHourAgo;
      });

      const slowOperations = recentLogs.filter(log => log.isSlowOperation);
      const failedOperations = recentLogs.filter(log => !log.success);

      return {
        database: {
          stats,
          totalOperations: stats.reduce((sum, stat) => sum + parseInt(stat.total_operations), 0),
          averageSuccessRate: stats.length > 0 
            ? Math.round(stats.reduce((sum, stat) => sum + parseFloat(stat.success_rate), 0) / stats.length)
            : 0
        },
        recent: {
          totalOperations: recentLogs.length,
          slowOperations: slowOperations.length,
          failedOperations: failedOperations.length,
          averageDuration: recentLogs.length > 0
            ? Math.round(recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length)
            : 0
        },
        alerts: slowOperations.map(log => this.createPerformanceAlert(log)).filter(Boolean)
      };
    } catch (error) {
      console.error('Failed to get performance summary:', error);
      return {
        database: { stats: [], totalOperations: 0, averageSuccessRate: 0 },
        recent: { totalOperations: 0, slowOperations: 0, failedOperations: 0, averageDuration: 0 },
        alerts: []
      };
    }
  }

  /**
   * Clear old local performance logs
   * @param {number} maxAge - Maximum age in hours (default 24)
   */
  static clearOldLocalLogs(maxAge = 24) {
    try {
      const logs = this.getLocalPerformanceLogs();
      const cutoffTime = new Date(Date.now() - maxAge * 60 * 60 * 1000);
      
      const recentLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime > cutoffTime;
      });

      localStorage.setItem('performanceLogs', JSON.stringify(recentLogs));
      
      const removedCount = logs.length - recentLogs.length;
      if (removedCount > 0) {

      }
    } catch (error) {
      console.warn('Failed to clear old local logs:', error);
    }
  }

  /**
   * Initialize performance monitoring
   */
  static initialize() {
    // Clear old logs on initialization
    this.clearOldLocalLogs();
    
    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.clearOldLocalLogs();
      }, 60 * 60 * 1000); // Every hour
    }


  }
}
