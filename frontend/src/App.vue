<template>
  <MainView />
</template>

<script setup>
import MainView from './views/MainView.vue';
</script>

<style>

html, body, #app {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

/* 修正 Element Plus 深色主题下弹出子菜单的背景色问题 */
/*但是，没解决！*/
.el-menu--vertical .el-menu.el-menu--popup-container {
  background-color: #304156 !important;
}
</style>