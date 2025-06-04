import { apiClient } from '@/utils/http'
import { createValidatedUploadMethod } from '@/utils/upload' // 使用带校验的辅助函数
import { downloadClient } from '@/utils/download'

export interface IFooItem {
  id: string
  name: string
}

export const getFooList = () => apiClient.Get<IFooItem>('/foo')
export const getSingleFoo = (name: string) => apiClient.Post<IFooItem>(`/foo`, { name })

export const uploadDocument = (file: File, description: string) => {
  return createValidatedUploadMethod(
    file,
    '/documents', // 上传接口的相对路径 (相对于 VITE_UPLOAD_BASEURL)
    {
      maxSizeMB: 10, // 例如，最大10MB
      additionalData: { description },
    },
  )
}

export const downloadAttachment = (attachmentId: string) => {
  return downloadClient.Get<Blob>(`/attachments/${attachmentId}`) // 期望返回 Blob
}
