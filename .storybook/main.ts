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
      define: {
        'process.env.SHOELACE_BASE_PATH': JSON.stringify('/node_modules/@shoelace-style/shoelace/dist/'),
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
        include: ['lit', 'lit/decorators.js'], // Ensure Lit is pre-bundled
      },
    });
  },
};

export default config;