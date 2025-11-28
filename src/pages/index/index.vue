<route lang="json5">
{
  name: 'home',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>
<template>
  <TodoListLayout listId="my-day" title="我的一天" :showDate="true">
    <template #icon>
      <Sun class="w-8 h-8" />
    </template>

    <!-- TODO列表 -->
    <div v-if="myDayTodos.length > 0" class="space-y-1">
      <TodoItem
        v-for="todo in myDayTodos"
        :key="todo.id"
        :todo-id="todo.id"
        @delete="handleDelete"
      />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="开始你美好的一天，添加今天要完成的任务吧！" />

    <template #footer>
      <TodoInput context="my-day" @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'my-day')?.theme
})

const myDayTodos = computed(() => {
  return todosStore.myDayTodos
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
