<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="w-full relative">
      <SidebarTrigger class="absolute top-2 left-2 z-50" />
      <RouterView />
    </main>
    <!-- 任务详情侧边栏 -->
    <TodoDetailSidebar
      :todo-id="todoDetailStore.selectedTodoId"
      :open="todoDetailStore.isOpen"
      @close="todoDetailStore.closeDetail"
    />
  </SidebarProvider>
</template>

<script lang="ts" setup>
import AppSidebar from '@/components/AppSidebar.vue'
import TodoDetailSidebar from '@/components/TodoDetailSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useTodoDetailStore } from '@/store/todoDetail'

const todoDetailStore = useTodoDetailStore()
</script>
