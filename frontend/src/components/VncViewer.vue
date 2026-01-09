<template>
  <div class="vnc-container">
    <div ref="vncScreen" class="vnc-screen"></div>
    <div v-if="status !== 'connected'" class="status-overlay">
      <div class="status-box">
        <p>状态: {{ status }}</p>
        <p v-if="error">错误: {{ error }}</p>
        <button v-if="status === 'disconnected' || status === 'failed'" @click="connect">重新连接</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import RFB from '@novnc/novnc/lib/rfb';
//noVNC这个模块使用cmj导出对象，webpack无法处理，导致浏览器中exports未定义
//import RFB from '@novnc/novnc/core/rfb.js';

export default {
  name: 'VncViewer',
  setup() {
    const vncScreen = ref(null); // 用于引用屏幕 div 元素
    const status = ref('disconnected'); // 连接状态
    const error = ref(''); // 错误信息
    let rfb = null; // RFB 实例

    const connect = () => {
      if (rfb) {
        rfb.disconnect();
      }

      // 从浏览器地址栏动态构建 WebSocket URL
      // 这使得它在开发环境 (localhost) 和生产环境都能正确工作
      const wsUrl = `ws://${window.location.hostname}:8000/ws/vnc`;
      status.value = 'connecting';
      error.value = '';
      console.log(`正在连接到 ${wsUrl}...`);

      // 创建 noVNC RFB 实例
      rfb = new RFB(vncScreen.value, wsUrl, {
        credentials: { password: '123456' }, // 这是你在 start_services.sh 中设置的密码
      });

      // 添加事件监听器来更新状态
      rfb.addEventListener('connect', () => {
        status.value = 'connected';
        console.log('VNC 已连接');
      });

      rfb.addEventListener('disconnect', (e) => {
        status.value = 'disconnected';
        console.log('VNC 已断开连接:', e.detail);
        if (!e.detail.clean) {
          error.value = '连接意外断开。';
        }
      });

      rfb.addEventListener('securityfailure', (e) => {
        status.value = 'failed';
        error.value = `安全认证失败: ${e.detail.reason}`;
        console.error('VNC 安全认证失败:', e.detail.reason);
      });
    };

    // 组件挂载后自动连接
    onMounted(() => {
      if (vncScreen.value) {
        connect();
      }
    });

    // 组件卸载时断开连接，防止内存泄漏
    onUnmounted(() => {
      if (rfb) {
        rfb.disconnect();
      }
    });

    return {
      vncScreen,
      status,
      error,
      connect,
    };
  },
};
</script>

<style scoped>
.vnc-container {
  width: 100vw; /* 视口宽度 */
  height: 100vh; /* 视口高度 */
  position: relative;
  background-color: #000;
}

.vnc-screen {
  width: 100%;
  height: 100%;
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
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
}

.status-box {
  background-color: #333;
  padding: 20px 40px;
  border-radius: 8px;
  text-align: center;
  font-family: sans-serif;
}

.status-box p {
  margin: 10px 0;
}

.status-box button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  font-size: 16px;
}

.status-box button:hover {
  background-color: #0056b3;
}
</style>
