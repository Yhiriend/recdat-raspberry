// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  sendAuth: (auth) => ipcRenderer.send("authentication", auth),
});

contextBridge.exposeInMainWorld("apiPowerOff", {
  sendConfirmationPower: (pw) => ipcRenderer.send("poweroff", pw)
});

contextBridge.exposeInMainWorld('apiValidateLogin', {
  onLoginResult: (callback) => ipcRenderer.on('login-result', callback)
});

contextBridge.exposeInMainWorld("apiSaveToDatabase", {
  catchResultScanned: (qrsc) => ipcRenderer.send('assistance', qrsc),
  onAssistanceReply: (callback) => ipcRenderer.on('assistance-reply', callback)
});

contextBridge.exposeInMainWorld("apiSendEventSync", {
  sendConfirmationSyncronization: (scs) => ipcRenderer.send('confim', scs),
  onAssistanceReplySync: (callback) => ipcRenderer.on('reply-fedd-sync', callback)
});

contextBridge.exposeInMainWorld("apiChangerColor", {
  receiveNewColor: (callback) => ipcRenderer.on('newcolor', callback)
});

contextBridge.exposeInMainWorld('wifiAPI', {
  listNetworks: () => ipcRenderer.invoke('list-wifi-networks'),
  connect: (ssid, password) => ipcRenderer.invoke('connect-wifi', ssid, password)
});

ipcRenderer.on('change-color', (event, color) => {
  console.log('color recibido: ', color);
  document.getElementById('circle').style.backgroundColor = color;
  document.getElementById('elnuevocheck').style.borderColor = color;
});

contextBridge.exposeInMainWorld("apiSaveToDatabasManual", {
  catchResultManual: (data) => ipcRenderer.send('assistancemanual', data),
  onAssistanceReplyManual: (callback) => ipcRenderer.on('assistance-manual-reply', callback)
});

contextBridge.exposeInMainWorld("apiSendSetQuestion", {
  sendEmailForQuestion: (mail) => ipcRenderer.send('setquestion', mail),
  onEmailForQuestionReply: (callback) => {
    ipcRenderer.on('thisIsTheQuestion', (event, ...args) => callback(event, ...args));
  }
});

contextBridge.exposeInMainWorld('apiLaunchKeyBoard', {
  launchKeyboard: (m) => {
    console.log("Enviando mensaje al proceso principal:", m);
    ipcRenderer.send('launch-keyboard', m);
  }
});
