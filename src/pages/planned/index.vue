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
  <TodoListLayout
    listId="planned"
    title="计划内"
    :hasCompletedTodos="completedPlannedTodos.length > 0"
    v-model:showCompleted="showCompletedTodos"
  >
    <template #icon>
      <Calendar class="w-8 h-8" />
    </template>

    <div
      v-if="allPlannedLikeTodos.length > 0 || completedPlannedTodos.length > 0"
      class="space-y-4"
    >
      <!-- 先前（早于昨天） -->
      <div v-if="priorTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showPrior = !showPrior"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showPrior ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            先前
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ priorTodos.length }}
          </span>
        </button>
        <div v-show="showPrior" class="space-y-1">
          <TodoItem
            v-for="todo in priorTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 昨天 -->
      <div v-if="yesterdayTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showYesterday = !showYesterday"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showYesterday ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            昨天
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ yesterdayTodos.length }}
          </span>
        </button>
        <div v-show="showYesterday" class="space-y-1">
          <TodoItem
            v-for="todo in yesterdayTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 今天 -->
      <div v-if="todayTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showToday = !showToday"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showToday ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            今天
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ todayTodos.length }}
          </span>
        </button>
        <div v-show="showToday" class="space-y-1">
          <TodoItem
            v-for="todo in todayTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 明天 -->
      <div v-if="tomorrowTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showTomorrow = !showTomorrow"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showTomorrow ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            明天
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ tomorrowTodos.length }}
          </span>
        </button>
        <div v-show="showTomorrow" class="space-y-1">
          <TodoItem
            v-for="todo in tomorrowTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 后天开始往后5天（范围展示） -->
      <div v-if="nextFiveDaysTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showNextFiveDays = !showNextFiveDays"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showNextFiveDays ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            {{ nextFiveDaysRangeLabel }}
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ nextFiveDaysTodos.length }}
          </span>
        </button>
        <div v-show="showNextFiveDays" class="space-y-1">
          <TodoItem
            v-for="todo in nextFiveDaysTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 稍后（比后天起5天更晚） -->
      <div v-if="laterTodos.length > 0" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showLater = !showLater"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showLater ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            稍后
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ laterTodos.length }}
          </span>
        </button>
        <div v-show="showLater" class="space-y-1">
          <TodoItem
            v-for="todo in laterTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- 已完成分组 - 根据 showCompletedTodos 控制是否显示整个分组 -->
      <div v-if="completedPlannedTodos.length > 0 && showCompletedTodos" class="space-y-2">
        <button
          class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors"
          @click="showCompletedSection = !showCompletedSection"
        >
          <span class="inline-flex items-center gap-1" :style="accentStyle">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="showCompletedSection ? '6 9 12 15 18 9' : '9 6 15 12 9 18'" />
            </svg>
            已完成
          </span>
          <span class="text-xs rounded px-1.5 py-0.5" :style="accentStyle">
            {{ completedPlannedTodos.length }}
          </span>
        </button>
        <div v-show="showCompletedSection" class="space-y-1">
          <TodoItem
            v-for="todo in completedPlannedTodos"
            :key="todo.id"
            :todo-id="todo.id"
            @delete="handleDelete"
          />
        </div>
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
import type { Todo } from '@/types/todo'
import { getTextColor } from '@/utils/theme'

const listsStore = useListsStore()
const todosStore = useTodosStore()

const currentTheme = computed(() => {
  return listsStore.intelligentLists.find((l) => l.id === 'planned')?.theme
})

const accentColor = computed(() => getTextColor(currentTheme.value))

const accentStyle = computed(() => {
  const color = accentColor.value
  // 如果是白色文字，改用黑色避免白底白字
  const finalColor =
    color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff' ? '#000000' : color
  return { color: finalColor }
})

// 工具：本地日期处理
const startOfLocalDay = (d: Date) => {
  const nd = new Date(d)
  nd.setHours(0, 0, 0, 0)
  return nd
}

const parseToLocalDate = (dateString: string) => {
  if (dateString.includes('T')) return startOfLocalDay(new Date(dateString))
  const [y, m, d] = dateString.split('-').map((n) => parseInt(n))
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
}

// 今天零点（本地）
const today = startOfLocalDay(new Date())
const msDay = 86400000

const addDays = (base: Date, n: number) => {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n)
}

const weekdayZh = (d: Date) => {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

const fmtRangeLabel = (start: Date, end: Date) => {
  const s = `${start.getMonth() + 1}月${start.getDate()}日, ${weekdayZh(start)}`
  const e = `${end.getMonth() + 1}月${end.getDate()}日, ${weekdayZh(end)}`
  return `${s} - ${e}`
}

// 所有属于“计划内”视图的任务：有截止日期 / 有提醒
const allPlannedLikeTodos = computed(() => {
  return todosStore.todos.filter(
    (t) => !t.isCompleted && (t.plannedDate != null || t.reminderTime != null),
  )
})

// 取用于分组的“有效日期”：优先 plannedDate，否则取 reminderTime 的日期部分
const effectiveDate = (t: Todo) => {
  if (t.plannedDate) return parseToLocalDate(t.plannedDate)
  if (t.reminderTime) return startOfLocalDay(new Date(t.reminderTime))
  return null
}

const byDayDiff = (target: number | [number, number] | 'lt' | 'gt'): Todo[] => {
  const base = allPlannedLikeTodos.value as unknown as Todo[]
  const list: { t: Todo; d: Date }[] = base
    .map((t: Todo) => ({ t, d: effectiveDate(t) }))
    .filter((x: { t: Todo; d: Date | null }): x is { t: Todo; d: Date } => x.d !== null)

  const withDiff = list.map(({ t, d }) => ({
    t,
    diff: Math.floor((d.getTime() - today.getTime()) / msDay),
  }))

  const filtered = withDiff.filter((x) => {
    if (Array.isArray(target)) return x.diff >= target[0] && x.diff <= target[1]
    if (target === 'lt') return x.diff <= -2 // 先前：早于昨天
    if (target === 'gt') return x.diff >= 7 // 稍后：晚于后天起5天
    return x.diff === target
  })

  return filtered
    .sort((a, b) => a.diff - b.diff || a.t.createdAt.localeCompare(b.t.createdAt))
    .map((x) => x.t)
}

const priorTodos = computed(() => byDayDiff('lt'))
const yesterdayTodos = computed(() => byDayDiff(-1))
const todayTodos = computed(() => byDayDiff(0))
const tomorrowTodos = computed(() => byDayDiff(1))
// 后天(+2) 到 +6 共5天
const nextFiveDaysTodos = computed(() => byDayDiff([2, 6]))
const laterTodos = computed(() => byDayDiff('gt'))

const nextFiveDaysRangeLabel = computed(() => {
  const s = addDays(today, 2)
  const e = addDays(today, 6)
  return fmtRangeLabel(s, e)
})

// 已完成的计划内任务（有截止日期或提醒时间且已完成的任务）
const completedPlannedTodos = computed(() => {
  return todosStore.completedTodos.filter((t) => t.plannedDate != null || t.reminderTime != null)
})

// 是否显示已完成任务分组（由 TodoListLayout 的设置菜单控制，默认隐藏）
const showCompletedTodos = ref(false)
// 已完成任务分组是否展开（手风琴控制）
const showCompletedSection = ref(false)

// 折叠开关
const showPrior = ref(false)
const showYesterday = ref(false)
const showToday = ref(true)
const showTomorrow = ref(true)
const showNextFiveDays = ref(true)
const showLater = ref(true)

const handleDelete = (id: string) => {
  todosStore.deleteTodo(id)
}

const handleTodoAdded = () => {
  // 可以在这里添加额外的逻辑
}
</script>
