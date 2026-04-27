const { app, BrowserWindow, ipcMain, nativeTheme, Menu, globalShortcut } = require("electron");
const path = require("node:path");
const robot = require("robotjs");

Menu.setApplicationMenu(null);

let clickInterval = null;
let isClicking = false;
let currentCPS = 5;
let currentMouseButton = "left";

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    icon: path.join(__dirname, "assets/img/sinistcha.ico"),
    backgroundColor: "#2e2c29",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile("pages/index.html");
}

function startClicking() {
  stopClicking(); // prevents multiple intervals

  const delay = 1000 / currentCPS;

  clickInterval = setInterval(() => {
    robot.mouseClick(currentMouseButton);
  }, delay);

  isClicking = true;
  console.log(`Auto clicker ON (${currentCPS} CPS, ${currentMouseButton})`);
}

function stopClicking() {
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
  isClicking = false;
  console.log("Auto clicker OFF");
}

function toggleClicking() {
  if (isClicking) {
    stopClicking();
  } else {
    startClicking();
  }
}

ipcMain.on("start-clicking", (event, settings) => {
  currentCPS = Number(settings?.cps) || 5;
  currentMouseButton = settings?.mouseButton || "left";
  startClicking();
});

ipcMain.on("stop-clicking", () => {
  stopClicking();
});

ipcMain.handle("dark-mode:toggle", () => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? "light" : "dark";
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle("dark-mode:system", () => {
  nativeTheme.themeSource = "system";
});

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("F6", () => {
    toggleClicking();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});