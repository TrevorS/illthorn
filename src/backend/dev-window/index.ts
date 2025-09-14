// ABOUTME: Dev window management for raw game log debugging
// ABOUTME: Handles creation, lifecycle, and IPC communication for the developer panel window

import path from "node:path";
import { BrowserWindow, screen } from "electron";
import { log } from "../logger";
import { useWebContents } from "../webcontents";

let devWindow: BrowserWindow | null = null;
let isPinned = false;

/**
 * Create and show the dev window
 */
export function createDevWindow(): BrowserWindow {
  if (devWindow && !devWindow.isDestroyed()) {
    devWindow.focus();
    return devWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // In development, the preload script is in a different location
  const preloadPath = process.env.NODE_ENV === "development" ? path.join(process.cwd(), ".vite/build/preload.js") : path.join(__dirname, "../preload.js");

  devWindow = new BrowserWindow({
    width: 600,
    height: 800,
    x: width - 620, // Position to the right of screen with margin
    y: Math.max(0, (height - 800) / 2), // Center vertically
    title: "Illthorn Dev Panel - Raw Game Logs",
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
    },
    show: false, // Don't show until ready
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
  });

  // Load the dev window page
  if (process.env.NODE_ENV === "development") {
    devWindow.loadURL("http://localhost:3001/dev-panel.html");
  } else {
    devWindow.loadFile(path.join(__dirname, "../renderer/dev-panel.html"));
  }

  // Show window when ready to prevent flash
  devWindow.once("ready-to-show", () => {
    devWindow?.show();
    log("Dev window created and shown");
  });

  // Clean up reference when window is closed
  devWindow.on("closed", () => {
    devWindow = null;
    log("Dev window closed and cleaned up");

    // Notify main window to show consistent UI feedback
    try {
      const mainWebContents = useWebContents();
      if (mainWebContents) {
        mainWebContents.executeJavaScript(`
          if (window.Illthorn && window.Illthorn.currentSession) {
            const currentSess = window.Illthorn.currentSession();
            if (currentSess && currentSess.bus) {
              currentSess.bus.dispatchEvent('IllthornEvent.CLIENT_MESSAGE', {
                message: 'Dev window closed',
                timestamp: Date.now(),
              });
            }
          }
        `);
      }
    } catch (error) {
      log("Failed to send close notification to main window:", error);
    }
  });

  // Handle external links
  devWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  log("Dev window created");
  return devWindow;
}

/**
 * Close the dev window if it exists
 */
export function closeDevWindow(): void {
  if (devWindow && !devWindow.isDestroyed()) {
    devWindow.close();
    devWindow = null;
    log("Dev window closed");
  }
}

/**
 * Check if dev window is open and ready
 */
export function isDevWindowOpen(): boolean {
  return devWindow !== null && !devWindow.isDestroyed() && !!devWindow.webContents;
}

/**
 * Send raw game data to dev window
 */
export function sendRawDataToDevWindow(data: string, sessionName: string): void {
  log(`sendRawDataToDevWindow called: isOpen=${isDevWindowOpen()}, data length=${data.length}`);
  if (isDevWindowOpen()) {
    const payload = {
      data,
      sessionName,
      timestamp: new Date().toISOString(),
    };
    log(`Sending payload to dev window:`, payload);
    devWindow?.webContents.send("dev-window:raw-data", payload);
    log("WebContents.send called successfully");
  } else {
    log("Dev window not open in sendRawDataToDevWindow");
  }
}

/**
 * Clear the dev window log buffer
 */
export function clearDevWindow(): void {
  if (isDevWindowOpen()) {
    devWindow?.webContents.send("dev-window:clear");
    log("Dev window cleared");
  }
}

/**
 * Toggle the always-on-top state of the dev window
 */
export function toggleDevWindowPin(): { isPinned: boolean } {
  if (isDevWindowOpen()) {
    isPinned = !isPinned;
    devWindow?.setAlwaysOnTop(isPinned);
    log(`Dev window pin toggled: ${isPinned ? "pinned" : "unpinned"}`);
  }
  return { isPinned };
}

/**
 * Get the dev window instance (for advanced operations)
 */
export function getDevWindow(): BrowserWindow | null {
  return devWindow;
}
