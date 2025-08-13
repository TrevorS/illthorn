import fs from "node:fs/promises";
import path from "node:path";
import { app, ipcMain as Backend, BrowserWindow } from "electron";
import { CONFIG } from "../../shared/config";
import { log } from "../logger";
import { AppMethods } from "./methods";

log("attaching app ipc handlers");

Backend.handle(AppMethods.SetTile, async (event, { title }: { title: string }) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
});

Backend.handle(AppMethods.LoadGameObjectXML, async (_event) => {
  try {
    const xmlPath = path.join(app.getAppPath(), CONFIG.data.xmlFiles.gameObjects);
    log(`Loading game object XML from: ${xmlPath}`);

    const xmlContent = await fs.readFile(xmlPath, "utf-8");
    log(`Loaded XML content: ${xmlContent.length} characters`);

    return {
      success: true,
      content: xmlContent,
      path: xmlPath,
    };
  } catch (error) {
    log(`Failed to load game object XML:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      content: null,
      path: null,
    };
  }
});
