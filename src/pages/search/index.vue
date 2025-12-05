<route lang="json5">
{
  name: 'search',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Circle, Star, Sun, Calendar, FileText, ListChecks } from 'lucide-vue-next'
import { useTodosStore, type Todo, type SubTodo } from '@/store/todos'
import { useListsStore } from '@/store/lists'
import { useTodoDetailStore } from '@/store/todoDetail'

const route = useRoute()
const todosStore = useTodosStore()
const listsStore = useListsStore()
const todoDetailStore = useTodoDetailStore()

// 默认主题配置
const defaultTheme = {
  value: '#5C70BE',
  textColor: '#FFFFFF',
}

const searchQuery = ref('')
const isLoading = ref(false)

// 搜索结果类型
interface SearchResult {
  todo: Todo
  matchType: 'content' | 'step' | 'note'
  matchedText: string
  matchedStepId?: string
}

// 执行模糊搜索
const searchResults = computed<SearchResult[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const results: SearchResult[] = []

  todosStore.todos.forEach((todo) => {
    // 搜索任务内容
    if (todo.content.toLowerCase().includes(query)) {
      results.push({
        todo,
        matchType: 'content',
        matchedText: todo.content,
      })
      return // 避免重复添加同一任务
    }

    // 搜索子任务内容
    const matchedStep = todo.steps.find((step) => step.content.toLowerCase().includes(query))
    if (matchedStep) {
      results.push({
        todo,
        matchType: 'step',
        matchedText: matchedStep.content,
        matchedStepId: matchedStep.id,
      })
      return
    }

    // 搜索备注内容
    if (todo.note && todo.note.toLowerCase().includes(query)) {
      results.push({
        todo,
        matchType: 'note',
        matchedText: todo.note,
      })
    }
  })

  return results
})

// 获取列表名称
const getListName = (listId: string) => {
  const intelligentList = listsStore.intelligentLists.find((l) => l.id === listId)
  if (intelligentList) return intelligentList.name

  const customList = listsStore.customLists.find((l) => l.id === listId)
  if (customList) return customList.name

  return '任务'
}

// 获取匹配类型标签
const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case 'content':
      return '任务'
    case 'step':
      return '子任务'
    case 'note':
      return '备注'
    default:
      return ''
  }
}

// 获取匹配类型图标样式
const getMatchTypeIcon = (matchType: string) => {
  switch (matchType) {
    case 'content':
      return Circle
    case 'step':
      return ListChecks
    case 'note':
      return FileText
    default:
      return Circle
  }
}

// 高亮匹配文本
const highlightMatch = (text: string) => {
  const query = searchQuery.value.trim()
  if (!query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>')
}

// 转义正则表达式特殊字符
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 截断文本
const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 检查是否在"我的一天"中
const isInMyDay = (todo: Todo) => {
  return todo.myDayDate ? todosStore.isToday(todo.myDayDate) : false
}

// 处理点击搜索结果
const handleResultClick = (result: SearchResult) => {
  todoDetailStore.openDetail(result.todo.id)
}

// 切换完成状态
const handleToggleComplete = (todoId: string, event: Event) => {
  event.stopPropagation()
  todosStore.toggleComplete(todoId)
}

// 切换重要状态
const handleToggleImportant = (todoId: string, event: Event) => {
  event.stopPropagation()
  todosStore.toggleImportant(todoId)
}

// 删除任务
const handleDelete = (todoId: string) => {
  todosStore.deleteTodo(todoId)
}

// 监听路由查询参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = (newQuery as string) || ''
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen" :style="{ backgroundColor: defaultTheme.value }">
    <!-- 顶部标题区域 -->
    <div class="px-6 pt-8 pb-4">
      <div class="flex items-center gap-3 mb-2">
        <Search class="w-8 h-8" :style="{ color: defaultTheme.textColor }" />
        <h1 class="text-2xl font-bold" :style="{ color: defaultTheme.textColor }">搜索结果</h1>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="px-4 pb-6">
      <div class="rounded-xl p-4 min-h-[calc(100vh-180px)]">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-2 text-gray-500">
            <div
              class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
            ></div>
            <span>正在搜索...</span>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div v-else-if="searchResults.length > 0" class="space-y-2">
          <div
            v-for="result in searchResults"
            :key="`${result.todo.id}-${result.matchType}`"
            class="group relative overflow-hidden flex items-start gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all cursor-pointer border border-transparent hover:border-gray-200"
            @click="handleResultClick(result)"
          >
            <!-- 完成状态圆圈 -->
            <button
              class="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
              :class="
                result.todo.isCompleted
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-400 hover:border-blue-500'
              "
              @click="handleToggleComplete(result.todo.id, $event)"
            >
              <Circle v-if="!result.todo.isCompleted" class="w-full h-full text-transparent" />
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

            <!-- 内容区域 -->
            <div class="flex-1 min-w-0">
              <!-- 任务标题 -->
              <div
                class="text-sm font-medium text-gray-800 mb-1"
                :class="{ 'line-through opacity-60': result.todo.isCompleted }"
                v-html="
                  result.matchType === 'content'
                    ? highlightMatch(result.todo.content)
                    : result.todo.content
                "
              ></div>

              <!-- 匹配的子任务或备注 -->
              <div
                v-if="result.matchType !== 'content'"
                class="text-xs text-gray-500 mb-2 pl-2 border-l-2 border-gray-300"
              >
                <span class="inline-flex items-center gap-1 text-gray-400 mr-1">
                  <component :is="getMatchTypeIcon(result.matchType)" class="w-3 h-3" />
                  {{ getMatchTypeLabel(result.matchType) }}:
                </span>
                <span v-html="highlightMatch(truncateText(result.matchedText, 80))"></span>
              </div>

              <!-- 元信息标签 -->
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <!-- 我的一天标签 -->
                <span
                  v-if="isInMyDay(result.todo)"
                  class="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
                >
                  <Sun class="w-3 h-3" />
                  我的一天
                </span>

                <!-- 所属列表 -->
                <span class="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {{ getListName(result.todo.listId) }}
                </span>

                <!-- 子任务进度 -->
                <span
                  v-if="result.todo.steps.length > 0"
                  class="inline-flex items-center gap-1 text-gray-500"
                >
                  <ListChecks class="w-3 h-3" />
                  {{ result.todo.steps.filter((s) => s.isCompleted).length }}/{{
                    result.todo.steps.length
                  }}
                </span>

                <!-- 截止日期 -->
                <span
                  v-if="result.todo.plannedDate"
                  class="inline-flex items-center gap-1"
                  :class="{
                    'text-red-500': new Date(result.todo.plannedDate) < new Date(),
                    'text-blue-600':
                      new Date(result.todo.plannedDate).toDateString() ===
                      new Date().toDateString(),
                    'text-gray-500':
                      new Date(result.todo.plannedDate) > new Date() &&
                      new Date(result.todo.plannedDate).toDateString() !==
                        new Date().toDateString(),
                  }"
                >
                  <Calendar class="w-3 h-3" />
                  {{
                    new Date(result.todo.plannedDate).toLocaleDateString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }}
                </span>

                <!-- 有备注标识 -->
                <span
                  v-if="result.todo.note && result.matchType !== 'note'"
                  class="inline-flex items-center gap-1 text-gray-400"
                >
                  <FileText class="w-3 h-3" />
                </span>
              </div>
            </div>

            <!-- 重要星标 -->
            <button
              class="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 transition-colors"
              :class="{
                'text-yellow-500': result.todo.isImportant,
                'text-gray-400': !result.todo.isImportant,
              }"
              @click="handleToggleImportant(result.todo.id, $event)"
              title="标记为重要"
            >
              <Star class="w-4 h-4" :fill="result.todo.isImportant ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>

        <!-- 无结果状态 -->
        <div v-else-if="searchQuery" class="text-center py-16">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: defaultTheme.value + '20' }"
          >
            <Search class="w-10 h-10" :style="{ color: defaultTheme.value }" />
          </div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">没有找到相关结果</h3>
          <p class="text-gray-500 text-sm max-w-sm mx-auto">
            尝试使用不同的关键词，或者检查拼写是否正确
          </p>
          <div class="mt-6 text-xs text-gray-400">
            <p>搜索范围包括：</p>
            <p class="mt-1">• 任务标题 • 子任务内容 • 备注内容</p>
          </div>
        </div>

        <!-- 初始状态 -->
        <div v-else class="text-center py-16">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: defaultTheme.value + '20' }"
          >
            <Search class="w-10 h-10" :style="{ color: defaultTheme.value }" />
          </div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">开始搜索</h3>
          <p class="text-gray-500 text-sm max-w-sm mx-auto">
            在侧边栏的搜索框中输入关键词来查找待办事项
          </p>
          <div class="mt-6 text-xs text-gray-400">
            <p>支持搜索：</p>
            <p class="mt-1">• 任务标题 • 子任务内容 • 备注内容</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
