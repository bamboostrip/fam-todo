<script setup lang="ts">
import { ref } from 'vue'
import { useTodosStore } from '@/store/todos'
import { Circle, Plus, Home, Star, Calendar, Clock } from 'lucide-vue-next'

/**
 * 创建上下文类型
 * - my-day: 我的一天视图
 * - important: 重要视图
 * - planned: 计划内视图
 * - tasks: 任务视图
 * - custom-list: 自定义列表视图
 */
export type CreateContext = 'my-day' | 'important' | 'planned' | 'tasks' | 'custom-list'

const props = withDefaults(
  defineProps<{
    /** 创建上下文，决定新任务的默认属性 */
    context?: CreateContext
    /** 自定义列表ID（仅当 context 为 custom-list 时使用） */
    listId?: string
  }>(),
  {
    context: 'tasks',
    listId: undefined,
  },
)

const emit = defineEmits<{
  added: []
}>()

const todosStore = useTodosStore()
const inputValue = ref('')
const isFocused = ref(false)

const handleAddTodo = () => {
  const content = inputValue.value.trim()
  if (content) {
    // 根据上下文决定使用哪个方法创建任务
    switch (props.context) {
      case 'my-day':
        // 在"我的一天"视图创建：myDayDate = Today, listId = tasks
        todosStore.addTodoToMyDay(content)
        break
      case 'important':
        // 在"重要"视图创建：isImportant = true, listId = tasks
        todosStore.addImportantTodo(content)
        break
      case 'planned':
        // 在"计划内"视图创建：plannedDate = Today, listId = tasks
        todosStore.addPlannedTodo(content)
        break
      case 'custom-list':
        // 在自定义列表视图创建：listId = 当前列表ID
        if (props.listId) {
          todosStore.addTodoToList(content, props.listId)
        } else {
          todosStore.addTodo(content)
        }
        break
      case 'tasks':
      default:
        // 在"任务"视图创建：普通任务，无特殊属性
        todosStore.addTodo(content)
        break
    }
    inputValue.value = ''
    emit('added')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleAddTodo()
  }
}

const handleCircleClick = () => {
  if (inputValue.value.trim()) {
    handleAddTodo()
  }
}
</script>

<template>
  <div class="bg-white/90 backdrop-blur rounded-md flex items-center px-4 h-12 shadow-sm gap-3">
    <!-- 圆圈按钮 -->
    <button
      v-if="isFocused || inputValue"
      class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400 hover:border-blue-500 transition-all hover:scale-110"
      @click="handleCircleClick"
    >
      <Circle class="w-full h-full text-transparent" />
    </button>
    <Plus v-else class="w-5 h-5 text-[#1C1B1B] flex-shrink-0" />

    <!-- 输入框 -->
    <input
      v-model="inputValue"
      type="text"
      placeholder="添加任务"
      class="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-500"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeydown"
    />

    <!-- 操作按钮 - 聚焦时显示在右侧 -->
    <div v-show="isFocused" class="flex items-center gap-2 flex-shrink-0">
      <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="添加到我的一天">
        <Home class="w-4 h-4 text-gray-600" />
      </button>
      <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="添加到任务">
        <Star class="w-4 h-4 text-gray-600" />
      </button>
      <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="添加截止日期">
        <Calendar class="w-4 h-4 text-gray-600" />
      </button>
      <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="提醒我">
        <Clock class="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </div>
</template>
