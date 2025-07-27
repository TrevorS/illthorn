import path from "node:path";
import { app, BrowserWindow, screen, shell } from "electron";
import "./backend";
import { setWebContents } from "./backend/webcontents";

// Vite handles entry points differently than webpack - no magic constants needed

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = async (): Promise<void> => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: screen.getPrimaryDisplay().size.height,
    width: screen.getPrimaryDisplay().size.width,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  setWebContents(mainWindow.webContents);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // and load the index.html of the app.
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3001");
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, "../renderer/main_window/index.html"));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.setIcon(path.join(app.getAppPath(), "public", "icons", "app-icon.png"));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
