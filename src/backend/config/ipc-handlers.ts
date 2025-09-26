// ABOUTME: IPC handlers for config operations - connects frontend API calls to config manager
import { ipcMain as Backend, type BrowserWindow } from "electron";
import { log } from "../logger";
import { configManager } from "./config-manager";
import { type ConfigFileChangeEvent, ConfigMethods, type HighlightConfig, type MacroConfig } from "./methods";
import { configWatcher } from "./watcher";

log("attaching config ipc handlers");

Backend.handle(ConfigMethods.GetPath, async () => {
  try {
    return await configManager.getConfigPath();
  } catch (error) {
    log("error getting config path: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.LoadHighlights, async () => {
  try {
    return await configManager.loadHighlights();
  } catch (error) {
    log("error loading highlights: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.LoadMacros, async () => {
  try {
    return await configManager.loadMacros();
  } catch (error) {
    log("error loading macros: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.SaveHighlights, async (_e, config: HighlightConfig) => {
  try {
    await configManager.saveHighlights(config);
    log("highlights config saved successfully");
  } catch (error) {
    log("error saving highlights: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.SaveMacros, async (_e, config: MacroConfig) => {
  try {
    await configManager.saveMacros(config);
    log("macros config saved successfully");
  } catch (error) {
    log("error saving macros: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.OpenInEditor, async (_e, filename: string) => {
  try {
    await configManager.openInEditor(filename);
    log("opened config file in editor: %s", filename);
  } catch (error) {
    log("error opening config file in editor: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.OpenConfigDir, async () => {
  try {
    await configManager.openConfigDir();
    log("opened config directory");
  } catch (error) {
    log("error opening config directory: %s", error);
    throw error;
  }
});

// Store reference to main window for sending events
let mainWindow: BrowserWindow | null = null;

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window;
}

Backend.handle(ConfigMethods.StartWatcher, async () => {
  try {
    const configPath = await configManager.getConfigPath();

    // Set up file change listener to send events to frontend
    configWatcher.onFileChange((event: ConfigFileChangeEvent) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("config:file-changed", event);
        log("sent file change event to frontend: %s", event.filename);
      }
    });

    configWatcher.start(configPath);
    log("started config file watcher for: %s", configPath);
    return { success: true };
  } catch (error) {
    log("error starting config watcher: %s", error);
    throw error;
  }
});

Backend.handle(ConfigMethods.StopWatcher, async () => {
  try {
    configWatcher.stopAll();
    log("stopped config file watcher");
    return { success: true };
  } catch (error) {
    log("error stopping config watcher: %s", error);
    throw error;
  }
});
