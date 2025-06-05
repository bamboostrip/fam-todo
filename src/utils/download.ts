// src/utils/download.ts
import { createAlova } from 'alova'
import { baseAlovaConfig, commonOnErrorHandler } from './alovaBaseConfig'

export const downloadClient = createAlova({
  ...baseAlovaConfig,
  baseURL: import.meta.env.VITE_DOWNLOAD_BASEURL, // 文件下载服务的 baseURL

  beforeRequest: (method) => {
    // 下载服务可能也需要 Token
    const token = localStorage.getItem('authToken')
    if (token) {
      method.config.headers = { ...method.config.headers, Authorization: `Bearer ${token}` }
    }
    console.log(`[Download Request] ${method.type.toUpperCase()} ${method.url}`, method.config)
  },

  responded: {
    onSuccess: async (response: Response, method) => {
      if (!response.ok) {
        // 下载失败时，错误信息可能不是JSON，尝试读取文本
        const errorText = await response.text()
        const errorMessage = errorText || response.statusText || `下载HTTP错误 ${response.status}`
        if (!method.config.meta?.hideErrorToast) alert(errorMessage)
        throw new Error(errorMessage)
      }
      // 下载成功，直接返回 Blob 对象
      return response.blob()
    },
    onError: commonOnErrorHandler,
  },
})
