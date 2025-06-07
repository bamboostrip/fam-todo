// store/loading.ts
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    loadingText: '同步中...',
  }),

  actions: {
    setLoading(loading: boolean, text?: string) {
      this.isLoading = loading
      if (text) {
        this.loadingText = text
      }
    },

    startSync() {
      this.setLoading(true, '同步中...')
      // 模拟同步功能，5秒后完成
      setTimeout(() => {
        this.setLoading(false)
      }, 10000)
    },
  },
})
