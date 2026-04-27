const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startClicking: (settings) => ipcRenderer.send("start-clicking", settings),
  stopClicking: () => ipcRenderer.send("stop-clicking"),
});