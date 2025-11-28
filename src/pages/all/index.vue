<!--
 * @Author: bamboo
 * @Date: 2025-11-28 17:09:04
 * @LastEditors: BambooStrop qiheng0625@gmail.com
 * @LastEditTime: 2025-11-28 17:10:28
 * @FilePath: \fam-todo\src\pages\all\index.vue
 * @Description: 
-->
<route lang="json5">
{
  name: 'all',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout listId="all" title="全部">
    <template #icon>
      <List class="w-8 h-8" />
    </template>

    <!-- TODO列表 -->
    <div v-if="allTodos.length > 0" class="space-y-1">
      <TodoItem v-for="todo in allTodos" :key="todo.id" :todo-id="todo.id" @delete="handleDelete" />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="此处显示所有列表中的任务。" />

    <template #footer>
      <TodoInput @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { List } from 'lucide-vue-next'
import { computed } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'all')?.theme
})

const allTodos = computed(() => {
  return todosStore.allTodos
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
