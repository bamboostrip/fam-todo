import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'
import '@/style/index.css'

// 导入路由守卫设置函数
import { setupRouterGuards } from './router'
// 导入主题store
import { useThemeStore } from './store/theme'

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 设置路由守卫
setupRouterGuards(router) // <--- 在这里调用

const app = createApp(App)
app.use(router)
app.use(store)

// 在应用挂载后初始化主题
app.mount('#app')

// 初始化主题系统
const themeStore = useThemeStore()
themeStore.initTheme()
