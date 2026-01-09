const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    '@novnc/novnc'
  ],
  devServer: {
    client: {
      overlay: false  // 完全禁用错误覆盖层
    }
  }
})
