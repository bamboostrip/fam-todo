<route lang="json5">
{
  name: 'tasks',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout listId="tasks" title="任务">
    <template #icon>
      <ListTodo class="w-8 h-8" />
    </template>

    <!-- TODO列表 -->
    <div v-if="tasksTodos.length > 0" class="space-y-1">
      <TodoItem
        v-for="todo in tasksTodos"
        :key="todo.id"
        :todo-id="todo.id"
        @delete="handleDelete"
      />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="添加任务以开始使用。" />

    <template #footer>
      <TodoInput context="tasks" @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { ListTodo } from 'lucide-vue-next'
import { computed } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'tasks')?.theme
})

const tasksTodos = computed(() => {
  return todosStore.tasksTodos
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
