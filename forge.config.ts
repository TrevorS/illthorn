import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';

const deb = new MakerDeb(
  { options: {icon: "./public/icons/app-icon.png", productName: "illthorn"}
  })
const rpm = new MakerRpm(
  { options: {icon: "./public/icons/app-icon.png"}
  })
const squirrel = new MakerSquirrel(
  { iconUrl: "https://raw.githubusercontent.com/elanthia-online/illthorn/electron-22/icons/app-icon.ico"
  , setupIcon: "./public/icons/app-icon.ico"
  })
const zip = new MakerZIP(
  {
  }, ['darwin'])

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [deb, rpm, squirrel, zip],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
