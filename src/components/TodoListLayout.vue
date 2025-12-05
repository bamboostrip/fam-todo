<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useListsStore, type ListTheme } from '@/store/lists'
import { useTodosStore } from '@/store/todos'
import { THEME_COLORS, getTextColor } from '@/utils/theme'
import { toast } from 'vue-sonner'

import Button from '@/components/ui/button/Button.vue'
import { MoreHorizontal, Eye, EyeOff, Trash2 } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  listId: string
  title: string
  showDate?: boolean
  // 是否有已完成的任务（由父组件传入）
  hasCompletedTodos?: boolean
  // 当前是否显示已完成任务（由父组件控制）
  showCompleted?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showCompleted', value: boolean): void
}>()

const router = useRouter()
const listsStore = useListsStore()
const todosStore = useTodosStore()

const imageOptions = [
  new URL('@/assets/bg/1.png', import.meta.url).href,
  new URL('@/assets/bg/2.png', import.meta.url).href,
  new URL('@/assets/bg/3.png', import.meta.url).href,
]

// Current Theme State
const currentTheme = computed(() => {
  const intelligentList = listsStore.intelligentLists.find((l) => l.id === props.listId)
  if (intelligentList?.theme) return intelligentList.theme

  const customList = listsStore.customLists.find((l) => l.id === props.listId)
  if (customList?.theme) return customList.theme

  return { type: 'color', value: '#f5f5f5' } as ListTheme
})

const backgroundStyle = computed(() => {
  if (currentTheme.value.type === 'color') {
    return { backgroundColor: currentTheme.value.value }
  } else {
    return {
      backgroundImage: `url(${currentTheme.value.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
})

const textColor = computed(() => {
  return getTextColor(currentTheme.value)
})

const setTheme = (type: 'color' | 'image', value: string) => {
  listsStore.updateListTheme(props.listId, { type, value })
}

// Date for "My Day"
const currentDate = ref(new Date())
const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  return currentDate.value.toLocaleDateString('zh-CN', options)
})

// 判断列表类型
const listType = computed(() => {
  // 我的一天
  if (props.listId === 'my-day') return 'my-day'
  // 重要、计划内
  if (props.listId === 'important' || props.listId === 'planned') return 'smart-list'
  // 自定义列表（非智能列表）
  const isIntelligent = listsStore.intelligentLists.some((l) => l.id === props.listId)
  if (!isIntelligent) return 'custom-list'
  // 其他智能列表（任务、已完成、全部等）
  return 'other-smart-list'
})

// 是否显示"隐藏/显示已完成任务"选项
const showCompletedOption = computed(() => {
  // 重要、计划内、自定义列表 都显示此选项
  return listType.value === 'smart-list' || listType.value === 'custom-list'
})

// 是否显示"删除列表"选项
const showDeleteOption = computed(() => {
  return listType.value === 'custom-list'
})

// 切换显示/隐藏已完成任务
const toggleShowCompleted = () => {
  emit('update:showCompleted', !props.showCompleted)
}

// 删除列表确认对话框
const showDeleteDialog = ref(false)

const handleDeleteList = () => {
  // 先删除该列表的所有任务
  todosStore.deleteTodosByListId(props.listId)
  // 再删除列表本身
  listsStore.deleteList(props.listId)
  // 关闭对话框
  showDeleteDialog.value = false
  toast.success('列表已删除')
  // 跳转到首页
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col h-screen transition-all duration-300" :style="backgroundStyle">
    <!-- Header -->
    <div class="px-8 pt-8 pb-4 flex items-start justify-between">
      <div class="drop-shadow-md" :style="{ color: textColor }">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <slot name="icon"></slot>
          {{ title }}
        </h1>
        <div v-if="showDate" class="mt-1 text-sm opacity-90">{{ formattedDate }}</div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Settings Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="hover:bg-white/20"
              :style="{ color: textColor }"
            >
              <MoreHorizontal class="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-80">
            <div class="p-2">
              <div class="text-sm font-semibold mb-2">主题</div>
              <div class="grid grid-cols-5 gap-2 mb-4">
                <button
                  v-for="color in THEME_COLORS"
                  :key="color.value"
                  class="w-10 h-10 rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :style="{ backgroundColor: color.value }"
                  :class="
                    currentTheme.type === 'color' && currentTheme.value === color.value
                      ? 'border-black'
                      : 'border-transparent'
                  "
                  @click="setTheme('color', color.value)"
                />
                <button
                  v-for="img in imageOptions"
                  :key="img"
                  class="w-10 h-10 rounded-md border-2 bg-cover bg-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :style="{ backgroundImage: `url(${img})` }"
                  :class="
                    currentTheme.type === 'image' && currentTheme.value === img
                      ? 'border-black'
                      : 'border-transparent'
                  "
                  @click="setTheme('image', img)"
                />
              </div>
            </div>

            <!-- 隐藏/显示已完成任务 - 仅在有已完成任务时显示 -->
            <template v-if="showCompletedOption">
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="toggleShowCompleted">
                <component :is="showCompleted ? EyeOff : Eye" class="mr-2 h-4 w-4" />
                <span>{{ showCompleted ? '隐藏已完成任务' : '显示已完成任务' }}</span>
              </DropdownMenuItem>
            </template>

            <!-- 删除列表 - 仅自定义列表显示 -->
            <template v-if="showDeleteOption">
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive" @click="showDeleteDialog = true">
                <Trash2 class="mr-2 h-4 w-4" />
                <span>删除列表</span>
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto px-8 pb-8">
      <slot></slot>
    </div>

    <!-- Footer / Input Area -->
    <div class="px-8 pb-8">
      <slot name="footer"></slot>
    </div>

    <!-- Delete List Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除列表</DialogTitle>
          <DialogDescription>
            你确定要永久删除「{{ title }}」列表吗？该列表下的所有任务也将被删除，此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-3 sm:gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">取消</Button>
          <Button variant="destructive" @click="handleDeleteList">删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
