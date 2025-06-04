// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router' // <--- 从标准 'vue-router' 导入
import { routes as generatedRoutes } from 'vue-router/auto-routes' // <--- 从 'vue-router/auto-routes' 导入

// 你可以在这里查看或修改自动生成的路由
console.log('自动生成的路由:', generatedRoutes)

// 例如，添加一个全局的 404 路由 (如果你的文件结构没有生成 catch-all 路由)
// const notFoundRoute = {
//   path: '/:pathMatch(.*)*', // 匹配所有未匹配到的路径
//   name: 'NotFound',
//   component: () => import('@/pages/_NotFound.vue') // 假设你有一个 NotFound 页面在 src/pages/_NotFound.vue
// };

const finalRoutes = [...generatedRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: finalRoutes, // 使用你处理过的路由数组
})

// ... (导航守卫)
export default router
