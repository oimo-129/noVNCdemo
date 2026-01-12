const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    '@novnc/novnc'
  ],
    devServer: {
    port: 8848, // 在这里指定端口
    client: {
      overlay: false  // 完全禁用错误覆盖层
    }
  }
})
