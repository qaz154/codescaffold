import { describe, it, expect } from 'vitest';
import { startTimer, endTimer, getPerformanceStats } from './perf.js';

describe('Performance Utilities', () => {
  it('should measure timer duration', () => {
    startTimer('test');
    const duration = endTimer('test');
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(duration).toBeLessThan(1000);
  });

  it('should return 0 for non-existent timer', () => {
    const duration = endTimer('nonexistent');
    expect(duration).toBe(0);
  });

  it('should track completed timers', () => {
    startTimer('track');
    endTimer('track');
    const stats = getPerformanceStats();
    expect(stats['track']).toBeDefined();
    expect(stats['track']).toBeGreaterThanOrEqual(0);
  });

  it('should handle multiple timers', () => {
    startTimer('timer1');
    startTimer('timer2');
    endTimer('timer1');
    endTimer('timer2');
    const stats = getPerformanceStats();
    expect(Object.keys(stats).length).toBeGreaterThanOrEqual(2);
  });
});
