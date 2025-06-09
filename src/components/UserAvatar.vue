<script setup lang="ts">
import { computed } from 'vue'
import { MoreHorizontal, Settings, RefreshCw, LogOut } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/store/user'
import { useLoadingStore } from '@/store/loading'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const loadingStore = useLoadingStore()
const router = useRouter()

// 用户头像
const userAvatar = computed(() => {
  return userStore.userInfo.avatar || '/src/assets/avatar/avatar0.png'
})

// 用户名
const userName = computed(() => {
  return userStore.userInfo.username || '用户'
})

// 昵称
const nickName = computed(() => {
  return userStore.userInfo.nickName || '昵称'
})

// 用户操作菜单
const handleUserAction = (action: string) => {
  switch (action) {
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.clearUserInfo()
      router.push('/login')
      break
    case 'sync':
      // 调用同步功能
      loadingStore.startSync()
      break
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <div class="p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors">
        <div class="flex items-center gap-3">
          <img :src="userAvatar" :alt="userName" class="w-10 h-10 rounded-full object-cover" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ nickName }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ userName }}</p>
          </div>
          <MoreHorizontal class="w-4 h-4 opacity-50" />
        </div>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="handleUserAction('settings')">
        <Settings class="w-4 h-4 mr-2" />
        <span>设置</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleUserAction('sync')" :disabled="loadingStore.isLoading">
        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingStore.isLoading }" />
        <span>{{ loadingStore.isLoading ? '同步中...' : '同步' }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        @click="handleUserAction('logout')"
        class="text-destructive focus:text-destructive"
      >
        <LogOut class="w-4 h-4 mr-2" />
        <span>退出登录</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
