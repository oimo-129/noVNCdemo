<template>
  <div class="gzweb-view">
    <!-- canvas挂载位置 -->
    <div id="scene-container" ref="sceneContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGazeboStore } from '../stores/gazebo'

const sceneContainer = ref(null)
const gazeboStore = useGazeboStore()

onMounted(() => {
  //canvas插入容器
  gazeboStore.setContainer(sceneContainer.value)
  //3D场景自适应窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gazeboStore.disconnect()
})
//主界面的场景自适应功能
function handleResize() {
  gazeboStore.resizeScene(window.innerWidth, window.innerHeight)
}
</script>

<style lang="scss" scoped>
.gzweb-view {
  width: 100%;
  height: 100%;
  position: relative;
}

#scene-container {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  // 穿透样式，确保canvas充满容器
  :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
}
</style>
