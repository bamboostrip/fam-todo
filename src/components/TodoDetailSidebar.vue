<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTodosStore } from '@/store/todos'
import {
  X,
  Star,
  Circle,
  Sun,
  Calendar,
  Bell,
  Repeat,
  Paperclip,
  CalendarClock,
  CalendarRange,
} from 'lucide-vue-next'
import SubTaskList from './SubTaskList.vue'
import MiniCalendar from './MiniCalendar.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{
  todoId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const todosStore = useTodosStore()

const todo = computed(() => {
  if (!props.todoId) return null
  return todosStore.todos.find((t) => t.id === props.todoId)
})

// 检查是否在"我的一天"中
const isInMyDay = computed(() => {
  return todo.value?.myDayDate ? todosStore.isToday(todo.value.myDayDate) : false
})

const handleToggleComplete = () => {
  if (props.todoId) {
    todosStore.toggleComplete(props.todoId)
  }
}

const handleToggleImportant = () => {
  if (props.todoId) {
    todosStore.toggleImportant(props.todoId)
  }
}

const handleToggleMyDay = () => {
  if (props.todoId) {
    todosStore.toggleMyDay(props.todoId)
  }
}

// 子任务相关操作
const handleAddStep = (content: string) => {
  if (props.todoId) {
    todosStore.addStep(props.todoId, content)
  }
}

const handleToggleStepComplete = (stepId: string) => {
  if (props.todoId) {
    todosStore.toggleStepComplete(props.todoId, stepId)
  }
}

const handleDeleteStep = (stepId: string) => {
  if (props.todoId) {
    todosStore.deleteStep(props.todoId, stepId)
  }
}

const handleUpdateStep = (stepId: string, content: string) => {
  if (props.todoId) {
    todosStore.updateStep(props.todoId, stepId, content)
  }
}

const handlePromoteStep = (stepId: string) => {
  if (props.todoId) {
    todosStore.promoteStepToTodo(props.todoId, stepId)
  }
}

// 更新备注
const handleUpdateNote = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (props.todoId) {
    todosStore.updateNote(props.todoId, target.value)
  }
}

// 更新任务标题
const handleUpdateContent = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.todoId) {
    todosStore.updateTodo(props.todoId, { content: target.value })
  }
}

const handleClose = () => {
  emit('close')
}

// ===== 截止日期相关 =====
const calendarOpen = ref(false)
const selectedDate = ref<Date | null>(null)

watch(
  () => calendarOpen.value,
  (open) => {
    if (open) {
      if (todo.value?.plannedDate) {
        selectedDate.value = new Date(todo.value.plannedDate)
      } else {
        selectedDate.value = null
      }
    }
  },
)

const handleDateConfirm = (date: Date | null) => {
  if (date && props.todoId) {
    todosStore.setDueDate(props.todoId, date)
    calendarOpen.value = false
  }
}

const handleSetDueToday = () => {
  if (!props.todoId) return
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  todosStore.setDueDate(props.todoId, today)
  calendarOpen.value = false
}

const handleSetDueTomorrow = () => {
  if (!props.todoId) return
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  todosStore.setDueDate(props.todoId, tomorrow)
  calendarOpen.value = false
}

const handleSetDueNextWeek = () => {
  if (!props.todoId) return
  const nextWeek = new Date()
  // 获取下周一
  const day = nextWeek.getDay()
  const diff = nextWeek.getDate() - day + (day === 0 ? -6 : 1) + 7
  nextWeek.setDate(diff)
  nextWeek.setHours(0, 0, 0, 0)
  todosStore.setDueDate(props.todoId, nextWeek)
  calendarOpen.value = false
}

const handleRemoveDueDate = (e?: Event) => {
  if (e) e.stopPropagation()
  if (props.todoId) {
    todosStore.clearDueDate(props.todoId)
  }
}

const handleOpenCalendar = () => {
  setTimeout(() => {
    calendarOpen.value = true
  }, 200)
}

// ===== 截止日期显示逻辑 =====
const weekMap = ['日', '一', '二', '三', '四', '五', '六']

const dueDateLabel = computed(() => {
  if (!todo.value?.plannedDate) return '添加截止日期'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.value.plannedDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return '今天 到期'
  if (diffDays === 1) return '明天 到期'
  if (diffDays === -1) return '昨天 到期'

  // 其它日期显示: M月D日, 周X
  return `${due.getMonth() + 1}月${due.getDate()}日, 周${weekMap[due.getDay()]} 到期`
})

const dueDateColorClass = computed(() => {
  if (!todo.value?.plannedDate) return 'text-gray-700'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.value.plannedDate)
  due.setHours(0, 0, 0, 0)
  if (due < today) return 'text-red-500'
  if (due.getTime() === today.getTime()) return 'text-blue-600'
  return 'text-blue-600' // 有截止日期时显示蓝色，除非过期
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open && todo" class="fixed inset-0 bg-black/20 z-[100]" @click="handleClose"></div>
    </Transition>

    <!-- 抽屉面板 -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open && todo"
        class="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-[101] flex flex-col text-sm"
      >
        <!-- Header -->
        <div class="flex items-start gap-3 p-6 border-b">
          <button
            class="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all hover:scale-110 mt-1"
            :class="
              todo.isCompleted
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-400 hover:border-blue-500'
            "
            @click="handleToggleComplete"
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

          <div class="flex-1">
            <input
              :value="todo.content"
              @input="handleUpdateContent"
              type="text"
              class="w-full text-lg font-medium bg-transparent border-none outline-none"
              :class="{ 'line-through opacity-60': todo.isCompleted }"
            />
          </div>

          <button
            class="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors"
            :class="{ 'text-yellow-500': todo.isImportant }"
            @click="handleToggleImportant"
          >
            <Star class="w-5 h-5" :fill="todo.isImportant ? 'currentColor' : 'none'" />
          </button>

          <button
            class="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors"
            @click="handleClose"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-1">
          <!-- 子任务列表组件 -->
          <SubTaskList
            :steps="todo.steps || []"
            @add="handleAddStep"
            @toggle-complete="handleToggleStepComplete"
            @delete="handleDeleteStep"
            @update="handleUpdateStep"
            @promote="handlePromoteStep"
          />

          <!-- 添加到"我的一天" -->
          <button
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            :class="{ 'bg-blue-50': isInMyDay }"
            @click="handleToggleMyDay"
          >
            <Sun class="w-5 h-5" :class="{ 'text-blue-500': isInMyDay }" />
            <span class="flex-1" :class="{ 'text-blue-600 font-medium': isInMyDay }">
              {{ isInMyDay ? '已添加到"我的一天"' : '添加到"我的一天"' }}
            </span>
            <X v-if="isInMyDay" class="w-4 h-4 text-blue-500" />
          </button>

          <!-- 提醒我 -->
          <button
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Bell class="w-5 h-5 text-gray-600" />
            <span class="flex-1 text-gray-700">提醒我</span>
          </button>

          <!-- 添加截止日期 -->
          <div class="relative w-full">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <Calendar class="w-5 h-5" :class="dueDateColorClass" />
                  <span class="flex-1" :class="dueDateColorClass">{{ dueDateLabel }}</span>
                  <div
                    v-if="todo.plannedDate"
                    class="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    @click.stop="handleRemoveDueDate"
                  >
                    <X class="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56 z-[102]" align="start">
                <DropdownMenuItem @click="handleSetDueToday">
                  <Calendar class="mr-2 h-4 w-4" />
                  <span>今天</span>
                  <span class="ml-auto text-xs text-gray-500">
                    {{
                      ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]
                    }}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleSetDueTomorrow">
                  <CalendarClock class="mr-2 h-4 w-4" />
                  <span>明天</span>
                  <span class="ml-auto text-xs text-gray-500">
                    {{
                      ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
                        new Date(new Date().setDate(new Date().getDate() + 1)).getDay()
                      ]
                    }}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleSetDueNextWeek">
                  <CalendarRange class="mr-2 h-4 w-4" />
                  <span>下周</span>
                  <span class="ml-auto text-xs text-gray-500">周一</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleOpenCalendar">
                  <Calendar class="mr-2 h-4 w-4" />
                  <span>选择日期</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover v-model:open="calendarOpen">
              <PopoverTrigger
                class="absolute bottom-0 left-0 w-full h-0 opacity-0 pointer-events-none"
              />
              <PopoverContent
                class="w-auto p-0 z-[102]"
                align="start"
                side="bottom"
                :side-offset="-100"
              >
                <MiniCalendar
                  :model-value="selectedDate"
                  @update:model-value="(val) => (selectedDate = val)"
                  @confirm="handleDateConfirm"
                  @cancel="calendarOpen = false"
                />
              </PopoverContent>
            </Popover>
          </div>

          <!-- 重复 -->
          <button
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Repeat class="w-5 h-5 text-gray-600" />
            <span class="flex-1 text-gray-700">重复</span>
          </button>

          <!-- 添加文件 -->
          <button
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Paperclip class="w-5 h-5 text-gray-600" />
            <span class="flex-1 text-gray-700">添加文件</span>
          </button>

          <!-- 添加备注 -->
          <div class="pt-4 border-t">
            <textarea
              :value="todo.note"
              @input="handleUpdateNote"
              placeholder="添加备注"
              class="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t text-xs text-gray-500">
          创建于 {{ new Date(todo.createdAt).toLocaleString('zh-CN') }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
