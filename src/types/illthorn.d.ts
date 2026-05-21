declare namespace Illthorn {
  export type LichSessionDescriptor = { name: string; host: string; port: number };

  export namespace Session {
    interface Config {
      port: number;
      name: string;
    }

    interface Pojo {
      name: string;
      port: number;
    }
  }
}

// Module declarations for Vite asset imports
declare module "*.xml" {
  const value: string;
  export default value;
}

declare module "*.xml?raw" {
  const value: string;
  export default value;
}

declare module "electron-squirrel-startup" {
  const handled: boolean;
  export default handled;
}

declare module "*.scss";
declare module "*.css";
