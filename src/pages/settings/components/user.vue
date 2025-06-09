<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useLoadingStore } from '@/store/loading'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

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

// 默认头像列表
const avatarList = Array.from({ length: 9 }, (_, i) => `/src/assets/avatar/avatar${i}.png`)

// 当前选中的头像（用于弹窗内选择）
const selectedAvatar = ref(userStore.userInfo.avatar || avatarList[0])

// 控制弹窗显示
const showAvatarDialog = ref(false)

// 打开弹窗时同步当前头像
const openAvatarDialog = () => {
  selectedAvatar.value = userStore.userInfo.avatar || avatarList[0]
  showAvatarDialog.value = true
}

// 保存头像
const saveAvatar = () => {
  userStore.setUserAvatar(selectedAvatar.value)
  toast.success('头像已更改')
  showAvatarDialog.value = false
}

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
  <div class="p-4 border-b hover:bg-accent/50 transition-colors">
    <div class="flex items-center gap-8">
      <Dialog v-model:open="showAvatarDialog">
        <DialogTrigger as-child>
          <img
            :src="userAvatar"
            :alt="userName"
            class="w-20 h-20 cursor-pointer rounded-full object-cover"
            @click="openAvatarDialog"
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更换头像</DialogTitle>
            <DialogDescription>选择一个新的头像来替换当前头像。</DialogDescription>
          </DialogHeader>
          <div class="grid grid-cols-3 gap-4 my-4 justify-items-center">
            <img
              v-for="avatar in avatarList"
              :key="avatar"
              :src="avatar"
              class="w-16 h-16 rounded-full cursor-pointer border-2 transition-all"
              :class="
                selectedAvatar === avatar
                  ? 'border-blue-500 ring-2 ring-blue-400'
                  : 'border-transparent'
              "
              @click="selectedAvatar = avatar"
            />
          </div>
          <DialogFooter>
            <Button @click="saveAvatar">保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div class="flex-1 min-w-0">
        <p class="text-xl font-medium truncate">{{ nickName }}</p>
        <p class="text-xs text-muted-foreground truncate">{{ userName }}</p>
      </div>
      <Button variant="destructive" @click="handleUserAction('logout')">注销</Button>
    </div>
  </div>
</template>
