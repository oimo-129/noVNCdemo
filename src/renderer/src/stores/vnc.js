import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVncStore = defineStore('vnc', () => {
  // 连接配置
  const host = ref('192.168.20.164')
  const wsPort = ref('8000')  // FastAPI WebSocket 代理端口
  const password = ref('123456')
  
  // 连接状态
  const isConnected = ref(false)
  
  // 控制信号
  const shouldConnect = ref(false)
  const shouldDisconnect = ref(false)

  // 状态文本
  const statusMessage = computed(() => {
    return isConnected.value ? '已连接' : '未连接'
  })

  const connectionStatus = computed(() => {
    return isConnected.value ? 'connected' : 'disconnected'
  })

  // 设置连接状态
  function setConnected(value) {
    isConnected.value = value
  }

  // 触发连接
  function connect() {
    shouldConnect.value = true
  }

  // 触发断开
  function disconnect() {
    shouldDisconnect.value = true
    isConnected.value = false
  }

  return {
    // 配置
    host,
    wsPort,
    password,
    
    // 状态
    isConnected,
    statusMessage,
    connectionStatus,
    
    // 控制信号
    shouldConnect,
    shouldDisconnect,
    
    // 方法
    setConnected,
    connect,
    disconnect
  }
})
