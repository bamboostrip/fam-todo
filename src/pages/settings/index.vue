<route lang="json5">
{
  name: 'settings',
  meta: {
    requiresAuth: true,
    layout: 'fullScreen',
  },
}
</route>

<template>
  <div class="settings-page flex flex-col h-full">
    <div class="settings-header flex items-center py-4 px-6 bg-white border-b border-gray-200">
      <button class="back-btn mr-3 text-2xl" @click="goBack">
        <ArrowLeft />
      </button>
      <span class="settings-title text-2xl font-bold">设置</span>
    </div>
    <div class="settings-content px-30">
      <!-- 账户管理 -->
      <User />
      <!-- 主题切换 -->
      <SwitchTheme />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import User from './components/user.vue'
import SwitchTheme from './components/switchTheme.vue'

const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped></style>
