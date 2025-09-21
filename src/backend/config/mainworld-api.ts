// ABOUTME: Frontend-accessible API for config operations via IPC
import { ipcRenderer as IPC } from "electron";
import { ConfigMethods, type HighlightConfig, type MacroConfig } from "./methods";

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
