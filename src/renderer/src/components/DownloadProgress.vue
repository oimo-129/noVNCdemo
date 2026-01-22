<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <div class="progress-info">
            <span class="status">{{ status }}</span>
            <span class="percentage">{{ Math.round(progress) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="current-file" v-if="currentFile">{{ currentFile }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '下载进度'
  },
  status: {
    type: String,
    default: '正在同步...'
  },
  progress: {
    type: Number,
    default: 0
  },
  currentFile: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.modal-body {
  padding: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  
  .status {
    color: #aaa;
  }
  
  .percentage {
    color: #4a9eff;
    font-weight: 600;
  }
}

.progress-bar {
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #6ab0ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.current-file {
  margin-top: 12px;
  font-size: 12px;
  color: #888;
  word-break: break-all;
}

// 动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .modal-content {
    transform: scale(0.9);
  }
}
</style>
