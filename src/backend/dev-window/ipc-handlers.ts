// ABOUTME: IPC handlers for dev window operations
// ABOUTME: Handles communication between main process and renderer for dev panel

import { ipcMain as Backend } from "electron";
import { log } from "../logger";
import { useWebContents } from "../webcontents";
import { clearDevWindow, closeDevWindow, createDevWindow, isDevWindowOpen, sendRawDataToDevWindow, toggleDevWindowPin } from "./index";
import { DevWindowMethods } from "./methods";

log("attaching dev window ipc handlers");

/**
 * Open dev window
 */
Backend.handle(DevWindowMethods.Open, async () => {
  try {
    const window = createDevWindow();
    return { success: true, windowId: window.id };
  } catch (error) {
    log("Failed to open dev window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

/**
 * Close dev window
 */
Backend.handle(DevWindowMethods.Close, async () => {
  try {
    closeDevWindow();
    return { success: true };
  } catch (error) {
    log("Failed to close dev window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

/**
 * Check if dev window is open
 */
Backend.handle(DevWindowMethods.IsOpen, async () => {
  return { isOpen: isDevWindowOpen() };
});

/**
 * Send raw data to dev window
 */
Backend.handle(DevWindowMethods.SendRawData, async (event, { data, sessionName }: { data: string; sessionName: string }) => {
  try {
    log(`Attempting to send raw data to dev window: ${data.length} chars from ${sessionName}`);
    if (isDevWindowOpen()) {
      sendRawDataToDevWindow(data, sessionName);
      log("Successfully sent raw data to dev window");
      return { success: true };
    } else {
      log("Dev window not open, cannot send data");
      return { success: false, error: "Dev window not open" };
    }
  } catch (error) {
    log("Failed to send raw data to dev window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

/**
 * Clear dev window log buffer
 */
Backend.handle(DevWindowMethods.Clear, async () => {
  try {
    clearDevWindow();
    return { success: true };
  } catch (error) {
    log("Failed to clear dev window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

/**
 * Toggle dev window pin to top state
 */
Backend.handle(DevWindowMethods.TogglePin, async () => {
  try {
    const result = toggleDevWindowPin();
    return { success: true, isPinned: result.isPinned };
  } catch (error) {
    log("Failed to toggle dev window pin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

/**
 * Send command to main window (for UI feedback)
 */
Backend.handle("DevWindow.SendToMainWindow", async (event, command: string) => {
  try {
    const mainWebContents = useWebContents();
    // Send the command to the main window to trigger UI feedback
    mainWebContents.executeJavaScript(`
      if (window.Illthorn && window.Illthorn.handleCommand) {
        window.Illthorn.handleCommand("${command}");
      }
    `);
    return { success: true };
  } catch (error) {
    log("Failed to send command to main window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
