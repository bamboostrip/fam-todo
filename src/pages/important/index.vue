<route lang="json5">
{
  name: 'important',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout listId="important" title="重要">
    <template #icon>
      <Star class="w-8 h-8" />
    </template>

    <!-- TODO列表 -->
    <div v-if="importantTodos.length > 0" class="space-y-1">
      <TodoItem
        v-for="todo in importantTodos"
        :key="todo.id"
        :todo-id="todo.id"
        @delete="handleDelete"
      />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="尝试为一些任务加星标，以便在此处查看它们。" />

    <template #footer>
      <TodoInput context="important" @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { Star } from 'lucide-vue-next'
import { computed } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'important')?.theme
})

const importantTodos = computed(() => {
  return todosStore.importantTodos
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
