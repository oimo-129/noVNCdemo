/**
 * Assets同步工具
 * 用于从gzweb服务器同步模型资源到本地
 */

/**
 * Assets同步管理器 - 渲染进程版本
 */
export class AssetsSyncManager {
  constructor() {
    // 本地assets目录路径（相对于应用数据目录）
    this.localAssetsPath = null
    this.serverBaseUrl = null
    this.initializePaths()
  }

  /**
   * 初始化路径
   */
  async initializePaths() {
    // 通过IPC获取用户数据目录
    if (window.electronAPI) {
      try {
        const userDataPath = await window.electronAPI.getUserDataPath()
        this.localAssetsPath = `${userDataPath}/assets`
      } catch (error) {
        console.error('获取用户数据路径失败，使用默认路径:', error)
        this.localAssetsPath = './assets'
      }
    } else {
      // 非Electron环境，使用相对路径
      this.localAssetsPath = './assets'
    }
  }

  /**
   * 设置服务器地址
   * @param {string} serverUrl 服务器地址 (例如: "192.168.20.164:8080")
   */
  setServerUrl(serverUrl) {
    this.serverBaseUrl = `http://${serverUrl}`
  }

  /**
   * 确保本地assets目录存在
   */
  async ensureLocalAssetsDir() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.ensureDirectory(this.localAssetsPath)
      } catch (error) {
        console.error('创建assets目录失败:', error)
      }
    }
  }

  /**
   * 从服务器获取assets文件列表
   * @returns {Promise<Array>} 文件列表
   */
  async fetchServerAssetsList() {
    if (!this.serverBaseUrl) {
      throw new Error('服务器地址未设置')
    }

    const url = `${this.serverBaseUrl}/api/assets/list`
    
    if (window.electronAPI) {
      // 使用主进程代理请求
      const result = await window.electronAPI.httpRequest(url)
      
      if (!result.success) {
        throw new Error(`获取文件列表失败: ${result.error}`)
      }
      
      const data = result.data
      if (!data.success) {
        throw new Error(`服务器错误: ${data.error}`)
      }
      
      return data.files
    } else {
      // 非Electron环境，直接使用fetch
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(`获取文件列表失败: ${data.error}`)
      }
      
      return data.files
    }
  }

  /**
   * 获取本地文件列表和元数据
   * @returns {Promise<Map<string, Object>>} 文件路径到元数据的映射
   */
  async getLocalAssetsList() {
    if (!window.electronAPI) {
      return new Map() // 非Electron环境返回空Map
    }

    try {
      const localFiles = await window.electronAPI.getDirectoryFiles(this.localAssetsPath)
      const filesMap = new Map()
      
      for (const file of localFiles) {
        filesMap.set(file.path, file)
      }
      
      return filesMap
    } catch (error) {
      console.error('获取本地文件列表失败:', error)
      return new Map()
    }
  }

  /**
   * 比较服务器和本地文件，确定需要下载的文件
   * @param {Array} serverFiles 服务器文件列表
   * @returns {Promise<Array>} 需要下载的文件列表
   */
  async getFilesToDownload(serverFiles) {
    const localFiles = await this.getLocalAssetsList()
    const filesToDownload = []
    
    for (const serverFile of serverFiles) {
      const localFile = localFiles.get(serverFile.path)
      
      // 文件不存在或大小/修改时间不同
      if (!localFile || 
          localFile.size !== serverFile.size || 
          localFile.mtime < serverFile.mtime) {
        filesToDownload.push(serverFile)
      }
    }
    
    return filesToDownload
  }

  /**
   * 下载单个文件
   * @param {Object} fileInfo 文件信息
   * @returns {Promise} 下载Promise
   */
  async downloadFile(fileInfo) {
    const fileUrl = `${this.serverBaseUrl}/assets/${fileInfo.path}`
    
    if (window.electronAPI) {
      // 使用主进程代理下载
      const result = await window.electronAPI.downloadFile(fileUrl)
      
      if (!result.success) {
        throw new Error(`下载失败 ${fileInfo.path}: ${result.error}`)
      }
      
      // 通过IPC保存文件
      const localFilePath = `${this.localAssetsPath}/${fileInfo.path}`
      await window.electronAPI.saveFile(localFilePath, result.data, fileInfo.mtime)
    } else {
      // 非Electron环境，直接使用fetch
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`下载失败 ${fileInfo.path}: HTTP ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      // 非Electron环境暂时无法保存到本地文件系统
      console.warn('非Electron环境，无法保存文件到本地')
    }
    
    console.log(`✓ 已下载: ${fileInfo.path}`)
  }

  /**
   * 同步assets资源
   * @param {Function} progressCallback 进度回调函数 (downloaded, total) => void
   * @returns {Promise<Object>} 同步结果
   */
  async syncAssets(progressCallback) {
    console.log('🔄 开始同步assets资源...')
    
    // 确保路径已初始化
    if (!this.localAssetsPath) {
      await this.initializePaths()
    }
    
    await this.ensureLocalAssetsDir()
    
    try {
      // 获取服务器文件列表
      console.log('📋 正在获取服务器文件列表...')
      const serverFiles = await this.fetchServerAssetsList()
      console.log(`📋 服务器共有 ${serverFiles.length} 个文件`)
      
      // 确定需要下载的文件
      console.log('🔍 正在检查本地文件...')
      const filesToDownload = await this.getFilesToDownload(serverFiles)
      console.log(`📥 需要下载 ${filesToDownload.length} 个文件`)
      
      if (filesToDownload.length === 0) {
        console.log('✅ Assets已是最新，无需下载')
        return {
          success: true,
          downloaded: 0,
          total: serverFiles.length,
          message: 'Assets已是最新'
        }
      }
      
      // 下载文件
      let downloaded = 0
      for (const fileInfo of filesToDownload) {
        await this.downloadFile(fileInfo)
        downloaded++
        
        if (progressCallback) {
          progressCallback(downloaded, filesToDownload.length)
        }
      }
      
      console.log(`✅ Assets同步完成，已下载 ${downloaded} 个文件`)
      return {
        success: true,
        downloaded: downloaded,
        total: filesToDownload.length,
        localAssetsPath: this.localAssetsPath,
        message: `同步完成，已下载 ${downloaded} 个文件`
      }
      
    } catch (error) {
      console.error('❌ Assets同步失败:', error)
      return {
        success: false,
        error: error.message,
        message: `同步失败: ${error.message}`
      }
    }
  }

  /**
   * 获取本地assets路径，用于配置GZ3D
   * @returns {string} 本地assets绝对路径
   */
  getLocalAssetsPath() {
    return this.localAssetsPath
  }

  /**
   * 清理本地assets
   */
  async cleanLocalAssets() {
    if (window.electronAPI && this.localAssetsPath) {
      try {
        await window.electronAPI.removeDirectory(this.localAssetsPath)
        console.log('🗑️ 已清理本地assets')
      } catch (error) {
        console.error('清理assets失败:', error)
      }
    }
  }
}

// 创建单例实例
export const assetsSyncManager = new AssetsSyncManager()