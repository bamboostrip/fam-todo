// src/utils/upload.ts
import { createAlova } from 'alova'
import { baseAlovaConfig, commonOnErrorHandler } from './alovaBaseConfig'
import { toast } from 'vue-sonner'

// 假设上传成功后，服务器返回这样的JSON结构
export interface UploadSuccessResponse {
  success: boolean
  url: string // 上传后的文件URL
  message?: string
  // ... 其他可能的字段
}

export const uploadClient = createAlova({
  ...baseAlovaConfig,
  baseURL: import.meta.env.VITE_UPLOAD_BASEURL, // 文件上传服务的 baseURL

  beforeRequest: (method) => {
    // 上传服务可能也需要 Token
    const token = localStorage.getItem('authToken') // 或者特定的上传Token
    if (token) {
      method.config.headers = { ...method.config.headers, Authorization: `Bearer ${token}` }
    }
    // 对于 FormData，不需要手动设置 Content-Type，浏览器/fetch 会自动处理
    console.log(
      `[Upload Request] ${method.type.toUpperCase()} ${method.url}`,
      'FormData in method.data',
    )
  },

  responded: {
    onSuccess: async (response: Response, method) => {
      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch (e) {}
        const errorMessage =
          errorData?.message ||
          errorData?.msg ||
          response.statusText ||
          `上传HTTP错误 ${response.status}`
        if (!method.config.meta?.hideErrorToast) toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      // 假设上传接口总是返回JSON
      const responseBody = (await response.json()) as UploadSuccessResponse
      if (responseBody.success) {
        return responseBody // 可以返回整个成功对象，或仅返回 responseBody.url
      } else {
        const errorMsg = responseBody.message || '文件上传失败'
        if (!method.config.meta?.hideErrorToast) toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    },
    onError: commonOnErrorHandler,
  },
})

/**
 * 创建并验证上传 Method 的辅助函数 (可选)
 * @param file 要上传的文件
 * @param uploadPath 上传接口的相对路径 (相对于 VITE_UPLOAD_BASEURL)
 * @param options 配置项，如 maxSize (MB), additionalData (额外表单数据)
 */
export function createValidatedUploadMethod(
  file: File,
  uploadPath: string,
  options?: { maxSizeMB?: number; additionalData?: Record<string, string> },
) {
  if (options?.maxSizeMB && file.size > options.maxSizeMB * 1024 * 1024) {
    const errorMsg = `文件大小不能超过 ${options.maxSizeMB}MB`
    toast.error(errorMsg)
    // 返回一个立即 reject 的 Promise 或抛出错误，让 useRequest 捕获
    return Promise.reject(new Error(errorMsg)) // 或者你可以设计一种方式让 useRequest 处理这种预检失败
  }

  const formData = new FormData()
  formData.append('file', file) // 'file' 通常是后端接收文件的字段名
  if (options?.additionalData) {
    for (const key in options.additionalData) {
      formData.append(key, options.additionalData[key])
    }
  }
  return uploadClient.Post<UploadSuccessResponse>(uploadPath, formData)
}
