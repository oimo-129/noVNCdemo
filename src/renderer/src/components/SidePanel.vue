<template>
  <transition name="slide">
    <div v-if="visible" class="side-panel">
      <div class="panel-header">
        <h2>{{ menuTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="panel-content">
        <!-- GZWeb 设置 -->
        <template v-if="currentView === 'gzweb'">
          <div class="menu-section">
            <h3>GZWeb 连接</h3>
            <div class="form-group">
              <label>WebSocket URL</label>
              <input 
                v-model="gazeboStore.wsUrl" 
                type="text" 
                placeholder="如: 192.168.20.164:8080"
                :disabled="gazeboStore.isConnected"
              />
            </div>
            <div class="button-group">
              <button 
                class="btn"
                :class="gazeboStore.isConnected ? 'btn-danger' : 'btn-primary'"
                @click="toggleGazeboConnection"
              >
                {{ gazeboStore.isConnected ? '断开' : '连接' }}
              </button>
            </div>
          </div>
          
          <div class="menu-section">
            <h3>显示设置</h3>
            <div class="toggle-item">
              <span>显示网格</span>
              <label class="switch">
                <input type="checkbox" v-model="gazeboStore.showGrid" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="menu-section" v-if="gazeboStore.isConnected">
            <h3>场景信息</h3>
            <div class="info-item">
              <span class="label">模型数量:</span>
              <span class="value">{{ gazeboStore.modelCount }}</span>
            </div>
            <div class="info-item">
              <span class="label">FPS:</span>
              <span class="value">{{ gazeboStore.fps }}</span>
            </div>
          </div>
        </template>
        
        <!-- VNC 设置 -->
        <template v-else>
          <div class="menu-section">
            <h3>VNC 连接</h3>
            <div class="form-group">
              <label>VNC 服务器</label>
              <input 
                v-model="vncHost" 
                type="text" 
                placeholder="如: 192.168.20.164"
              />
            </div>
            <div class="form-group">
              <label>端口</label>
              <input 
                v-model="vncPort" 
                type="text" 
                placeholder="5900"
              />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input 
                v-model="vncPassword" 
                type="password" 
                placeholder="VNC 密码"
              />
            </div>
          </div>
          
          <!-- <div class="menu-section">
            <h3>显示设置</h3>
            <div class="toggle-item">
              <span>自适应缩放</span>
              <label class="switch">
                <input type="checkbox" v-model="vncScaling" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-item">
              <span>高质量模式</span>
              <label class="switch">
                <input type="checkbox" v-model="vncQuality" />
                <span class="slider"></span>
              </label>
            </div>
          </div> -->
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGazeboStore } from '../stores/gazebo'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentView: {
    type: String,
    default: 'gzweb'
  }
})

defineEmits(['close'])

const gazeboStore = useGazeboStore()

// VNC 设置
const vncHost = ref('192.168.20.164')
const vncPort = ref('5900')
const vncPassword = ref('')
const vncScaling = ref(true)
const vncQuality = ref(false)

const menuTitle = computed(() => 
  props.currentView === 'gzweb' ? 'GZWeb 设置' : 'VNC 设置'
)

function toggleGazeboConnection() {
  if (gazeboStore.isConnected) {
    gazeboStore.disconnect()
  } else {
    gazeboStore.connect()
  }
}
</script>

<style lang="scss" scoped>
.side-panel {
  position: fixed;
  top: 50px;
  left: 0;
  width: 300px;
  height: calc(100vh - 50px);
  background: #2a2a2a;
  border-right: 1px solid #3a3a3a;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.close-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  
  &:hover {
    color: #fff;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.menu-section {
  margin-bottom: 24px;
  
  h3 {
    font-size: 14px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }
}

.form-group {
  margin-bottom: 12px;
  
  label {
    display: block;
    font-size: 14px;
    color: #aaa;
    margin-bottom: 6px;
  }
  
  input {
    width: 100%;
    padding: 10px 12px;
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: #fff;
    font-size: 15px;
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &::placeholder {
      color: #666;
    }
  }
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.btn-primary {
    background: #4a9eff;
    color: #fff;
    
    &:hover {
      background: #3a8eef;
    }
  }
  
  &.btn-danger {
    background: #f44336;
    color: #fff;
    
    &:hover {
      background: #e43326;
    }
  }
  
  &.btn-secondary {
    background: #3a3a3a;
    color: #fff;
    
    &:hover {
      background: #4a4a4a;
    }
  }
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  
  span {
    font-size: 15px;
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #3a3a3a;
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + .slider {
    background-color: #4a9eff;
  }
  
  input:checked + .slider:before {
    transform: translateX(20px);
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 15px;
  
  .label {
    color: #888;
  }
  
  .value {
    color: #fff;
    font-weight: 500;
  }
}

// 动画
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
