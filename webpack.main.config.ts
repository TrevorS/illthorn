
import type { Configuration } from 'webpack'
import { mainRules } from './webpack.rules'
import { copyPlugins } from "./webpack.plugins";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  target: 'electron-main',
  // Put your normal webpack config below here
  module: {
    rules: mainRules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  plugins: copyPlugins,
  node: {
    __dirname: false,
    __filename: false,
  },
};
