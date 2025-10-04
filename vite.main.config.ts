import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    ssr: true,
    emptyOutDir: true,
    sourcemap: true,
    outDir: '.vite/build',
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        // Electron runtime and electron-specific packages that can't be bundled
        'electron',
        'electron-squirrel-startup',
        'electron-store',
        // WebSocket library - has optional native bindings, keep external
        'ws',
      ],
    },
  },
});