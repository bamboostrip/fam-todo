// store/index.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const store = createPinia()
// 全局启用插件，默认使用 localStorage
store.use(
  createPersistedState({
    storage: localStorage, // 默认持久化方式
  }),
)

export default store

// 模块统一导出
export * from './user'
