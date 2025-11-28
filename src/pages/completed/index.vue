<route lang="json5">
{
  name: 'completed',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout listId="completed" title="已完成">
    <template #icon>
      <CheckCircle class="w-8 h-8" />
    </template>

    <!-- TODO列表 -->
    <div v-if="completedTodos.length > 0" class="space-y-1">
      <TodoItem
        v-for="todo in completedTodos"
        :key="todo.id"
        :todo-id="todo.id"
        @delete="handleDelete"
      />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="此处显示已完成的任务。" />

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
import { CheckCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'completed')?.theme
})

const completedTodos = computed(() => {
  return todosStore.completedTodos
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
