import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, 'src/frontend'),
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Enable absolute imports from src
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any global SCSS variables or mixins here
        additionalData: ``, // Can add global SCSS imports if needed
      },
    },
  },
  server: {
    port: 3001, // Match the webpack dev server port
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