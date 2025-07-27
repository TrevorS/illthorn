import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    ssr: true,
    sourcemap: true,
    outDir: '.vite/build',
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
});