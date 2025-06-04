// 全局要用的类型放到这里
declare global {
  type IResData<T> = {
    code: number
    msg: string
    data: T
  }

  type IUserInfo = {
    username?: string
    avatar?: string
    token?: string
  }
}
declare global {
  const definePage: (typeof import('unplugin-vue-router/runtime'))['definePage']
}

declare module 'vue-router/auto-routes' {
  import type { RouteRecordRaw } from 'vue-router'
  export const routes: RouteRecordRaw[]
}

export {} // 防止模块污染
