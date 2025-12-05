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
  <TodoListLayout
    listId="important"
    title="重要"
    :hasCompletedTodos="completedImportantTodos.length > 0"
    v-model:showCompleted="showCompletedTodos"
  >
    <template #icon>
      <Star class="w-8 h-8" />
    </template>

    <div v-if="importantTodos.length > 0 || completedImportantTodos.length > 0" class="space-y-4">
      <!-- 未完成的任务 -->
      <div v-if="importantTodos.length > 0" class="space-y-1">
        <TodoItem
          v-for="todo in importantTodos"
          :key="todo.id"
          :todo-id="todo.id"
          @delete="handleDelete"
        />
      </div>

      <!-- 已完成分组 - 根据 showCompletedTodos 控制是否显示整个分组 -->
      <div v-if="completedImportantTodos.length > 0 && showCompletedTodos" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="isCompletedExpanded = !isCompletedExpanded"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="isCompletedExpanded ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            已完成
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ completedImportantTodos.length }}
          </span>
        </button>
        <div v-show="isCompletedExpanded" class="space-y-1">
          <TodoItem
            v-for="todo in completedImportantTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>
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
import { computed, ref } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'
import { getTextColor } from '@/utils/theme'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'important')?.theme
})

// 未完成的重要任务
const importantTodos = computed(() => {
  return todosStore.importantTodos
})

// 已完成的重要任务
const completedImportantTodos = computed(() => {
  return todosStore.completedTodos.filter((t) => t.isImportant)
})

// 是否显示已完成任务分组（由 TodoListLayout 的设置菜单控制，默认隐藏）
const showCompletedTodos = ref(false)
// 已完成任务分组是否展开（手风琴控制）
const isCompletedExpanded = ref(false)

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
