// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  sendAuth: (auth) => ipcRenderer.send("authentication", auth),
});

contextBridge.exposeInMainWorld("apiPowerOff", {
  sendConfirmationPower: (pw) => ipcRenderer.send("poweroff", pw)
})

contextBridge.exposeInMainWorld('apiValidateLogin', {
  onLoginResult: (callback) => ipcRenderer.on('login-result', callback)
});