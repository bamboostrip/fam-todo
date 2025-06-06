<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Star, CheckSquare, ListTodo, CheckCircle, EyeOff, Eye } from 'lucide-vue-next'
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
import { useListsStore } from '@/store/lists'
import { useRouter } from 'vue-router'

const listsStore = useListsStore()
const router = useRouter()

// 固定菜单图标映射
const menuIcons = {
  'my-day': Calendar,
  important: Star,
  planned: CheckSquare,
  tasks: ListTodo,
  completed: CheckCircle,
  all: ListTodo,
}

// 固定菜单
const fixedLists = computed(() => {
  return listsStore.intelligentLists.filter((list) => !list.isHidden) // 使用 listsStore.intelligentLists
})

// 导航到列表
const navigateToList = (list: any) => {
  if (list.route) {
    router.push(list.route)
  }
}

// 切换列表隐藏状态
const toggleListHidden = (listId: string) => {
  listsStore.toggleIntelligentListHidden(listId)
}
</script>

<template>
  <SidebarGroup class="px-4 py-2">
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="list in fixedLists" :key="list.id" class="mb-1">
          <ContextMenu>
            <ContextMenuTrigger as-child>
              <SidebarMenuButton
                @click="navigateToList(list)"
                class="w-full justify-between hover:bg-accent"
              >
                <div class="flex items-center gap-3">
                  <component :is="menuIcons[list.id as keyof typeof menuIcons]" class="w-4 h-4" />
                  <span>{{ list.name }}</span>
                </div>
                <span v-if="list.count && list.count > 0" class="text-xs text-muted-foreground">
                  {{ list.count }}
                </span>
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem @click="toggleListHidden(list.id)">隐藏</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
