import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/test-setup.ts'],
    include: ['test/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.vite', 'dist'],
    silent: false,
    hideSkippedTests: true,
    onConsoleLog(log, type) {
      // Suppress Lit dev mode warnings
      if (log.includes('Lit is in dev mode')) {
        return false;
      }
      // Allow other console logs
      return true;
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    target: 'ESNext',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },
});