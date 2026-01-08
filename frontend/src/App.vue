<template>
  <VncViewer />
</template>

<script>
import VncViewer from './components/VncViewer.vue';

export default {
  name: 'App',
  components: {
    VncViewer,
  },
};
</script>

<style>
/* 移除所有默认边距，让 VNC 视图占满整个屏幕 */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden; /* 防止出现滚动条 */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}
</style>
