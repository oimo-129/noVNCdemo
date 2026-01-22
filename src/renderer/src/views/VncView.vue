<template>
  <div class="vnc-view" tabindex="0" @click="handleContainerClick">
    <div ref="vncScreen" class="vnc-screen"></div>
    
    <!-- 连接状态覆盖层 -->
    <div v-if="status !== 'connected'" class="status-overlay">
      <div class="status-box">
        <div class="status-icon">
          <span v-if="status === 'connecting'" class="spinner"></span>
          <span v-else-if="status === 'failed'">❌</span>
          <span v-else>📺</span>
        </div>
        <p class="status-text">{{ statusText }}</p>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button 
          v-if="status === 'disconnected' || status === 'failed'" 
          class="reconnect-btn"
          @click="connect"
        >
          重新连接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVncStore } from '../stores/vnc'

const vncScreen = ref(null)
const vncStore = useVncStore()

// 动态导入 RFB
let RFB = null

const status = ref('disconnected')
const error = ref('')
let rfb = null

const statusText = computed(() => {
  switch (status.value) {
    case 'connecting': return '正在连接 VNC 服务器...'
    case 'connected': return '已连接'
    case 'disconnected': return '未连接'
    case 'failed': return '连接失败'
    default: return status.value
  }
})

const handleContainerClick = () => {
  if (rfb) {
    rfb.focus()
  }
}

const connect = async () => {
  if (rfb) {
    rfb.disconnect()
    rfb = null
  }

  // 动态导入 noVNC RFB (从 src/lib 目录加载 ESM 版本)
  if (!RFB) {
    try {
      const module = await import('../lib/core/rfb.js')
      RFB = module.default
    } catch (e) {
      console.error('加载 noVNC 失败:', e)
      status.value = 'failed'
      error.value = '加载 VNC 模块失败'
      return
    }
  }

  const wsUrl = `ws://${vncStore.host}:${vncStore.wsPort}`
  status.value = 'connecting'
  error.value = ''
  console.log(`VNC 正在连接到 ${wsUrl}...`)

  try {
    rfb = new RFB(vncScreen.value, wsUrl, {
      credentials: { password: vncStore.password },
      scaleViewport: true,
      resizeSession: false,
      focusOnClick: true,
      showDotCursor: true,
    })

    rfb.scaleViewport = true
    rfb.resizeSession = false
    rfb.clipViewport = false
    rfb.viewOnly = false
    rfb.focusOnClick = true

    rfb.addEventListener('connect', () => {
      status.value = 'connected'
      vncStore.setConnected(true)
      console.log('VNC 已连接')
      if (rfb) {
        rfb.focus()
      }
    })

    rfb.addEventListener('disconnect', (e) => {
      status.value = 'disconnected'
      vncStore.setConnected(false)
      console.log('VNC 已断开连接:', e.detail)
      if (!e.detail.clean) {
        error.value = '连接意外断开'
      }
    })

    rfb.addEventListener('securityfailure', (e) => {
      status.value = 'failed'
      vncStore.setConnected(false)
      error.value = `安全认证失败: ${e.detail.reason}`
      console.error('VNC 安全认证失败:', e.detail.reason)
    })
  } catch (e) {
    status.value = 'failed'
    error.value = e.message
    console.error('VNC 连接错误:', e)
  }
}

const disconnect = () => {
  if (rfb) {
    rfb.disconnect()
    rfb = null
  }
  status.value = 'disconnected'
  vncStore.setConnected(false)
}

// 暴露方法给父组件
defineExpose({
  connect,
  disconnect
})

// 监听 store 中的连接请求
watch(() => vncStore.shouldConnect, (val) => {
  if (val) {
    connect()
    vncStore.shouldConnect = false
  }
})

watch(() => vncStore.shouldDisconnect, (val) => {
  if (val) {
    disconnect()
    vncStore.shouldDisconnect = false
  }
})

onMounted(() => {
  // 自动连接（可选）
  // connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<style lang="scss" scoped>
.vnc-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
  outline: none;
  overflow: hidden;
}

.vnc-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  :deep(canvas) {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain;
    margin-left: auto;
  }
}

.status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.85);
}

.status-box {
  text-align: center;
  padding: 40px;
  background: rgba(42, 42, 42, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-text {
  color: #fff;
  font-size: 18px;
  margin: 0 0 10px 0;
}

.error-text {
  color: #e74c3c;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.reconnect-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
}
</style>
