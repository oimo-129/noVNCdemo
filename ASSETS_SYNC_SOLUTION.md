# Gazebo-Viewer 自动资源同步解决方案

## 📋 问题背景

在使用 gazebo-viewer Electron 应用连接到远程 gzweb 服务器时，存在以下问题：

1. **模型无法显示** - 小车显示正常，但障碍物（桌子、垃圾桶、邮箱等）不显示
2. **Invalid URL 错误** - gz3d.gui.js 在加载 Collada 模型文件时报错
3. **CSP 安全策略阻止** - Electron 应用的 Content Security Policy 阻止了 HTTP 请求

## 🔍 问题分析

### 根本原因

1. **gzweb 模型路径问题**
   - Gazebo 使用 `model://` 协议引用模型
   - gzweb 需要将模型 webify 到 `http/client/assets/` 目录
   - 本地 Gazebo 模型需要先复制到 gzweb 的 assets 目录

2. **Electron 环境下的协议问题**
   - `location.protocol` 在 Electron 中返回 `file:`
   - gz3d 构建 URL 时变成 `file://192.168.20.164:8080/...`，这是无效的

3. **CSP 安全策略限制**
   - 原始 CSP 只允许 `connect-src 'self' ws: wss:`
   - 不允许 HTTP/HTTPS 请求，导致模型文件无法加载

## 🛠️ 解决方案

### 1. 服务器端：添加 Assets API

**文件**: `/home/leju/zdc/gzweb/gzbridge/server.js`

添加了以下 API 端点：

```javascript
// API路由: 获取assets文件列表
GET /api/assets/list
// 返回: { success: true, timestamp: ..., files: [...] }

// API路由: 获取assets文件元数据
GET /api/assets/meta/{filePath}
// 返回: { success: true, path: ..., size: ..., mtime: ..., hash: ... }
```

**关键代码**：
```javascript
function getDirectoryFiles(dirPath, basePath = dirPath) {
  // 递归获取目录下所有文件的信息
  // 包含路径、大小、修改时间
}

function getAssetsList(req, res) {
  // 返回 assets 目录下所有文件列表
  const assetsPath = path.join(path.resolve(staticBasePath), 'assets');
  const files = getDirectoryFiles(assetsPath);
  res.end(JSON.stringify({ success: true, files: files }));
}
```

### 2. 客户端：创建资源同步管理器

**文件**: `/home/leju/gazebo-viewer/src/renderer/src/utils/assetsSync.js`

创建 `AssetsSyncManager` 类，功能包括：

- 从服务器获取文件列表
- 与本地文件对比，确定需要下载的文件
- 增量下载更新的文件
- 通过 Electron IPC 与主进程通信进行文件操作

```javascript
export class AssetsSyncManager {
  async syncAssets(progressCallback) {
    // 1. 获取服务器文件列表
    const serverFiles = await this.fetchServerAssetsList();
    
    // 2. 对比本地文件，确定需要下载的
    const filesToDownload = await this.getFilesToDownload(serverFiles);
    
    // 3. 下载文件
    for (const fileInfo of filesToDownload) {
      await this.downloadFile(fileInfo);
      progressCallback(downloaded, total);
    }
  }
}
```

### 3. 主进程：添加文件操作 IPC

**文件**: `/home/leju/gazebo-viewer/src/main/index.js`

添加 IPC 处理器：

```javascript
ipcMain.handle('get-user-data-path', () => app.getPath('userData'))
ipcMain.handle('ensure-directory', async (event, dirPath) => {...})
ipcMain.handle('get-directory-files', async (event, dirPath) => {...})
ipcMain.handle('save-file', async (event, filePath, data, mtime) => {...})
ipcMain.handle('remove-directory', async (event, dirPath) => {...})
```

### 4. Preload：暴露 API 给渲染进程

**文件**: `/home/leju/gazebo-viewer/src/preload/index.js`

```javascript
const api = {
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  ensureDirectory: (dirPath) => ipcRenderer.invoke('ensure-directory', dirPath),
  getDirectoryFiles: (dirPath) => ipcRenderer.invoke('get-directory-files', dirPath),
  saveFile: (filePath, data, mtime) => ipcRenderer.invoke('save-file', filePath, data, mtime),
  removeDirectory: (dirPath) => ipcRenderer.invoke('remove-directory', dirPath)
}
contextBridge.exposeInMainWorld('electronAPI', api)
```

### 5. 集成到连接流程

**文件**: `/home/leju/gazebo-viewer/src/renderer/src/stores/gazebo.js`

修改 `connect()` 函数，在建立 WebSocket 连接前先同步资源：

```javascript
async function connect(url) {
  // 🔄 第一步：同步Assets资源
  statusMessage.value = '正在同步模型资源...'
  assetsSyncManager.setServerUrl(wsUrl.value)
  const syncResult = await assetsSyncManager.syncAssets(progressCallback)
  
  // 🎮 第二步：初始化GZ3D
  gzScene.value = new GZ3D.Scene()
  
  // 🔌 第三步：建立WebSocket连接
  gzIface.value = new GZ3D.GZIface(gzScene.value, wsUrl.value)
}
```

### 6. 下载进度组件

**文件**: `/home/leju/gazebo-viewer/src/renderer/src/components/DownloadProgress.vue`

创建可视化的下载进度组件，显示同步状态和进度条。

### 7. 修复 gz3d 协议问题

**文件**: `/home/leju/gazebo-viewer/src/renderer/public/lib/gz3d.gui.js`

修复 Electron 环境下的协议问题：

```javascript
// 原代码
this.protocol = location.protocol;

// 修复后
this.protocol = (location.protocol === 'file:') ? 'http:' : location.protocol;
```

### 8. 修复 CSP 安全策略

**文件**: `/home/leju/gazebo-viewer/src/renderer/index.html`

更新 CSP 策略，允许 HTTP/HTTPS 连接：

```html
<!-- 原策略 -->
<meta http-equiv="Content-Security-Policy"
  content="... connect-src 'self' ws: wss:;" />

<!-- 修复后 -->
<meta http-equiv="Content-Security-Policy"
  content="... img-src 'self' data: http: https:; connect-src 'self' ws: wss: http: https:;" />
```

## 📁 修改的文件清单

| 文件路径 | 修改类型 | 描述 |
|---------|---------|------|
| `gzweb/gzbridge/server.js` | 修改 | 添加 assets API 端点 |
| `gazebo-viewer/src/main/index.js` | 修改 | 添加文件操作 IPC 处理器 |
| `gazebo-viewer/src/preload/index.js` | 修改 | 暴露文件操作 API |
| `gazebo-viewer/src/renderer/src/utils/assetsSync.js` | 新建 | Assets 同步管理器 |
| `gazebo-viewer/src/renderer/src/stores/gazebo.js` | 修改 | 集成资源同步到连接流程 |
| `gazebo-viewer/src/renderer/src/components/DownloadProgress.vue` | 新建 | 下载进度组件 |
| `gazebo-viewer/src/renderer/src/App.vue` | 修改 | 添加下载进度组件 |
| `gazebo-viewer/src/renderer/public/lib/gz3d.gui.js` | 修改 | 修复协议问题 |
| `gazebo-viewer/src/renderer/index.html` | 修改 | 修复 CSP 策略 |

## 🔄 工作流程

```
┌─────────────────┐
│  用户点击连接    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 同步Assets资源   │◄──── 调用 /api/assets/list
│ (增量下载)       │      对比本地文件
└────────┬────────┘      下载缺失/更新的文件
         │
         ▼
┌─────────────────┐
│ 创建 GZ3D.Scene │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 建立 WebSocket  │
│ 连接到 gzweb    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 加载模型        │◄──── 从服务器 HTTP 获取
│ (使用 http://)  │      .dae/.obj/.stl 文件
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 渲染 3D 场景    │
└─────────────────┘
```

## 📝 使用说明

### 启动服务

1. **启动 Gazebo 仿真**:
   ```bash
   ros2 launch car gazebo.launch.py
   ```

2. **启动 gzweb 服务器**:
   ```bash
   cd /home/leju/zdc/gzweb && npm start
   # 或后台运行
   nohup npm start > /tmp/gzweb.log 2>&1 &
   ```

3. **启动 gazebo-viewer**:
   ```bash
   cd /home/leju/gazebo-viewer && npm start
   ```

### 连接

1. 输入服务器地址（如 `192.168.20.164:8080`）
2. 点击连接
3. 等待资源同步完成
4. 查看 3D 场景

## ⚠️ 注意事项

1. **首次连接** 会下载所有模型资源，可能需要一些时间
2. **后续连接** 只会下载更新的文件（增量同步）
3. 确保 gzweb 服务器已启动且 `GAZEBO_MODEL_PATH` 环境变量正确设置
4. 本地模型需要先运行 `get_local_models.py` 复制到 gzweb assets 目录

## 🚀 后续优化建议

1. 添加模型缓存版本管理
2. 支持并行下载提高速度
3. 添加下载失败重试机制
4. 支持压缩传输减少带宽
5. 添加模型预加载功能
