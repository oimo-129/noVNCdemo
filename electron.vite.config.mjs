import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

// Vite配置，主进程和渲染进程
export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    root: resolve('src/renderer'),
    publicDir: resolve('src/renderer/public'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    optimizeDeps: {
      // 排除 noVNC，让它作为 ESM 处理
      exclude: ['@novnc/novnc']
    },
    build: {
      target: 'esnext' // 支持 top-level await
    },
    esbuild: {
      target: 'esnext'
    }
  }
})
