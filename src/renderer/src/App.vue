<template>
  <div class="app">
    <!-- 主视图区域，演示双方案 -->
    <div class="main-view">
      <GzwebView v-show="currentView === 'gzweb'" />
      <div v-show="currentView === 'vnc'" class="vnc-dock">
        <VncView ref="vncViewRef" />
      </div>
    </div>
    
    <!-- 工具栏 -->
    <Toolbar 
      :current-view="currentView"
      @toggle-menu="isPanelOpen = !isPanelOpen" 
      @switch-view="switchView"
    />
    
    <!-- 左侧面板 -->
    <SidePanel :visible="isPanelOpen" :current-view="currentView" @close="isPanelOpen = false" />
    
    <!-- 状态提示 -->
    <StatusToast />
    
    <!-- 模型资源下载进度 -->
    <DownloadProgress
      :show="gazeboStore.isDownloadingAssets"
      :message="gazeboStore.assetsDownloadMessage"
      :progress="gazeboStore.downloadProgress"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGazeboStore } from './stores/gazebo'
import { useVncStore } from './stores/vnc'
import Toolbar from './components/Toolbar.vue'
import SidePanel from './components/SidePanel.vue'
import StatusToast from './components/StatusToast.vue'
import GzwebView from './views/GzwebView.vue'
import VncView from './views/VncView.vue'
import DownloadProgress from './components/DownloadProgress.vue'

const isPanelOpen = ref(true)
const currentView = ref('gzweb')  // 'gzweb' 或 'vnc'
const vncViewRef = ref(null)

const gazeboStore = useGazeboStore()
const vncStore = useVncStore()

function switchView(view) {
  currentView.value = view
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gazeboStore.disconnect()
  vncStore.disconnect()
})

function handleResize() {
  if (currentView.value === 'gzweb') {
    gazeboStore.resizeScene(window.innerWidth, window.innerHeight)
  }
}
</script>

<style lang="scss" scoped>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #2a2a2a;
}

.main-view {
  position: fixed;
  top: 50px; /* 工具栏高度 */
  left: 0;
  right: 0;
  bottom: 0;
}

.vnc-dock {
  position: absolute;
  top: 0;
  right: 5vw;
  bottom: 2vw;
  width: 70vw;
}
</style>