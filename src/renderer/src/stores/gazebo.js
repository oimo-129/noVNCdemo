import { defineStore } from 'pinia'
import { ref, shallowRef, computed, watch } from 'vue'
import { assetsSyncManager } from '../utils/assetsSync.js'

export const useGazeboStore = defineStore('gazebo', () => {
  // 状态
  const wsUrl = ref('192.168.20.164:8080')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const statusMessage = ref('未连接')
  
  // Assets同步状态
  const isDownloadingAssets = ref(false)
  const downloadProgress = ref({ current: 0, total: 0 })
  const assetsDownloadMessage = ref('')

  // GZ3D 实例 - 使用 shallowRef 避免 Vue 深度代理 Three.js 对象
  const gzScene = shallowRef(null)
  const gzIface = shallowRef(null)
  const container = shallowRef(null)
  
  // 视图选项
  const showGrid = ref(true)
  const showCollisions = ref(false)
  
  // 监听 showGrid 变化，实时更新场景
  watch(showGrid, (newVal) => {
    if (gzScene.value?.grid) {
      gzScene.value.grid.visible = newVal
      console.log(`✓ 网格 ${newVal ? '显示' : '隐藏'}`)
    }
  })
  
  // 计算属性
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })

  // 设置容器
  function setContainer(el) {
    container.value = el
  }

  // 连接到 Gazebo
  async function connect(url) {
    if (!container.value) {
      console.error('场景容器未设置')
      return false
    }

    wsUrl.value = url || wsUrl.value
    isConnecting.value = true
    statusMessage.value = '准备连接...'

    try {
      // 🔄 第一步：同步Assets资源
      console.log('🔄 开始同步Assets资源...')
      statusMessage.value = '正在同步模型资源...'
      isDownloadingAssets.value = true
      
      // 配置资源同步管理器
      assetsSyncManager.setServerUrl(wsUrl.value)
      
      // 执行资源同步
      const syncResult = await assetsSyncManager.syncAssets((current, total) => {
        downloadProgress.value = { current, total }
        assetsDownloadMessage.value = `正在下载模型文件 ${current}/${total}`
      })
      
      isDownloadingAssets.value = false
      
      if (!syncResult.success) {
        throw new Error(`模型资源同步失败: ${syncResult.message}`)
      }
      
      console.log('✅ Assets同步完成:', syncResult.message)
      assetsDownloadMessage.value = syncResult.message
      
      // 🎮 第二步：初始化GZ3D
      statusMessage.value = '正在初始化3D场景...'
      console.log('正在创建 GZ3D.Scene...')
      gzScene.value = new GZ3D.Scene()
      
      // 🔧 配置GZ3D使用本地assets路径
      const localAssetsPath = assetsSyncManager.getLocalAssetsPath()
      if (gzScene.value.setAssetsPath) {
        gzScene.value.setAssetsPath(`file://${localAssetsPath}`)
        console.log('✓ 已配置本地Assets路径:', localAssetsPath)
      }
      
      // 添加到容器
      container.value.innerHTML = ''
      container.value.appendChild(gzScene.value.getDomElement())
      
      // 设置大小
      gzScene.value.setSize(window.innerWidth, window.innerHeight)
      
      // 默认显示网格
      if (gzScene.value.grid) {
        gzScene.value.grid.visible = showGrid.value
      }

      // 🔌 第三步：建立WebSocket连接
      statusMessage.value = '正在连接服务器...'
      console.log('正在连接到:', wsUrl.value)
      gzIface.value = new GZ3D.GZIface(gzScene.value, wsUrl.value)

      // 监听连接事件
      if (gzIface.value.emitter) {
        gzIface.value.emitter.on('connection', () => {
          console.log('✓ WebSocket 连接成功')
          isConnected.value = true
          isConnecting.value = false
          statusMessage.value = '已连接'
        })

        gzIface.value.emitter.on('connectionError', () => {
          console.error('✗ WebSocket 连接失败')
          isConnected.value = false
          isConnecting.value = false
          statusMessage.value = '连接失败'
        })
      }

      // 启动渲染循环
      startRenderLoop()
      
      return true
    } catch (error) {
      console.error('初始化失败:', error)
      isConnecting.value = false
      statusMessage.value = '初始化失败'
      return false
    }
  }

  // 断开连接
  function disconnect() {
    if (gzIface.value?.webSocket) {
      gzIface.value.webSocket.close()
    }
    
    if (container.value) {
      container.value.innerHTML = ''
    }
    
    gzScene.value = null
    gzIface.value = null
    isConnected.value = false
    isConnecting.value = false
    statusMessage.value = '未连接'
  }

  // 渲染循环
  let animationId = null
  function startRenderLoop() {
    function animate() {
      animationId = requestAnimationFrame(animate)
      if (gzScene.value) {
        gzScene.value.render()
      }
    }
    animate()
  }

  // 调整场景大小
  function resizeScene(width, height) {
    if (gzScene.value) {
      gzScene.value.setSize(width, height)
    }
  }

  // 重置视图
  function resetView() {
    if (gzScene.value) {
      gzScene.value.resetView()
      console.log('✓ 视图已重置')
    }
  }

  // 切换网格
  function toggleGrid() {
    if (gzScene.value?.grid) {
      showGrid.value = !showGrid.value
      gzScene.value.grid.visible = showGrid.value
      console.log(`✓ 网格 ${showGrid.value ? '显示' : '隐藏'}`)
    }
  }

  // 切换碰撞显示
  function toggleCollisions() {
    if (gzScene.value) {
      showCollisions.value = !showCollisions.value
      gzScene.value.showCollisions = showCollisions.value
      
      gzScene.value.scene.traverse((obj) => {
        if (obj.name?.indexOf('COLLISION_VISUAL') >= 0) {
          obj.visible = showCollisions.value
        }
      })
      console.log(`✓ 碰撞显示 ${showCollisions.value ? '开启' : '关闭'}`)
    }
  }

  // 发送世界控制命令
  function sendWorldControl(command) {
    if (gzIface.value && isConnected.value) {
      const request = {
        op: 'publish',
        topic: '~/world_control',
        msg: command
      }
      gzIface.value.request(JSON.stringify(request))
      console.log('✓ 命令已发送:', command)
    }
  }

  // 重置世界
  function resetWorld() {
    sendWorldControl({ reset: { all: true } })
  }

  // 重置模型位置
  function resetModelPoses() {
    sendWorldControl({ reset: { model_only: true } })
  }

  return {
    // 状态
    wsUrl,
    isConnected,
    isConnecting,
    statusMessage,
    connectionStatus,
    showGrid,
    showCollisions,
    gzScene,
    gzIface,
    
    // Assets同步状态
    isDownloadingAssets,
    downloadProgress,
    assetsDownloadMessage,
    
    // 方法
    setContainer,
    connect,
    disconnect,
    resizeScene,
    resetView,
    toggleGrid,
    toggleCollisions,
    resetWorld,
    resetModelPoses,
    
    // Assets管理方法
    cleanAssets: () => assetsSyncManager.cleanLocalAssets(),
    getAssetsPath: () => assetsSyncManager.getLocalAssetsPath()
  }
})