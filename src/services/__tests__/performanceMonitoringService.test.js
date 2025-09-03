/**
 * Tests for Performance Monitoring Service
 */

import PerformanceMonitoringService from '../performanceMonitoringService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    rpc: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock performance API
global.performance = {
  now: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn()
};

// Mock window
global.window = {
  performance: global.performance
};

describe('PerformanceMonitoringService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    performance.now.mockReturnValue(1000);
    localStorageMock.getItem.mockReturnValue('[]');
  });

  describe('startTracking', () => {
    test('should start performance tracking correctly', () => {
      const tracker = PerformanceMonitoringService.startTracking(
        PerformanceMonitoringService.OPERATION_TYPES.OCR_PROCESSING,
        { testContext: true }
      );

      expect(tracker.operationType).toBe(PerformanceMonitoringService.OPERATION_TYPES.OCR_PROCESSING);
      expect(tracker.startTime).toBe(1000);
      expect(tracker.context).toEqual({ testContext: true });
      expect(tracker.trackingId).toMatch(/^ocr_/);
      expect(typeof tracker.end).toBe('function');
      expect(typeof tracker.checkpoint).toBe('function');
    });

    test('should create unique tracking IDs', () => {
      const tracker1 = PerformanceMonitoringService.startTracking('test');
      const tracker2 = PerformanceMonitoringService.startTracking('test');

      expect(tracker1.trackingId).not.toBe(tracker2.trackingId);
    });
  });

  describe('endTracking', () => {
    test('should end tracking successfully', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2500);
      supabase.rpc.mockResolvedValue({ error: null });

      const trackingData = {
        trackingId: 'test-123',
        operationType: 'test',
        startTime: 1000,
        success: true,
        error: null,
        context: { test: true }
      };

      const result = await PerformanceMonitoringService.endTracking(trackingData);

      expect(result.duration).toBe(1500);
      expect(result.success).toBe(true);
      expect(result.operationType).toBe('test');
      expect(result.isSlowOperation).toBe(false);
      expect(supabase.rpc).toHaveBeenCalledWith('log_prescription_performance', expect.any(Object));
    });

    test('should handle database logging errors gracefully', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      supabase.rpc.mockRejectedValue(new Error('Database error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const trackingData = {
        trackingId: 'test-123',
        operationType: 'test',
        startTime: 1000,
        success: true,
        error: null,
        context: {}
      };

      const result = await PerformanceMonitoringService.endTracking(trackingData);

      expect(result.duration).toBe(1000);
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should identify slow operations', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(16000); // 15 seconds
      supabase.rpc.mockResolvedValue({ error: null });

      const trackingData = {
        trackingId: 'test-123',
        operationType: PerformanceMonitoringService.OPERATION_TYPES.OCR_PROCESSING,
        startTime: 1000,
        success: true,
        error: null,
        context: {}
      };

      const result = await PerformanceMonitoringService.endTracking(trackingData);

      expect(result.isSlowOperation).toBe(true);
    });
  });

  describe('tracker methods', () => {
    test('should create checkpoint correctly', () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

      const tracker = PerformanceMonitoringService.startTracking('test');
      const checkpoint = tracker.checkpoint('test-checkpoint', { step: 1 });

      expect(checkpoint.name).toBe('test-checkpoint');
      expect(checkpoint.duration).toBe(500);
      expect(checkpoint.context).toEqual({ step: 1 });
    });

    test('should end tracking via tracker method', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      supabase.rpc.mockResolvedValue({ error: null });

      const tracker = PerformanceMonitoringService.startTracking('test');
      const result = await tracker.end(true, null, { additional: 'context' });

      expect(result.success).toBe(true);
      expect(result.context.additional).toBe('context');
    });
  });

  describe('isSlowOperation', () => {
    test('should identify slow operations correctly', () => {
      expect(PerformanceMonitoringService.isSlowOperation('OCR', 15000)).toBe(true);
      expect(PerformanceMonitoringService.isSlowOperation('OCR', 5000)).toBe(false);
      expect(PerformanceMonitoringService.isSlowOperation('UNKNOWN', 6000)).toBe(true); // Uses default 5000ms
    });
  });

  describe('getPerformanceStats', () => {
    test('should retrieve performance stats from database', async () => {
      const mockStats = [
        {
          operation_type: 'ocr',
          total_operations: 100,
          success_rate: 95.5,
          avg_duration_ms: 2500
        }
      ];

      supabase.rpc.mockResolvedValue({ data: mockStats, error: null });

      const result = await PerformanceMonitoringService.getPerformanceStats('ocr', 24);

      expect(result).toEqual(mockStats);
      expect(supabase.rpc).toHaveBeenCalledWith('get_performance_stats', {
        operation_type_param: 'ocr',
        hours_back: 24
      });
    });

    test('should handle database errors', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: new Error('Database error') });

      const result = await PerformanceMonitoringService.getPerformanceStats();

      expect(result).toEqual([]);
    });
  });

  describe('getLocalPerformanceLogs', () => {
    test('should retrieve local performance logs', () => {
      const mockLogs = [
        { trackingId: 'test-1', duration: 1000 },
        { trackingId: 'test-2', duration: 2000 }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));

      const result = PerformanceMonitoringService.getLocalPerformanceLogs();

      expect(result).toEqual(mockLogs);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('performanceLogs');
    });

    test('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = PerformanceMonitoringService.getLocalPerformanceLogs();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('monitorPipeline', () => {
    test('should monitor successful pipeline execution', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      supabase.rpc.mockResolvedValue({ error: null });

      const mockPipeline = jest.fn().mockResolvedValue('success');
      const monitoredPipeline = PerformanceMonitoringService.monitorPipeline(mockPipeline, { test: true });

      const result = await monitoredPipeline('arg1', 'arg2');

      expect(result).toBe('success');
      expect(mockPipeline).toHaveBeenCalledWith('arg1', 'arg2');
      expect(supabase.rpc).toHaveBeenCalled();
    });

    test('should monitor failed pipeline execution', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      supabase.rpc.mockResolvedValue({ error: null });

      const error = new Error('Pipeline failed');
      const mockPipeline = jest.fn().mockRejectedValue(error);
      const monitoredPipeline = PerformanceMonitoringService.monitorPipeline(mockPipeline);

      await expect(monitoredPipeline()).rejects.toThrow('Pipeline failed');
      expect(supabase.rpc).toHaveBeenCalledWith('log_prescription_performance', 
        expect.objectContaining({ success_param: false })
      );
    });
  });

  describe('monitorDatabaseOperation', () => {
    test('should monitor successful database operation', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);
      supabase.rpc.mockResolvedValue({ error: null });

      const mockDbOp = jest.fn().mockResolvedValue({ data: [1, 2, 3], error: null });
      const monitoredOp = PerformanceMonitoringService.monitorDatabaseOperation(mockDbOp, 'test-query');

      const result = await monitoredOp('param1');

      expect(result).toEqual({ data: [1, 2, 3], error: null });
      expect(mockDbOp).toHaveBeenCalledWith('param1');
    });

    test('should monitor failed database operation', async () => {
      performance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);
      supabase.rpc.mockResolvedValue({ error: null });

      const error = new Error('Database error');
      const mockDbOp = jest.fn().mockRejectedValue(error);
      const monitoredOp = PerformanceMonitoringService.monitorDatabaseOperation(mockDbOp, 'test-query');

      await expect(monitoredOp()).rejects.toThrow('Database error');
    });
  });

  describe('createPerformanceAlert', () => {
    test('should create alert for slow operations', () => {
      const performanceResult = {
        operationType: 'OCR',
        duration: 20000,
        isSlowOperation: true,
        timestamp: '2024-01-01T00:00:00Z',
        context: { test: true }
      };

      const alert = PerformanceMonitoringService.createPerformanceAlert(performanceResult);

      expect(alert).toBeDefined();
      expect(alert.type).toBe('performance_alert');
      expect(alert.severity).toBe('high'); // 20000 / 10000 = 2x threshold
      expect(alert.operationType).toBe('OCR');
      expect(alert.duration).toBe(20000);
      expect(alert.exceedanceRatio).toBe(2);
    });

    test('should return null for fast operations', () => {
      const performanceResult = {
        operationType: 'OCR',
        duration: 5000,
        isSlowOperation: false
      };

      const alert = PerformanceMonitoringService.createPerformanceAlert(performanceResult);

      expect(alert).toBeNull();
    });

    test('should set medium severity for moderately slow operations', () => {
      const performanceResult = {
        operationType: 'OCR',
        duration: 15000,
        isSlowOperation: true,
        timestamp: '2024-01-01T00:00:00Z'
      };

      const alert = PerformanceMonitoringService.createPerformanceAlert(performanceResult);

      expect(alert.severity).toBe('medium'); // 15000 / 10000 = 1.5x threshold
    });
  });

  describe('getPerformanceSummary', () => {
    test('should generate performance summary', async () => {
      const mockDbStats = [
        { total_operations: 100, success_rate: 95.5 },
        { total_operations: 50, success_rate: 98.0 }
      ];

      const mockLocalLogs = [
        { 
          timestamp: new Date().toISOString(), 
          duration: 1000, 
          isSlowOperation: false, 
          success: true 
        },
        { 
          timestamp: new Date().toISOString(), 
          duration: 15000, 
          isSlowOperation: true, 
          success: true 
        },
        { 
          timestamp: new Date().toISOString(), 
          duration: 2000, 
          isSlowOperation: false, 
          success: false 
        }
      ];

      supabase.rpc.mockResolvedValue({ data: mockDbStats, error: null });
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLocalLogs));

      const summary = await PerformanceMonitoringService.getPerformanceSummary();

      expect(summary.database.totalOperations).toBe(150);
      expect(summary.database.averageSuccessRate).toBe(97); // Rounded average
      expect(summary.recent.totalOperations).toBe(3);
      expect(summary.recent.slowOperations).toBe(1);
      expect(summary.recent.failedOperations).toBe(1);
      expect(summary.alerts.length).toBe(1);
    });

    test('should handle errors gracefully', async () => {
      supabase.rpc.mockRejectedValue(new Error('Database error'));
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const summary = await PerformanceMonitoringService.getPerformanceSummary();

      expect(summary.database.totalOperations).toBe(0);
      expect(summary.recent.totalOperations).toBe(0);
      expect(summary.alerts).toEqual([]);
    });
  });

  describe('clearOldLocalLogs', () => {
    test('should clear old logs', () => {
      const now = new Date();
      const oldLog = { timestamp: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString() }; // 25 hours ago
      const recentLog = { timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() }; // 1 hour ago

      localStorageMock.getItem.mockReturnValue(JSON.stringify([oldLog, recentLog]));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      PerformanceMonitoringService.clearOldLocalLogs(24);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'performanceLogs',
        JSON.stringify([recentLog])
      );
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Cleaned up 1 old performance logs');

      consoleSpy.mockRestore();
    });

    test('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      PerformanceMonitoringService.clearOldLocalLogs();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear old local logs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('initialize', () => {
    test('should initialize performance monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      PerformanceMonitoringService.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('🔧 Performance monitoring initialized');

      consoleSpy.mockRestore();
    });
  });
});