import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 文件系统操作API
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  ensureDirectory: (dirPath) => ipcRenderer.invoke('ensure-directory', dirPath),
  getDirectoryFiles: (dirPath) => ipcRenderer.invoke('get-directory-files', dirPath),
  saveFile: (filePath, data, mtime) => ipcRenderer.invoke('save-file', filePath, data, mtime),
  removeDirectory: (dirPath) => ipcRenderer.invoke('remove-directory', dirPath),
  
  // HTTP请求代理API
  httpRequest: (url, options) => ipcRenderer.invoke('http-request', url, options),
  downloadFile: (url) => ipcRenderer.invoke('download-file', url)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.electronAPI = api
}
