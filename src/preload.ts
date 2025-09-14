// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import * as AppAPI from "./backend/app/mainworld-api";
import { devWindowApi } from "./backend/dev-window/mainworld-api";
import * as SessionAPI from "./backend/session/mainworld-api";
import * as SettingsAPI from "./backend/settings/mainworld-api";

contextBridge.exposeInMainWorld("Session", SessionAPI);
contextBridge.exposeInMainWorld("App", AppAPI);
contextBridge.exposeInMainWorld("Settings", SettingsAPI);
contextBridge.exposeInMainWorld("DevWindow", devWindowApi);

// Expose ipcRenderer for dev window direct communication
contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke: ipcRenderer.invoke.bind(ipcRenderer),
  on: ipcRenderer.on.bind(ipcRenderer),
  removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
});

// Expose relevant environment variables to renderer process
contextBridge.exposeInMainWorld("process", {
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
});
