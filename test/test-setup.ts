// Global test setup for all tests

// Mock ResizeObserver for virtualizer
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor() {}
}

// The virtualizer looks for _ResizeObserver specifically
global.ResizeObserver = MockResizeObserver;
(global as any)._ResizeObserver = MockResizeObserver;