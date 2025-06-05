// src/utils/alovaBaseConfig.ts
import VueHook from 'alova/vue'
import GlobalFetch from 'alova/fetch'
import type { Method } from 'alova'
import { toast } from 'vue-sonner'

export const commonOnErrorHandler = (error: Error, method: Method) => {
  console.error(`[Alova Error] Request to ${method.url} failed:`, error.message)

  // method.config 是 Alova Method 的配置对象，它上面可以有 meta 属性
  // meta 本身是 Record<string, any>，所以 meta?.hideErrorToast 是类型安全的
  if (!method.config.meta?.hideErrorToast) {
    toast.error(error.message || '请求出错，请稍后再试')
  }
  throw error
}

export const baseAlovaConfig = {
  statesHook: VueHook,
  requestAdapter: GlobalFetch(),
}
