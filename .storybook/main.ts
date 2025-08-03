import type { StorybookConfig } from '@storybook/web-components-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/frontend/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    
    // Reuse your existing Vite renderer configuration
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
        dedupe: ['lit', 'lit-html', 'lit-element'], // Dedupe Lit versions
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: ``, // Match your existing SCSS setup
          },
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
      optimizeDeps: {
        include: ['lit', 'lit/decorators.js', 'lit-html', 'lit-element'], // Ensure Lit is pre-bundled
        exclude: [], // Don't exclude any deps from optimization
        force: true, // Force re-optimization to pick up our dedupe settings
      },
      build: {
        rollupOptions: {
          external: [], // Don't externalize anything, bundle everything
        },
      },
    });
  },
};

export default config;