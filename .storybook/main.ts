import type { StorybookConfig } from '@storybook/web-components-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/frontend/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
  ],
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
    });
  },
};

export default config;