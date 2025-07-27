import type { ModuleOptions } from 'webpack';

// Shared rules for both main and renderer processes
export const sharedRules: Required<ModuleOptions>['rules'] = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
];

// Rules specific to main process (where __dirname is available)
export const mainRules: Required<ModuleOptions>['rules'] = [
  ...sharedRules,
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
];

// Rules specific to renderer process (no __dirname available due to context isolation)
export const rendererRules: Required<ModuleOptions>['rules'] = [
  ...sharedRules,
  // Native modules handling for renderer (simplified, no asset relocator)
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
];

// Legacy export for backward compatibility
export const rules = mainRules;
