import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. 从 pinia 库导入 createPinia 函数
import App from './App.vue'
import router from './router'

const pinia = createPinia() // 2. 创建一个 Pinia 实例 (这就是我们的“中央仓库”)
const app = createApp(App)
app.use(router)
app.use(pinia) // 3. 告诉 Vue 应用实例使用这个 Pinia 仓库
app.mount('#app')