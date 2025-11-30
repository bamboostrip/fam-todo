<route lang="json5">
{
  name: 'list',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <TodoListLayout :listId="listId" :title="listName">
    <template #icon>
      <component :is="listIcon" class="w-8 h-8" />
    </template>

    <div v-if="listTodos.length > 0 || completedListTodos.length > 0" class="space-y-4">
      <!-- 未完成的任务 -->
      <div v-if="listTodos.length > 0" class="space-y-1">
        <TodoItem
          v-for="todo in listTodos"
          :key="todo.id"
          :todo-id="todo.id"
          @delete="handleDelete"
        />
      </div>

      <!-- 已完成分组 -->
      <div v-if="completedListTodos.length > 0" class="space-y-2">
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
            {{ completedListTodos.length }}
          </span>
        </button>
        <div v-show="showCompleted" class="space-y-1">
          <TodoItem
            v-for="todo in completedListTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <EmptyState v-else :theme="currentTheme" :message="`「${listName}」列表还没有待办事项`" />

    <template #footer>
      <TodoInput context="custom-list" :list-id="listId" @added="handleTodoAdded" />
    </template>
  </TodoListLayout>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/store/lists'
import { useTodosStore } from '@/store/todos'
import { ListTodo } from 'lucide-vue-next'
import * as Icons from 'lucide-vue-next'
import TodoListLayout from '@/components/TodoListLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoInput from '@/components/TodoInput.vue'
import { getTextColor } from '@/utils/theme'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const todosStore = useTodosStore()

const listId = computed(() => route.query.id as string)

// 根据 ID 查找列表信息
const currentList = computed(() => {
  if (!listId.value) return null
  return listsStore.customLists.find((list) => list.id === listId.value)
})

// 列表名称
const listName = computed(() => {
  return currentList.value?.name || '未知列表'
})

// 列表图标
const listIcon = computed(() => {
  const iconName = currentList.value?.icon || 'ListTodo'
  return (Icons as any)[iconName] || ListTodo
})

// 当前列表主题
const currentTheme = computed(() => {
  return currentList.value?.theme
})

// 获取该列表的所有未完成任务
const listTodos = computed(() => {
  return todosStore.getTodosByListId(listId.value)
})

// 获取该列表的已完成任务
const completedListTodos = computed(() => {
  return todosStore.completedTodos.filter((t) => t.listId === listId.value)
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

// 删除任务
const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

// 添加任务
const handleTodoAdded = () => {
  // 当在自定义列表添加任务时，使用 addTodoToList
  // TodoInput 组件需要知道当前列表ID
}

// 监听路由变化，如果没有 ID 或列表不存在，跳转到首页
watch(
  [listId, currentList],
  ([id, list]) => {
    if (!id || !list) {
      router.push('/')
    }
  },
  { immediate: true },
)
</script>
