<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { ChevronDown, ChevronRight, CircleX } from 'lucide-vue-next'
import * as Icons from 'lucide-vue-next'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { useListsStore } from '@/store/lists'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import IconSelector from './IconSelector.vue'

const listsStore = useListsStore()
const router = useRouter()

// 编辑状态
const editingItem = ref<{ type: 'list' | 'group'; id: string } | null>(null)
const editingName = ref('')
const editingIcon = ref('')

// 编辑输入区域 DOM
const navigateToList = (list: any) => {
  if (list.route) {
    router.push(list.route)
  }
}

// 开始编辑
const startEdit = (type: 'list' | 'group', id: string, currentName: string) => {
  editingItem.value = { type, id }
  editingName.value = currentName
  if (type === 'list') {
    const list = listsStore.customLists.find((l) => l.id === id)
    editingIcon.value = list?.icon || 'ListTodo'
  }
}

// 保存编辑
const saveEdit = () => {
  if (!editingItem.value) return

  try {
    if (editingItem.value.type === 'list') {
      listsStore.renameList(editingItem.value.id, editingName.value)
      if (editingIcon.value) {
        listsStore.updateListIcon(editingItem.value.id, editingIcon.value)
      }
    } else {
      listsStore.renameGroup(editingItem.value.id, editingName.value)
    }
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

// 删除组
const deleteGroup = (groupId: string) => {
  listsStore.deleteGroup(groupId)
  toast.success('组已删除')
}

// 解散组
const dissolveGroup = (groupId: string) => {
  listsStore.dissolveGroup(groupId)
  toast.success('组已解散')
}

// 更新编辑中的图标
const updateEditingIcon = (icon: string) => {
  editingIcon.value = icon
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return (Icons as any)[iconName] || Icons.ListTodo
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
  <SidebarGroup v-for="group in listsStore.groups" :key="group.id" class="px-4 py-2">
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarGroupLabel
          class="flex items-center justify-between cursor-pointer"
          @click="listsStore.toggleGroup(group.id)"
          :class="{ 'bg-accent/50': false }"
        >
          <div
            v-if="editingItem?.type === 'group' && editingItem?.id === group.id"
            class="flex items-center gap-2 w-full"
          >
            <Input
              v-model="editingName"
              @keydown="handleKeydown"
              class="flex-1 h-6 text-sm"
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
          <div v-else class="flex items-center gap-2 w-full">
            <component :is="group.isExpanded ? ChevronDown : ChevronRight" class="w-4 h-4" />
            <span class="flex-1">{{ group.name }}</span>
          </div>
        </SidebarGroupLabel>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem @click="startEdit('group', group.id, group.name)">重命名</ContextMenuItem>
        <ContextMenuItem
          @click="dissolveGroup(group.id)"
          class="text-orange-600 focus:text-orange-600"
        >
          解散
        </ContextMenuItem>
        <ContextMenuItem
          @click="deleteGroup(group.id)"
          class="text-destructive focus:text-destructive"
        >
          删除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>

    <SidebarGroupContent v-if="group.isExpanded">
      <SidebarMenu>
        <SidebarMenuItem
          v-for="list in listsStore.customLists.filter((l) => l.groupId === group.id)"
          :key="list.id"
          class="mb-1 ml-4"
        >
          <div
            v-if="editingItem?.type === 'list' && editingItem?.id === list.id"
            class="flex items-center gap-2"
          >
            <IconSelector
              :current-icon="editingIcon"
              @icon-selected="updateEditingIcon"
              class="shrink-0"
            />
            <Input
              v-model="editingName"
              @keydown="handleKeydown"
              @blur="saveEdit"
              class="flex-1 h-8 text-sm"
              autoFocus
            />
          </div>
          <ContextMenu v-else>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                @click="navigateToList(list)"
                class="w-full justify-between hover:bg-accent"
              >
                <div class="flex items-center gap-3">
                  <component :is="getIconComponent(list.icon || 'ListTodo')" class="w-4 h-4" />
                  <span>{{ list.name }}</span>
                </div>
                <span v-if="list.count && list.count > 0" class="text-xs text-muted-foreground">
                  {{ list.count }}
                </span>
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem @click="startEdit('list', list.id, list.name)">
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
