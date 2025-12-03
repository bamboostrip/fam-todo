<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTodosStore, DEFAULT_TASKS_LIST_ID } from '@/store/todos'
import { useTodoDetailStore } from '@/store/todoDetail'
import { useListsStore } from '@/store/lists'
import { Circle, Star } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
import DatePicker from './DatePicker.vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps<{
  todoId: string
}>()

const emit = defineEmits<{
  delete: [id: string]
  click: [id: string]
}>()

const todosStore = useTodosStore()
const todoDetailStore = useTodoDetailStore()
const listsStore = useListsStore()

const todo = computed(() => todosStore.todos.find((t) => t.id === props.todoId))

// 获取子任务进度
const stepsProgress = computed(() => {
  return todosStore.getStepsProgress(props.todoId)
})

// 检查是否在"我的一天"中
const isInMyDay = computed(() => {
  return todo.value?.myDayDate ? todosStore.isToday(todo.value.myDayDate) : false
})

// 获取任务所属列表的名称
const listName = computed(() => {
  if (!todo.value?.listId) return ''

  // 如果当前任务就在它所属的列表页面中，不显示列表名
  // 只在"我的一天"、"重要"、"计划内"、"全部"、"已完成"等智能列表中显示所属列表
  const currentRoute = window.location.pathname

  // 检查是否在任务页面或当前任务所属的自定义列表页面
  if (currentRoute === '/tasks' && todo.value.listId === DEFAULT_TASKS_LIST_ID) {
    return '' // 在任务页面不显示"任务"
  }

  if (currentRoute.includes('/list') && currentRoute.includes(todo.value.listId)) {
    return '' // 在自定义列表页面不显示当前列表名
  }

  // 先在智能列表中查找
  const intelligentList = listsStore.intelligentLists.find((l) => l.id === todo.value?.listId)
  if (intelligentList) {
    return intelligentList.name
  }

  // 再在自定义列表中查找
  const customList = listsStore.customLists.find((l) => l.id === todo.value?.listId)
  if (customList) {
    return customList.name
  }

  return ''
})

// 是否显示"我的一天"标签（只在任务页面和自定义列表页面显示）
const shouldShowMyDayLabel = computed(() => {
  const currentRoute = window.location.pathname
  return (currentRoute === '/tasks' || currentRoute.includes('/list')) && isInMyDay.value
})

const handleToggleComplete = () => {
  if (todo.value?.content) {
    todosStore.toggleComplete(props.todoId)
  }
}

const handleToggleImportant = (e: Event) => {
  e.stopPropagation()
  todosStore.toggleImportant(props.todoId)
}

const handleClick = () => {
  todoDetailStore.openDetail(props.todoId)
  emit('click', props.todoId)
}

// Context menu actions
const handleToggleMyDay = () => {
  todosStore.toggleMyDay(props.todoId)
}

const handleMarkComplete = () => {
  todosStore.toggleComplete(props.todoId)
}

// 截止日期相关
const calendarOpen = ref(false)
const selectedDate = ref<Date | null>(null)

const openDatePicker = () => {
  if (todo.value?.plannedDate) {
    selectedDate.value = new Date(todo.value.plannedDate)
  } else {
    selectedDate.value = new Date()
  }
  calendarOpen.value = true
}

const handleDateSelected = (date: Date | null) => {
  if (date) {
    todosStore.setDueDate(props.todoId, date)
  }
}

const handleSetDueToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  todosStore.setDueDate(props.todoId, today)
}

const handleSetDueTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  todosStore.setDueDate(props.todoId, tomorrow)
}

const handleRemoveDueDate = () => {
  todosStore.clearDueDate(props.todoId)
}

const handleDelete = () => {
  emit('delete', props.todoId)
}

// ===== 截止日期显示逻辑 =====
const weekMap = ['日', '一', '二', '三', '四', '五', '六']

const dueDateLabel = computed(() => {
  if (!todo.value?.plannedDate) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.value.plannedDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'

  // 其它日期显示: M月D日, 周X
  return `${due.getMonth() + 1}月${due.getDate()}日, 周${weekMap[due.getDay()]}`
})

const dueDateColorClass = computed(() => {
  if (!todo.value?.plannedDate) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.value.plannedDate)
  due.setHours(0, 0, 0, 0)
  if (due < today) return 'text-red-500'
  if (due.getTime() === today.getTime()) return 'text-blue-600'
  return 'text-gray-600'
})

const isOverdue = computed(() => {
  if (!todo.value?.plannedDate || todo.value.isCompleted) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.value.plannedDate)
  due.setHours(0, 0, 0, 0)
  return due < today
})

// 获取所有可用的列表（用于移动任务）
const availableLists = computed(() => {
  // 获取"任务"列表和所有自定义列表
  const tasksList = listsStore.intelligentLists.find((list) => list.id === 'tasks')
  const lists = tasksList ? [tasksList] : []
  return [...lists, ...listsStore.customLists]
})

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return (LucideIcons as any)[iconName] || Circle
}

// 移动任务到指定列表
const handleMoveToList = (listId: string) => {
  todosStore.moveTodoToList(props.todoId, listId)
}
</script>

<template>
  <div v-if="todo" @click="handleClick">
    <ContextMenu>
      <ContextMenuTrigger as-child>
        <div
          class="relative overflow-hidden flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group shadow-sm"
        >
          <!-- 过期标识 -->
          <div v-if="isOverdue" class="absolute bottom-0 left-0 w-full h-1.5 bg-[#FFE586]"></div>

          <!-- 完成状态圆圈 -->
          <button
            class="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
            :class="
              todo.isCompleted
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-400 hover:border-blue-500'
            "
            @click.stop="handleToggleComplete"
          >
            <Circle v-if="!todo.isCompleted" class="w-full h-full text-transparent" />
            <svg
              v-else
              class="w-full h-full text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>

          <!-- 任务标题 -->
          <div
            class="flex-1 text-sm text-gray-800"
            :class="{ 'line-through opacity-60': todo.isCompleted }"
          >
            {{ todo.content }}
            <!-- 子任务进度和截止日期展示 -->
            <div class="mt-1 flex items-center gap-2 text-xs">
              <!-- 我的一天标签（只在任务页面和自定义列表页面显示） -->
              <span v-if="shouldShowMyDayLabel" class="text-blue-600 flex items-center gap-1">
                <svg
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                我的一天
              </span>

              <!-- 所属列表 -->
              <template v-if="listName">
                <span v-if="shouldShowMyDayLabel" class="text-gray-300">·</span>
                <span class="text-gray-500 flex items-center gap-1">
                  {{ listName }}
                </span>
              </template>

              <!-- 子任务进度 -->
              <template v-if="stepsProgress.total > 0">
                <span v-if="listName || shouldShowMyDayLabel" class="text-gray-300">·</span>
                <span class="text-gray-600 flex items-center gap-1">
                  <svg
                    class="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {{ stepsProgress.completed }}/{{ stepsProgress.total }}
                </span>
              </template>

              <!-- 截止日期 -->
              <template v-if="todo.plannedDate">
                <span
                  v-if="listName || stepsProgress.total > 0 || shouldShowMyDayLabel"
                  class="text-gray-300"
                >
                  ·
                </span>
                <div class="flex items-center gap-1">
                  <svg
                    class="w-3 h-3 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span :class="dueDateColorClass" class="font-medium">{{ dueDateLabel }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- 重要星标 - 默认显示 -->
          <button
            class="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 transition-colors"
            :class="{ 'text-yellow-500': todo.isImportant, 'text-gray-400': !todo.isImportant }"
            @click="handleToggleImportant"
            title="标记为重要"
          >
            <Star class="w-4 h-4" :fill="todo.isImportant ? 'currentColor' : 'none'" />
          </button>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent class="w-56">
        <!-- 添加到/从"我的一天"移除 -->
        <ContextMenuItem @click="handleToggleMyDay">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            {{ isInMyDay ? '从"我的一天"中删除' : '添加到"我的一天"' }}
          </span>
          <span class="ml-auto text-xs text-gray-500">Ctrl+T</span>
        </ContextMenuItem>

        <!-- 标记为重要/删除重要标记 -->
        <ContextMenuItem @click="handleToggleImportant">
          <span class="flex items-center gap-2">
            <Star class="w-4 h-4" :fill="todo.isImportant ? 'currentColor' : 'none'" />
            {{ todo.isImportant ? '删除重要标记' : '标记为重要' }}
          </span>
        </ContextMenuItem>

        <!-- 标记为已完成/标记为未完成 -->
        <ContextMenuItem @click="handleMarkComplete">
          <span class="flex items-center gap-2">
            <Circle class="w-4 h-4" />
            {{ todo.isCompleted ? '标记为未完成' : '标记为已完成' }}
          </span>
          <span class="ml-auto text-xs text-gray-500">Ctrl+D</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <!-- 今天到期 -->
        <ContextMenuItem @click="handleSetDueToday">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            今天到期
          </span>
        </ContextMenuItem>

        <!-- 明天到期 -->
        <ContextMenuItem @click="handleSetDueTomorrow">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            明天到期
          </span>
        </ContextMenuItem>

        <!-- 选择日期 -->
        <ContextMenuItem @click="openDatePicker">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            选择日期
          </span>
        </ContextMenuItem>

        <!-- 删除截止日期 (仅当有日期时显示) -->
        <ContextMenuItem v-if="todo.plannedDate" @click="handleRemoveDueDate">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            删除截止日期
          </span>
        </ContextMenuItem>

        <!-- 将任务移动到列表 -->
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              将任务移动到列表...
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent class="w-48">
            <ContextMenuItem
              v-for="list in availableLists"
              :key="list.id"
              :disabled="list.id === todo.listId"
              @click="handleMoveToList(list.id)"
            >
              <span class="flex items-center gap-2">
                <component :is="getIconComponent(list.icon || 'Home')" class="w-4 h-4" />
                {{ list.name }}
              </span>
              <svg
                v-if="list.id === todo.listId"
                class="ml-auto w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <!-- 删除任务 -->
        <ContextMenuItem class="text-red-600" @click="handleDelete">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
            删除任务
          </span>
          <span class="ml-auto text-xs">Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>

  <!-- 日期选择器弹窗 -->
  <DatePicker v-model="selectedDate" v-model:open="calendarOpen" @confirm="handleDateSelected" />
</template>
