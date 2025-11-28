<route lang="json5">
{
  name: 'planned',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout listId="planned" title="计划内">
    <template #icon>
      <Calendar class="w-8 h-8" />
    </template>

    <div v-if="allPlannedLikeTodos.length > 0" class="space-y-4">
      <!-- 先前（过期）折叠区域 -->
      <div v-if="overdueTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-2 py-1 rounded hover:bg-white/50 transition"
          @click="showOverdue = !showOverdue"
        >
          <span class="inline-flex items-center gap-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showOverdue ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            先前
          </span>
          <span class="text-xs bg-gray-200 rounded px-1">{{ overdueTodos.length }}</span>
        </button>
        <div v-show="showOverdue" class="space-y-1">
          <TodoItem
            v-for="todo in overdueTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 即将/当日 以及手动计划的任务 -->
      <div class="space-y-1">
        <TodoItem
          v-for="todo in upcomingTodos"
          :key="todo.id"
          :todo-id="todo.id"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" message="此处显示带有截止日期或提醒的任务。" />

    <template #footer>
      <TodoInput context="planned" @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { Calendar } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'planned')?.theme
})

// 今天零点
const today = new Date()
today.setHours(0, 0, 0, 0)

// 所有属于“计划内”视图的任务：有截止日期 / 有提醒 / 手动标记 planned
const allPlannedLikeTodos = computed(() => {
  return todosStore.todos.filter(
    (t) => !t.isCompleted && (t.plannedDate !== null || t.reminderTime !== null),
  )
})

const overdueTodos = computed(() => {
  return allPlannedLikeTodos.value.filter((t) => {
    if (!t.plannedDate) return false
    const d = new Date(t.plannedDate)
    d.setHours(0, 0, 0, 0)
    return d < today
  })
})

const upcomingTodos = computed(() => {
  return allPlannedLikeTodos.value.filter((t) => {
    if (t.plannedDate) {
      const d = new Date(t.plannedDate)
      d.setHours(0, 0, 0, 0)
      return d >= today
    }
    // 没截止日期但有提醒
    return !t.plannedDate
  })
})

const showOverdue = ref(false) // 默认折叠

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
