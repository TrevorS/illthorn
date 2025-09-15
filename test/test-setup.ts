// Global test setup for all tests

// Mock ResizeObserver for virtualizer
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// The virtualizer looks for _ResizeObserver specifically
global.ResizeObserver = MockResizeObserver;
(global as typeof global & { _ResizeObserver: typeof ResizeObserver })._ResizeObserver = MockResizeObserver;
