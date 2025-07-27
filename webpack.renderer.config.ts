import type { Configuration } from 'webpack';

import { rendererRules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rendererRules.push({
  test: /\.css$/,
  use: [ {loader: 'style-loader'}
       , {loader: 'css-loader'}
       , 
       ],
});

rendererRules.push({
  test: /\.s[ac]ss$/i,
  use: [
    // Creates `style` nodes from JS strings
    "style-loader",
    // Translates CSS into CommonJS
    "css-loader",
    // Compiles Sass to CSS
    {
      loader: "sass-loader",
      options: {
        api: "modern", // Use the modern Sass API (modern-compiler requires sass-loader >=14.2.0)
        sassOptions: {
          // Add any Sass options here if needed
        },
      },
    },
  ],
})

export const rendererConfig: Configuration = {
  module: {
    rules: rendererRules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
