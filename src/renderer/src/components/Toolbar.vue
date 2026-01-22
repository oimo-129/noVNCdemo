<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="menu-btn" @click="$emit('toggle-menu')">
        <span class="icon">☰</span>
      </button>
      <span class="app-title">Gazebo Viewer</span>
    </div>
    
    <div class="toolbar-center">
      <div class="view-switch">
        <button 
          class="view-btn" 
          :class="{ active: currentView === 'gzweb' }"
          @click="$emit('switch-view', 'gzweb')"
        >
          GZWeb 3D渲染Gazebo
        </button>
        <button 
          class="view-btn" 
          :class="{ active: currentView === 'vnc' }"
          @click="$emit('switch-view', 'vnc')"
        >
          VNC 远程劫持Rviz2
        </button>
      </div>
    </div>
    
    <!-- <div class="toolbar-right">
      <button class="tool-btn" @click="$emit('fullscreen')" title="全屏">
        <span class="icon">⛶</span>
      </button>
      <button class="tool-btn" @click="$emit('refresh')" title="刷新">
        <span class="icon">↻</span>
      </button>
      <div class="status-indicator" :class="statusClass">
        {{ statusText }}
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGazeboStore } from '../stores/gazebo'

defineProps({
  currentView: {
    type: String,
    default: 'gzweb'
  }
})

defineEmits(['toggle-menu', 'switch-view', 'fullscreen', 'refresh'])

const gazeboStore = useGazeboStore()

const statusClass = computed(() => ({
  connected: gazeboStore.isConnected,
  disconnected: !gazeboStore.isConnected
}))

const statusText = computed(() => 
  gazeboStore.isConnected ? '已连接' : '未连接'
)
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-bottom: 1px solid #1a1a1a;
  user-select: none;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.toolbar-center {
  display: flex;
  align-items: center;
}

.view-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 3px;
}

.view-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
  
  &:hover {
    color: #fff;
  }
  
  &.active {
    background: #4a9eff;
    color: #fff;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .icon {
    font-size: 14px;
  }
}

.status-indicator {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.connected {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  &.disconnected {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
}
</style>
