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

    <!-- 按列表分组（已完成） -->
    <div v-if="groupedByList.length > 0" class="space-y-4">
      <div v-for="group in groupedByList" :key="group.id" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="toggleSection(group.id)"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyleFor(group.id)">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="isOpen(group.id) ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            {{ group.name }}
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyleFor(group.id)">
            {{ group.todos.length }}
          </span>
        </button>
        <div v-show="isOpen(group.id)" class="space-y-1">
          <TodoItem
            v-for="todo in group.todos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>
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
import { computed, ref } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'
import type { Todo } from '@/types/todo'
import { getTextColor } from '@/utils/theme'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'completed')?.theme
})

// 列表名映射（系统 + 自定义）
const listNameMap = computed(() => {
  const map = new Map<string, string>()
  listsStore.intelligentLists.forEach((l) => map.set(l.id, l.name))
  listsStore.customLists.forEach((l) => map.set(l.id, l.name))
  return map
})

// 列表文字色映射（使用主题配置的 textColor）
const listTextColorMap = computed(() => {
  const map = new Map<string, string>()
  listsStore.intelligentLists.forEach((l) => {
    map.set(l.id, getTextColor(l.theme))
  })
  listsStore.customLists.forEach((l) => {
    map.set(l.id, getTextColor(l.theme))
  })
  return map
})

// 分组：tasks 优先，自定义按 order，其余按名称
const groupedByList = computed(() => {
  const groups = new Map<string, Todo[]>()
  const todos = todosStore.completedTodos as unknown as Todo[]
  todos.forEach((t) => {
    const id = t.listId || 'tasks'
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id)!.push(t)
  })

  const ids = Array.from(groups.keys())
  const customOrder = listsStore.customLists.map((l) => l.id)

  const orderedIds: string[] = []
  if (ids.includes('tasks')) orderedIds.push('tasks')
  customOrder.forEach((id) => {
    if (ids.includes(id)) orderedIds.push(id)
  })
  const rest = ids.filter((id) => !orderedIds.includes(id))
  rest.sort((a, b) =>
    (listNameMap.value.get(a) || a).localeCompare(listNameMap.value.get(b) || b, 'zh-Hans-CN'),
  )
  orderedIds.push(...rest)

  return orderedIds.map((id) => ({
    id,
    name: listNameMap.value.get(id) || '未知列表',
    todos: groups.get(id) || [],
  }))
})

// 折叠状态
const openSections = ref<Record<string, boolean>>({})
const isOpen = (id: string) => openSections.value[id] ?? true
const toggleSection = (id: string) => {
  openSections.value[id] = !(openSections.value[id] ?? true)
}

// 为模板提供按列表主题色着色的样式
const accentStyleFor = (id: string) => {
  const color = listTextColorMap.value.get(id) || '#3b82f6'
  // 如果是白色文字，改用黑色避免白底白字
  const finalColor =
    color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff' ? '#000000' : color
  return { color: finalColor }
}

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
