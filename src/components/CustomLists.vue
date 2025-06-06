<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import IconSelector from '@/components/IconSelector.vue'
import { useListsStore } from '@/store/lists'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { CircleX } from 'lucide-vue-next'

const listsStore = useListsStore()
const router = useRouter()

// 编辑状态
const editingItem = ref<{ type: 'list'; id: string } | null>(null)
const editingName = ref('')
const editingIcon = ref('')

// 自定义列表（不在组内）
const customListsWithoutGroup = computed(() => {
  return listsStore.customLists.filter((list) => !list.groupId) // 使用 listsStore.customLists
})

// 导航到列表
const navigateToList = (list: any) => {
  if (list.route) {
    router.push(list.route)
  }
}

// 开始编辑
const startEdit = (id: string, currentName: string, currentIcon: string = 'ListTodo') => {
  editingItem.value = { type: 'list', id }
  editingName.value = currentName
  editingIcon.value = currentIcon
}

// 保存编辑
const saveEdit = () => {
  if (!editingItem.value) return

  try {
    listsStore.renameList(editingItem.value.id, editingName.value)
    listsStore.updateListIcon(editingItem.value.id, editingIcon.value)
    editingItem.value = null
    editingName.value = ''
    editingIcon.value = ''
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '重命名失败')
  }
}

// 取消编辑
const cancelEdit = () => {
  editingItem.value = null
  editingName.value = ''
  editingIcon.value = ''
}

// 删除列表
const deleteList = (listId: string) => {
  listsStore.deleteList(listId)
  toast.success('列表已删除')
}

// 更新图标
const updateIcon = (listId: string, iconName: string) => {
  listsStore.updateListIcon(listId, iconName)
  toast.success('图标已更新')
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}
</script>

<template>
  <SidebarGroup v-if="customListsWithoutGroup.length > 0" class="px-4 py-2">
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="list in customListsWithoutGroup" :key="list.id" class="mb-1">
          <div
            v-if="editingItem?.type === 'list' && editingItem?.id === list.id"
            class="flex items-center gap-2"
          >
            <IconSelector
              v-model="editingIcon"
              :current-icon="editingIcon"
              @icon-selected="(icon) => (editingIcon = icon)"
            />
            <Input
              v-model="editingName"
              @keydown="handleKeydown"
              class="flex-1 h-8 text-sm"
              autoFocus
            />
            <button
              class="shrink-0 flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground"
              @click="cancelEdit"
              aria-label="关闭"
              type="button"
            >
              <CircleX class="w-4 h-4" />
            </button>
          </div>
          <ContextMenu v-else>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                as="div"
                @click="navigateToList(list)"
                class="w-full justify-between hover:bg-accent cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <IconSelector
                    :current-icon="list.icon || 'ListTodo'"
                    @icon-selected="(icon) => updateIcon(list.id, icon)"
                  />
                  <span>{{ list.name }}</span>
                </div>
                <span v-if="list.count && list.count > 0" class="text-xs text-muted-foreground">
                  {{ list.count }}
                </span>
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem @click="startEdit(list.id, list.name, list.icon || 'ListTodo')">
                重命名
              </ContextMenuItem>
              <ContextMenuItem
                @click="deleteList(list.id)"
                class="text-destructive focus:text-destructive"
              >
                删除
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
