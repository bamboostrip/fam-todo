// src/router/index.ts
import type { Router } from 'vue-router'
import { useUserStore } from '@/store/user'

// 获取用户登录状态的函数
const isLoggedIn = (): boolean => {
  const userStore = useUserStore()
  return userStore.isLogined
}

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, from, next) => {
    console.log(`Navigating to: ${to.path}`)

    // 检查路由是否需要登录
    if (to.meta.requiresAuth && !isLoggedIn()) {
      // 用户未登录且页面需要认证，跳转到登录页
      // 同时可以保存用户想去的页面路径，以便登录后跳转回来
      next({
        path: '/login', // 假设你的登录页路由是 /login
        query: { redirect: to.fullPath }, // 可选：登录后重定向回原页面
      })
    } else if (to.path === '/login' && isLoggedIn()) {
      // 如果用户已登录，访问登录页时直接跳转到首页或之前页面
      next('/') // 或者 next(from.fullPath || '/')
    } else {
      // 其他情况正常跳转
      next()
    }
  })

  router.afterEach((to, from) => {
    // 可以在这里添加一些路由切换后的逻辑，比如页面标题设置、分析等
    // console.log(`Mapsd to ${to.path}`);
    // 打印所有路由信息
    console.log('All routes:', router.getRoutes())
  })
}
