//主进程，窗口管理
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'

//添加vnc协议使用
import { startVncProxy, stopVncProxy } from './vnc-proxy'

// HTTP请求代理函数
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    const requestOptions = {
      timeout: 30000,
      ...options
    }
    
    const req = protocol.get(url, requestOptions, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
        return
      }
      
      const chunks = []
      
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      
      res.on('end', () => {
        const contentType = res.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
          try {
            const data = Buffer.concat(chunks).toString('utf8')
            resolve(JSON.parse(data))
          } catch (error) {
            reject(new Error(`JSON解析失败: ${error.message}`))
          }
        } else {
          // 返回二进制数据
          resolve(Buffer.concat(chunks))
        }
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('请求超时'))
    })
    
    req.on('error', (err) => {
      reject(err)
    })
  })
}

// IPC处理器 - HTTP请求代理
ipcMain.handle('http-request', async (event, url, options = {}) => {
  try {
    const result = await httpRequest(url, options)
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle('download-file', async (event, url) => {
  try {
    const buffer = await httpRequest(url)
    return {
      success: true,
      data: Array.from(buffer) // 转换为普通数组以便IPC传输
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

// IPC处理器 - 文件操作
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData')
})

ipcMain.handle('ensure-directory', async (event, dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
    return true
  } catch (error) {
    throw new Error(`创建目录失败: ${error.message}`)
  }
})

ipcMain.handle('get-directory-files', async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = []
    const scanDirectory = async (currentPath, basePath = currentPath) => {
      const items = await fs.promises.readdir(currentPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name)
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/')
        
        if (item.isDirectory()) {
          await scanDirectory(fullPath, basePath)
        } else if (item.isFile()) {
          const stats = await fs.promises.stat(fullPath)
          files.push({
            path: relativePath,
            size: stats.size,
            mtime: stats.mtime.getTime(),
            fullPath: fullPath
          })
        }
      }
    }
    
    await scanDirectory(dirPath)
    return files
  } catch (error) {
    throw new Error(`扫描目录失败: ${error.message}`)
  }
})

ipcMain.handle('save-file', async (event, filePath, data, mtime) => {
  try {
    // 确保目标目录存在
    const dir = path.dirname(filePath)
    await fs.promises.mkdir(dir, { recursive: true })
    
    // 写入文件
    await fs.promises.writeFile(filePath, Buffer.from(data))
    
    // 设置文件修改时间
    if (mtime) {
      await fs.promises.utimes(filePath, new Date(), new Date(mtime))
    }
    
    return true
  } catch (error) {
    throw new Error(`保存文件失败: ${error.message}`)
  }
})

ipcMain.handle('remove-directory', async (event, dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      await fs.promises.rm(dirPath, { recursive: true, force: true })
    }
    return true
  } catch (error) {
    throw new Error(`删除目录失败: ${error.message}`)
  }
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()



 // 启动 VNC 代理
  startVncProxy(8000, '192.168.20.164', 5900)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {

     // 停止 VNC 代理
    stopVncProxy()
    app.quit()
  }

 
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
