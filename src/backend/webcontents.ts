import type { WebContents } from "electron";

let webContents: WebContents;
export function setWebContents(newWebContents: WebContents) {
  webContents = newWebContents;
}

export function useWebContents(): WebContents {
  if (!webContents) {
    throw new Error("WebContents not initialized. Call setWebContents() first.");
  }
  return webContents;
}
