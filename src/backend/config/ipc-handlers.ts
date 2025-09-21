// ABOUTME: IPC handlers for config operations - connects frontend API calls to config manager
import { ipcMain as Backend } from "electron";
import { log } from "../logger";
import { configManager } from "./config-manager";
import { ConfigMethods, type HighlightConfig, type MacroConfig } from "./methods";

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
