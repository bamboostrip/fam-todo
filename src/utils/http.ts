// src/utils/http.ts
import { createAlova } from 'alova'
import { baseAlovaConfig, commonOnErrorHandler } from './alovaBaseConfig' // 导入共享配置
import { useUserStore } from '@/store/user'
import { toast } from 'vue-sonner'

export const apiClient = createAlova({
  cacheFor: null,
  ...baseAlovaConfig, // 应用共享的基础配置
  baseURL: import.meta.env.VITE_SERVER_BASEURL || '/api', // 常规 API 的 baseURL

  beforeRequest: (method) => {
    // 通用 Token 添加逻辑
    const token = localStorage.getItem('authToken')
    if (useUserStore().isLogined) {
      method.config.headers = { ...method.config.headers, Authorization: `Bearer ${token}` }
    }
    // 为普通对象数据设置 Content-Type (如果不是 FormData)
    if (
      (method.type === 'POST' || method.type === 'PUT') &&
      typeof method.data === 'object' &&
      method.data !== null &&
      !(method.data instanceof FormData) &&
      !method.config.headers?.['Content-Type']
    ) {
      method.config.headers = {
        ...method.config.headers,
        'Content-Type': 'application/json;charset=UTF-8',
      }
    }
    console.log(`[API Request] ${method.type.toUpperCase()} ${method.url}`, method.config)
  },

  responded: {
    onSuccess: async (response: Response, method) => {
      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch (e) {}
        const errorMessage = errorData?.msg || response.statusText || `HTTP 错误 ${response.status}`
        if (!method.config.meta?.hideErrorToast) toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const responseBody = (await response.json()) as IResData<any>
        if (responseBody && typeof responseBody === 'object' && 'code' in responseBody) {
          if (responseBody.code === 0 || responseBody.code === 200) {
            return responseBody.data // 提取核心数据
          } else if (responseBody.code === 401) {
            const errorMsg = responseBody.msg || '登录已过期或无权限'
            if (!method.config.meta?.hideErrorToast) toast.error(errorMsg)
            // TODO: 执行登出或跳转到登录页
            throw new Error(errorMsg)
          } else {
            const errorMsg = responseBody.msg || `业务错误: ${responseBody.code}`
            if (!method.config.meta?.hideErrorToast) toast.error(errorMsg)
            throw new Error(errorMsg)
          }
        }
        console.warn('[API Client onSuccess] JSON响应体与期望结构不符:', responseBody)
        return responseBody // 返回原始JSON以防万一
      }
      // 对于非JSON响应，返回文本
      return response.text()
    },
    onError: commonOnErrorHandler, // 使用共享的错误处理
  },
})
