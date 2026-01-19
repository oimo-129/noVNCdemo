<template>
    <div class="common-layout">
      <el-container class="main-container">
        <!-- 左侧导航栏（响应式：占 2/12） -->
        <el-aside>
          <!-- 【新增】Flex 布局的父容器 -->
          <div class="sidebar-flex-container">
            <!-- 【新增】顶部标题栏 -->
            <div class="sidebar-header">
              <el-icon><Platform /></el-icon>
              <span>noVNC Demo演示</span>
            </div>
  
            <!-- 【修改】菜单部分，现在是 Flex 布局的子项 -->
            <el-menu
              default-active="1"
              class="sidebar-menu"
            >
              <el-sub-menu index="1">
                <template #title>
                  <el-icon><Monitor /></el-icon>
                  <span>控制面板</span>
                </template>
                <el-menu-item index="1-1" @click="handleConnect">
                  <el-icon><VideoPlay /></el-icon>
                  <span>连接</span>
                </el-menu-item>
                <el-menu-item index="1-2" @click="handleDisconnect">
                  <el-icon><SwitchButton /></el-icon>
                  <span>断开</span>
                </el-menu-item>
                <el-menu-item index="1-3" @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                  <span>刷新</span>
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </div>
        </el-aside>
  
        <!-- 右侧主内容区 -->
        <el-main>
          <vnc-viewer ref="vncViewerRef" />
        </el-main>
      </el-container>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import VncViewer from '../components/VncViewer.vue';
  // 【新增】引入了新的 Platform 图标
  import { VideoPlay, SwitchButton, Refresh, Monitor, Platform } from '@element-plus/icons-vue';
  
  const vncViewerRef = ref(null);
  
  const handleConnect = () => {
    if (vncViewerRef.value) {
      vncViewerRef.value.connect();
    }
  };
  
  const handleDisconnect = () => {
    if (vncViewerRef.value) {
      vncViewerRef.value.disconnect();
    }
  };
  
  const handleRefresh = () => {
    if (vncViewerRef.value) {
      vncViewerRef.value.connect();
    }
  };
  </script>
  
  <style scoped>
  /* 【关键】统一所有元素使用 border-box 盒模型 */
  * {
    box-sizing: border-box;
  }
  
  .common-layout, .main-container {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .el-main {
    flex: 10 !important; /* 响应式：占 10/12 = 83.33% */
    padding: 20px !important; /* 添加内边距，形成"外壳"效果 */
    background-color: #304156; /* 和左侧导航栏颜色一致 */
    box-sizing: border-box !important; /* 强制使用 border-box，防止被覆盖 */
    overflow: hidden; /* 隐藏溢出内容，防止滚动条 */
    height: 100%; /* 明确设置高度 */
  }
  
  /* 【新增】确保 el-aside 也使用 border-box */
  .el-aside {
    flex: 2 !important; /* 响应式：占 2/12 = 16.67% */
    box-sizing: border-box;
    min-width: 180px; /* 最小宽度，防止过窄 */
    max-width: 300px; /* 最大宽度，防止过宽 */
  }
  
  /* 【新增】确保 vnc-viewer 组件填充父容器 */
  .el-main > * {
    height: 100%; /* vnc-viewer 高度占满内容区 */
    width: 100%;
  }
  
  /* 【新增】给 VNC 组件添加容器样式，让它像嵌入的屏幕 */
  .el-main :deep(.vnc-container) {
    border-radius: 8px; /* 圆角边框 */
    overflow: hidden; /* 防止内容溢出圆角 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* 添加阴影，增强立体感 */
    border: 2px solid #2b3a4a; /* 细边框，颜色稍深 */
  }
  
  /* 【新增】侧边栏的 Flex 布局容器 */
  .sidebar-flex-container {
    display: flex;
    flex-direction: column; /* 主轴为列 */
    height: 100%;
  }
  
  /* 【新增】顶部标题栏样式 */
  .sidebar-header {
    flex: 2; /* 占据 2/12 的空间 */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background-color: #2b3a4a; /* 使用一个稍有区别的深色 */
  }
  
  .sidebar-header .el-icon {
    margin-right: 10px;
  }
  
  /* 【修改】菜单样式 */
  .sidebar-menu {
    flex: 10; /* 占据 10/12 的空间 */
    border-right: none;
    background-color: #304156;
  }
  
  .sidebar-menu :deep(.el-menu-item),
  .sidebar-menu :deep(.el-sub-menu__title) {
    color: #bfcbd9;
  }
  
  .sidebar-menu :deep(.el-menu-item:hover),
  .sidebar-menu :deep(.el-sub-menu__title:hover) {
    background-color: #263445;
  }
  
  .sidebar-menu :deep(.el-menu-item.is-active) {
    color: #409EFF;
  }
  
</style>