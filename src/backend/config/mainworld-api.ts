// ABOUTME: Frontend-accessible API for config operations via IPC
import { ipcRenderer as IPC } from "electron";
import { type ConfigFileChangeEvent, ConfigMethods, type HighlightConfig, type MacroConfig } from "./methods";

export async function getConfigPath(): Promise<string> {
  return await IPC.invoke(ConfigMethods.GetPath);
}

export async function loadHighlights(): Promise<HighlightConfig> {
  return await IPC.invoke(ConfigMethods.LoadHighlights);
}

export async function loadMacros(): Promise<MacroConfig> {
  return await IPC.invoke(ConfigMethods.LoadMacros);
}

export async function saveHighlights(config: HighlightConfig): Promise<void> {
  return await IPC.invoke(ConfigMethods.SaveHighlights, config);
}

export async function saveMacros(config: MacroConfig): Promise<void> {
  return await IPC.invoke(ConfigMethods.SaveMacros, config);
}

export async function openInEditor(filename: string): Promise<void> {
  return await IPC.invoke(ConfigMethods.OpenInEditor, filename);
}

export async function openConfigDir(): Promise<void> {
  return await IPC.invoke(ConfigMethods.OpenConfigDir);
}

export async function startWatcher(): Promise<{ success: boolean }> {
  return await IPC.invoke(ConfigMethods.StartWatcher);
}

export async function stopWatcher(): Promise<{ success: boolean }> {
  return await IPC.invoke(ConfigMethods.StopWatcher);
}

export function onFileChange(listener: (event: ConfigFileChangeEvent) => void): void {
  IPC.on("config:file-changed", (_event, fileChangeEvent: ConfigFileChangeEvent) => {
    listener(fileChangeEvent);
  });
}

export function removeAllFileChangeListeners(): void {
  IPC.removeAllListeners("config:file-changed");
}
