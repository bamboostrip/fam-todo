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

    <div v-if="tasksTodos.length > 0 || completedTasksTodos.length > 0" class="space-y-4">
      <!-- 未完成的任务 -->
      <div v-if="tasksTodos.length > 0" class="space-y-1">
        <TodoItem
          v-for="todo in tasksTodos"
          :key="todo.id"
          :todo-id="todo.id"
          @delete="handleDelete"
        />
      </div>

      <!-- 已完成分组 -->
      <div v-if="completedTasksTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showCompleted = !showCompleted"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showCompleted ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            已完成
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ completedTasksTodos.length }}
          </span>
        </button>
        <div v-show="showCompleted" class="space-y-1">
          <TodoItem
            v-for="todo in completedTasksTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>
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
import { computed, ref } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'
import { getTextColor } from '@/utils/theme'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'tasks')?.theme
})

const tasksTodos = computed(() => {
  return todosStore.tasksTodos
})

const completedTasksTodos = computed(() => {
  return todosStore.completedTodos.filter((t) => t.listId === 'tasks')
})

const showCompleted = ref(false)

const accentColor = computed(() => getTextColor(currentTheme.value))

const accentStyle = computed(() => {
  const color = accentColor.value
  // 如果是白色文字，改用黑色避免白底白字
  const finalColor =
    color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff' ? '#000000' : color
  return { color: finalColor }
})

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
