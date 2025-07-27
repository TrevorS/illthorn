import { ipcMain as Backend, BrowserWindow } from "electron";
import { log } from "../logger";
import { AppMethods } from "./methods";

log("attaching app ipc handlers");

Backend.handle(AppMethods.SetTile, async (event, { title }: { title: string }) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
});
