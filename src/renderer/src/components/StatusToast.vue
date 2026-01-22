<template>
  <transition name="toast">
    <div v-if="visible" class="status-toast" :class="type">
      <span class="icon">{{ icon }}</span>
      <span class="message">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info' // info, success, error, warning
  }
})

const icon = computed(() => {
  const icons = {
    info: 'ℹ',
    success: '✓',
    error: '✕',
    warning: '⚠'
  }
  return icons[props.type] || icons.info
})
</script>

<style lang="scss" scoped>
.status-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &.info {
    background: rgba(74, 158, 255, 0.9);
    color: #fff;
  }
  
  &.success {
    background: rgba(76, 175, 80, 0.9);
    color: #fff;
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.9);
    color: #fff;
  }
  
  &.warning {
    background: rgba(255, 152, 0, 0.9);
    color: #fff;
  }
  
  .icon {
    font-size: 16px;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
