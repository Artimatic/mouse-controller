const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDesktopSources: (opts) => ipcRenderer.invoke('get-desktop-sources', opts),
  getMacrosJson: () => ipcRenderer.invoke('get-macros-json'),
  loadMacrosJson: (opts) => ipcRenderer.invoke('load-macros-json', opts),
});

contextBridge.exposeInMainWorld('nutjs', {
  mouseMove:       (opts) => ipcRenderer.invoke('mouse-move', opts),
  mouseClick:      (opts) => ipcRenderer.invoke('mouse-click', opts),
  mouseDoubleClick:(opts) => ipcRenderer.invoke('mouse-double-click', opts),
  mouseScroll:     (opts) => ipcRenderer.invoke('mouse-scroll', opts),
  mouseDrag:       (opts) => ipcRenderer.invoke('mouse-drag', opts),
  keyboardType:    (opts) => ipcRenderer.invoke('keyboard-type', opts),
  keyboardKey:     (opts) => ipcRenderer.invoke('keyboard-key', opts),
  getMousePos:     ()     => ipcRenderer.invoke('get-mouse-position'),
  setMouseSpeed:   (opts) => ipcRenderer.invoke('set-mouse-speed', opts),
  runMacro:        (opts) => ipcRenderer.invoke('run-macro', opts),
  getScreenSize:   ()     => ipcRenderer.invoke('get-screen-size'),
});
