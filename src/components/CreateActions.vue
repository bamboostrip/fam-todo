<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Plus, CircleX } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useListsStore } from '@/store/lists'
import { toast } from 'vue-sonner'
import IconSelector from './IconSelector.vue'

const listsStore = useListsStore()

// 输入状态
const newListName = ref('')
const newListIcon = ref('ListTodo')
const showNewListInput = ref(false)

// 自动失焦计时器
const listInputTimer = ref<number | null>(null)

// 创建新列表
const createNewList = () => {
  if (newListName.value.trim()) {
    try {
      listsStore.addList(newListName.value.trim(), undefined, newListIcon.value)
      newListName.value = ''
      newListIcon.value = 'ListTodo'
      showNewListInput.value = false
      clearInputTimer()
      toast.success('列表创建成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '创建失败')
    }
  }
}

// 显示新建列表输入框
const showNewListInputHandler = () => {
  showNewListInput.value = true
  clearInputTimer()
}

// 更新新建列表图标
const updateNewListIcon = (icon: string) => {
  newListIcon.value = icon
}

// 键盘事件处理
const handleListKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    createNewList()
  } else if (event.key === 'Escape') {
    hideListInput()
  }
}

// 隐藏输入框
const hideListInput = () => {
  showNewListInput.value = false
  newListName.value = ''
  newListIcon.value = 'ListTodo'
  clearInputTimer()
}

// 失焦处理
const handleListBlur = () => {
  // 5秒后隐藏输入框
  // listInputTimer.value = window.setTimeout(() => {
  //   hideListInput()
  // }, 5000)
  return false
}

// 获得焦点时清除计时器
const handleListFocus = () => {
  clearInputTimer()
}

// 清除计时器
const clearInputTimer = () => {
  if (listInputTimer.value) {
    clearTimeout(listInputTimer.value)
    listInputTimer.value = null
  }
}

// 组件卸载时清理计时器
onUnmounted(() => {
  clearInputTimer()
})
</script>

<template>
  <div class="p-4 border-t space-y-2">
    <!-- 新建列表输入 -->
    <div v-if="showNewListInput" class="flex items-center gap-2">
      <IconSelector
        :current-icon="newListIcon"
        @icon-selected="updateNewListIcon"
        class="shrink-0 cursor-pointer"
      />
      <Input
        v-model="newListName"
        @keydown="handleListKeydown"
        @blur="handleListBlur"
        @focus="handleListFocus"
        placeholder="列表名称"
        class="flex-1 h-8 text-sm"
        autoFocus
      />
      <Button variant="ghost" size="icon" class="shrink-0" @click="hideListInput" aria-label="关闭">
        <CircleX class="w-4 h-4" />
      </Button>
    </div>

    <div class="flex justify-between">
      <Button
        @click="showNewListInputHandler"
        variant="ghost"
        size="sm"
        class="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus class="w-4 h-4" />
        <span>新建列表</span>
      </Button>
    </div>
  </div>
</template>
