<template>
  <!-- 全局加载状态显示在头部 -->
  <LoadingAnimation v-if="loadingStore.isLoading" class="global-loading-header" />

  <Toaster />
  <RouterView />
</template>

<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { useLoadingStore } from '@/store'
import { useSyncListCounts } from '@/composables/useSyncListCounts'
import 'vue-sonner/style.css'

const loadingStore = useLoadingStore()

// 同步列表计数
useSyncListCounts()
</script>

<style scoped>
.global-loading-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
}
</style>
