
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

// 全局注册 element-plus 图标组件（菜单里用 <component :is="图标名" /> 动态渲染）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)       // 状态管理
app.use(router)      // 路由
app.use(ElementPlus) // UI 组件库
app.mount('#app')
