// ABOUTME: Mainworld API for dev window operations exposed to renderer process
// ABOUTME: Type-safe wrapper around IPC calls for dev window functionality

import { ipcRenderer as IPC } from "electron";
import { DevWindowMethods } from "./methods";

export const devWindowApi = {
  /**
   * Open the dev window
   */
  async open(): Promise<{ success: boolean; windowId?: number; error?: string }> {
    return IPC.invoke(DevWindowMethods.Open);
  },

  /**
   * Close the dev window
   */
  async close(): Promise<{ success: boolean; error?: string }> {
    return IPC.invoke(DevWindowMethods.Close);
  },

  /**
   * Check if dev window is open
   */
  async isOpen(): Promise<{ isOpen: boolean }> {
    return IPC.invoke(DevWindowMethods.IsOpen);
  },

  /**
   * Send raw data to dev window
   */
  async sendRawData(data: string, sessionName: string): Promise<{ success: boolean; error?: string }> {
    return IPC.invoke(DevWindowMethods.SendRawData, { data, sessionName });
  },

  /**
   * Clear dev window log buffer
   */
  async clear(): Promise<{ success: boolean; error?: string }> {
    return IPC.invoke(DevWindowMethods.Clear);
  },
};
