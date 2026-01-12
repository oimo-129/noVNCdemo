<!-- frontend/src/App.vue (一个会导致问题的版本) -->
<template>
  <!-- 
    变化1: 在子组件标签上添加 ref="vncViewerRef" 
    这就像给电视机起个名字叫“客厅电视”，方便我们用遥控器找到它。
  -->
  <VncViewer ref="vncViewerRef" />

  <!-- 
    变化2: 在页面上添加一个按钮
    这个按钮就是我们遥控器上的“开机”键。
  -->
  <button @click="handleReconnect" class="reconnect-button">
    从外部强制重新连接
  </button>
</template>

<script>
import { ref } from 'vue'; // 导入 ref
import VncViewer from './components/VncViewer.vue';

export default {
  name: 'App',
  components: {
    VncViewer,
  },
  // 使用 setup() 函数来编写逻辑
  setup() {
    // 变化3: 创建一个 ref 来持有子组件的实例
    // 这就像创建了一个变量来存放“客厅电视”这个遥控对象。
    const vncViewerRef = ref(null);

    // 变化4: 定义点击按钮时要执行的函数
    const handleReconnect = () => {
      // 检查遥控对象是否存在
      if (vncViewerRef.value) {
        console.log('父组件 App.vue 正在尝试调用子组件的 connect 方法...');
        
        // 关键所在：父组件直接调用子组件内部的方法！
        // 这行代码依赖于 VncViewer.vue 的 setup() 函数 return 了 connect 方法。
        vncViewerRef.value.connect(); 
      }
    };

    // 必须把 ref 和方法 return 出去，模板才能用
    return {
      vncViewerRef,
      handleReconnect,
    };
  },
};
</script>

<style>
/* ... 省略原有样式 ... */

.reconnect-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  z-index: 100; /* 确保按钮在 VNC 画面之上 */
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>