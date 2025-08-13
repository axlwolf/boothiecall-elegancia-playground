import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should be working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to global test utilities', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.waitForNextTick).toBeTypeOf('function');
    expect(global.testUtils.flushPromises).toBeTypeOf('function');
  });

  it('should have mocked browser APIs', () => {
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
    expect(global.fetch).toBeDefined();
    expect(window.localStorage).toBeDefined();
    expect(window.sessionStorage).toBeDefined();
  });

  it('should have canvas mocks', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeDefined();
    expect(ctx?.fillRect).toBeTypeOf('function');
    expect(canvas.toDataURL).toBeTypeOf('function');
  });
});
