<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodosStore, type RecurrenceRule, type RecurrenceType } from '@/store/todos'
import { useListsStore } from '@/store/lists'
import { Circle, Plus, Star, Calendar, Repeat, Check, Bell } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DatePicker from '@/components/DatePicker.vue'
import * as LucideIcons from 'lucide-vue-next'

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
const listsStore = useListsStore()
const inputValue = ref('')
const isFocused = ref(false)
const isImportant = ref(false)
const selectedDate = ref<Date | null>(null)
const isDatePickerOpen = ref(false)
const showDateOptions = ref(false)
const showListOptions = ref(false)
const selectedListId = ref('tasks')
const selectedRecurrence = ref<RecurrenceRule | null>(null)
const customRecurrenceOpen = ref(false)
const customInterval = ref(1)
const customType = ref<RecurrenceType>('daily')
const selectedWeekdays = ref<number[]>([])

// 提醒功能相关状态
const selectedReminder = ref<Date | null>(null)
const customReminderOpen = ref(false)
const reminderHour = ref('9')
const reminderMinute = ref('0')
const reminderCalendarYear = ref(new Date().getFullYear())
const reminderCalendarMonth = ref(new Date().getMonth())

// 获取所有可用的列表（包括系统列表和自定义列表）
const availableLists = computed(() => {
  // 只显示"任务"列表和用户自定义列表
  const tasksList = listsStore.intelligentLists.find((list) => list.id === 'tasks')
  const lists = tasksList ? [tasksList] : []
  return [...lists, ...listsStore.customLists]
})

// 获取当前选中列表的信息
const selectedList = computed(() => {
  return (
    availableLists.value.find((list) => list.id === selectedListId.value) || availableLists.value[0]
  )
})

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return (LucideIcons as any)[iconName] || Circle
}

// 重复规则标签
const recurrenceLabel = computed(() => {
  if (!selectedRecurrence.value) return ''
  const { type, interval = 1, daysOfWeek } = selectedRecurrence.value

  if (type === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
    const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const days = daysOfWeek.map((d) => weekdayNames[d]).join(', ')
    return interval === 1 ? `每周 ${days}` : `每 ${interval} 周 ${days}`
  }

  const labels: Record<RecurrenceType, string> = {
    daily: interval === 1 ? '每天' : `每 ${interval} 天`,
    weekdays: '工作日',
    weekly: interval === 1 ? '每周' : `每 ${interval} 周`,
    monthly: interval === 1 ? '每月' : `每 ${interval} 月`,
    yearly: interval === 1 ? '每年' : `每 ${interval} 年`,
  }
  return labels[type]
})

// 提醒标签
const reminderLabel = computed(() => {
  if (!selectedReminder.value) return ''

  const reminderDate = selectedReminder.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const reminderDay = new Date(reminderDate)
  reminderDay.setHours(0, 0, 0, 0)

  const hour = reminderDate.getHours()
  const minute = reminderDate.getMinutes()
  const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`

  // 判断是今天、明天还是其他日期
  if (reminderDay.getTime() === today.getTime()) {
    return `今天 ${timeStr}`
  } else if (reminderDay.getTime() === tomorrow.getTime()) {
    return `明天 ${timeStr}`
  } else {
    const month = reminderDate.getMonth() + 1
    const date = reminderDate.getDate()
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][reminderDate.getDay()]
    return `${month}月${date}日, ${weekDay} ${timeStr}`
  }
})

// 计算"今日晚些时候"选项
const laterTodayOption = computed(() => {
  const now = new Date()
  const currentHour = now.getHours()

  // 00:00 ~ 08:59: 今日上午 (09:00)
  if (currentHour < 9) {
    return {
      label: '今日上午',
      time: '9:00',
      hour: 9,
      minute: 0,
    }
  }
  // 09:00 ~ 12:59: 今日下午 (13:00)
  else if (currentHour < 13) {
    return {
      label: '今日下午',
      time: '13:00',
      hour: 13,
      minute: 0,
    }
  }
  // 13:00 ~ 16:59: 今日傍晚 (17:00)
  else if (currentHour < 17) {
    return {
      label: '今日傍晚',
      time: '17:00',
      hour: 17,
      minute: 0,
    }
  }
  // 17:00 ~ 23:59: 隐藏选项
  return null
})

// 生成提醒日历网格
const reminderCalendarDays = computed(() => {
  const firstDay = new Date(reminderCalendarYear.value, reminderCalendarMonth.value, 1)
  const lastDay = new Date(reminderCalendarYear.value, reminderCalendarMonth.value + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: Array<{ date: number; isCurrentMonth: boolean; fullDate: Date }> = []

  // 填充上月末尾几天
  const prevMonthLastDay = new Date(
    reminderCalendarYear.value,
    reminderCalendarMonth.value,
    0,
  ).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      fullDate: new Date(
        reminderCalendarYear.value,
        reminderCalendarMonth.value - 1,
        prevMonthLastDay - i,
      ),
    })
  }

  // 填充本月
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(reminderCalendarYear.value, reminderCalendarMonth.value, i),
    })
  }

  // 填充下月开头几天
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(reminderCalendarYear.value, reminderCalendarMonth.value + 1, i),
    })
  }

  return days
})

const handleAddTodo = () => {
  const content = inputValue.value.trim()
  if (content) {
    // 构建 options 对象
    const options: any = {}
    if (isImportant.value) {
      options.isImportant = true
    }
    if (selectedDate.value) {
      options.plannedDate = formatDate(selectedDate.value)
    }
    if (selectedRecurrence.value) {
      options.recurrence = selectedRecurrence.value
    }
    if (selectedReminder.value) {
      options.reminderTime = selectedReminder.value
    }
    // 设置所属列表
    if (selectedListId.value !== 'tasks') {
      options.listId = selectedListId.value
    }

    // 根据上下文决定使用哪个方法创建任务
    switch (props.context) {
      case 'my-day':
        // 在"我的一天"视图创建：myDayDate = Today, listId = tasks
        todosStore.addTodoToMyDay(content, options)
        break
      case 'important':
        // 在"重要"视图创建：isImportant = true, listId = tasks
        todosStore.addImportantTodo(content, options)
        break
      case 'planned':
        // 在"计划内"视图创建：plannedDate = Today, listId = tasks
        todosStore.addPlannedTodo(content, selectedDate.value || undefined, options)
        break
      case 'custom-list':
        // 在自定义列表视图创建：listId = 当前列表ID
        if (props.listId) {
          todosStore.addTodoToList(content, props.listId, options)
        } else {
          todosStore.addTodo(content, options)
        }
        break
      case 'tasks':
      default:
        // 在"任务"视图创建：普通任务，无特殊属性
        todosStore.addTodo(content, options)
        break
    }
    inputValue.value = ''
    isImportant.value = false
    selectedDate.value = null
    selectedRecurrence.value = null
    selectedReminder.value = null
    selectedListId.value = 'tasks' // 重置为默认列表
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

const toggleImportant = () => {
  isImportant.value = !isImportant.value
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekday = (date: Date): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

const todayWeekday = ref(getWeekday(new Date()))
const tomorrowWeekday = ref(getWeekday(new Date(Date.now() + 86400000)))

const setToday = () => {
  selectedDate.value = new Date()
  showDateOptions.value = false
}

const setTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  selectedDate.value = tomorrow
  showDateOptions.value = false
}

const openCustomDatePicker = () => {
  showDateOptions.value = false
  isDatePickerOpen.value = true
}

const handleDateConfirm = (date: Date | null) => {
  selectedDate.value = date
  isDatePickerOpen.value = false
}

const selectList = (listId: string) => {
  selectedListId.value = listId
  showListOptions.value = false
}

// 重复功能
const handleSetRecurrence = (type: RecurrenceType, interval: number = 1) => {
  selectedRecurrence.value = { type, interval }
}

const handleOpenCustomRecurrence = () => {
  if (selectedRecurrence.value) {
    customType.value = selectedRecurrence.value.type
    customInterval.value = selectedRecurrence.value.interval || 1
    selectedWeekdays.value = selectedRecurrence.value.daysOfWeek || []
  } else {
    customType.value = 'daily'
    customInterval.value = 1
    selectedWeekdays.value = []
  }
  customRecurrenceOpen.value = true
}

const toggleWeekday = (day: number) => {
  const index = selectedWeekdays.value.indexOf(day)
  if (index > -1) {
    selectedWeekdays.value.splice(index, 1)
  } else {
    selectedWeekdays.value.push(day)
  }
  selectedWeekdays.value.sort((a, b) => a - b)
}

const handleSaveCustomRecurrence = () => {
  const recurrence: RecurrenceRule = {
    type: customType.value,
    interval: customInterval.value,
  }

  if (customType.value === 'weekly' && selectedWeekdays.value.length > 0) {
    recurrence.daysOfWeek = selectedWeekdays.value
  }

  selectedRecurrence.value = recurrence
  customRecurrenceOpen.value = false
}

// 提醒功能方法
const isReminderToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isReminderDateSelected = (date: Date) => {
  if (!selectedReminder.value) return false
  return (
    date.getDate() === selectedReminder.value.getDate() &&
    date.getMonth() === selectedReminder.value.getMonth() &&
    date.getFullYear() === selectedReminder.value.getFullYear()
  )
}

const selectReminderDate = (day: { date: number; isCurrentMonth: boolean; fullDate: Date }) => {
  const selected = new Date(day.fullDate)
  selected.setHours(0, 0, 0, 0)
  // 如果之前有选择时间，保留时间部分
  if (selectedReminder.value) {
    selected.setHours(selectedReminder.value.getHours(), selectedReminder.value.getMinutes())
  } else {
    // 默认上午9点
    selected.setHours(9, 0)
  }
  selectedReminder.value = selected
  // 更新输入框显示
  reminderHour.value = selected.getHours().toString()
  reminderMinute.value = selected.getMinutes().toString()
}

const handlePrevMonth = () => {
  if (reminderCalendarMonth.value === 0) {
    reminderCalendarMonth.value = 11
    reminderCalendarYear.value--
  } else {
    reminderCalendarMonth.value--
  }
}

const handleNextMonth = () => {
  if (reminderCalendarMonth.value === 11) {
    reminderCalendarMonth.value = 0
    reminderCalendarYear.value++
  } else {
    reminderCalendarMonth.value++
  }
}

const handleSetLaterToday = () => {
  if (!laterTodayOption.value) return
  const reminderTime = new Date()
  reminderTime.setHours(laterTodayOption.value.hour, laterTodayOption.value.minute, 0, 0)
  selectedReminder.value = reminderTime
}

const handleSetReminderTomorrow = () => {
  const reminderTime = new Date()
  reminderTime.setDate(reminderTime.getDate() + 1)
  reminderTime.setHours(9, 0, 0, 0)
  selectedReminder.value = reminderTime
}

const handleSetReminderNextWeek = () => {
  const reminderTime = new Date()
  const day = reminderTime.getDay()
  // 计算下周一
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day
  reminderTime.setDate(reminderTime.getDate() + daysUntilNextMonday)
  reminderTime.setHours(9, 0, 0, 0)
  selectedReminder.value = reminderTime
}

const handleOpenCustomReminder = () => {
  if (selectedReminder.value) {
    const existing = new Date(selectedReminder.value)
    reminderHour.value = existing.getHours().toString()
    reminderMinute.value = existing.getMinutes().toString()
    reminderCalendarYear.value = existing.getFullYear()
    reminderCalendarMonth.value = existing.getMonth()
  } else {
    const now = new Date()
    reminderHour.value = '9'
    reminderMinute.value = '0'
    reminderCalendarYear.value = now.getFullYear()
    reminderCalendarMonth.value = now.getMonth()
  }
  setTimeout(() => {
    customReminderOpen.value = true
  }, 200)
}

const handleConfirmCustomReminder = () => {
  // 如果没有选择日期，默认今天
  const baseDate = selectedReminder.value || new Date()

  const reminderTime = new Date(baseDate)
  const hour = parseInt(reminderHour.value) || 0
  const minute = parseInt(reminderMinute.value) || 0
  reminderTime.setHours(hour, minute, 0, 0)

  selectedReminder.value = reminderTime
  customReminderOpen.value = false
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

    <!-- 操作按钮 - 输入时始终显示在右侧 -->
    <div v-show="isFocused || inputValue" class="flex items-center gap-2 flex-shrink-0">
      <!-- 列表选择按钮 -->
      <Popover v-model:open="showListOptions">
        <PopoverTrigger as-child>
          <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="选择列表">
            <component
              :is="getIconComponent(selectedList?.icon || 'Home')"
              :class="['w-4 h-4', selectedListId !== 'tasks' ? 'text-blue-500' : 'text-gray-600']"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-52 p-2" align="end">
          <div class="flex flex-col gap-1">
            <button
              v-for="list in availableLists"
              :key="list.id"
              class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              @click="selectList(list.id)"
            >
              <component
                :is="getIconComponent(list.icon || 'Home')"
                class="w-4 h-4 text-gray-600 flex-shrink-0"
              />
              <div class="flex-1 text-sm font-medium truncate">{{ list.name }}</div>
              <Check
                v-if="selectedListId === list.id"
                class="w-4 h-4 text-blue-500 flex-shrink-0"
              />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 星标按钮 -->
      <button
        class="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="标记为重要"
        @click="toggleImportant"
      >
        <Star
          :class="[
            'w-4 h-4 transition-colors',
            isImportant ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600',
          ]"
        />
      </button>

      <!-- 日历按钮 - 带下拉菜单 -->
      <Popover v-model:open="showDateOptions">
        <PopoverTrigger as-child>
          <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="添加截止日期">
            <Calendar :class="['w-4 h-4', selectedDate ? 'text-blue-500' : 'text-gray-600']" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-48 p-2" align="end">
          <div class="flex flex-col gap-1">
            <button
              class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              @click="setToday"
            >
              <Calendar class="w-4 h-4 text-blue-500" />
              <div class="flex-1">
                <div class="text-sm font-medium">今天</div>
                <div class="text-xs text-gray-500">{{ todayWeekday }}</div>
              </div>
            </button>
            <button
              class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              @click="setTomorrow"
            >
              <Calendar class="w-4 h-4 text-green-500" />
              <div class="flex-1">
                <div class="text-sm font-medium">明天</div>
                <div class="text-xs text-gray-500">{{ tomorrowWeekday }}</div>
              </div>
            </button>
            <div class="h-px bg-gray-200 my-1"></div>
            <button
              class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              @click="openCustomDatePicker"
            >
              <Calendar class="w-4 h-4 text-gray-600" />
              <div class="text-sm font-medium">选择日期</div>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 提醒按钮 -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="p-1.5 rounded hover:bg-gray-100 transition-colors"
            :title="reminderLabel || '提醒我'"
          >
            <Bell :class="['w-4 h-4', selectedReminder ? 'text-blue-500' : 'text-gray-600']" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="end">
          <DropdownMenuItem v-if="laterTodayOption" @click="handleSetLaterToday">
            <Bell class="mr-2 h-4 w-4" />
            <span>{{ laterTodayOption.label }}</span>
            <span class="ml-auto text-xs text-gray-500">{{ laterTodayOption.time }}</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetReminderTomorrow">
            <Bell class="mr-2 h-4 w-4" />
            <span>明天</span>
            <span class="ml-auto text-xs text-gray-500">9:00</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetReminderNextWeek">
            <Bell class="mr-2 h-4 w-4" />
            <span>下周</span>
            <span class="ml-auto text-xs text-gray-500">周一, 9:00</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleOpenCustomReminder">
            <Calendar class="mr-2 h-4 w-4" />
            <span>选择日期和时间</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- 重复按钮 -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="p-1.5 rounded hover:bg-gray-100 transition-colors"
            :title="recurrenceLabel || '重复'"
          >
            <Repeat :class="['w-4 h-4', selectedRecurrence ? 'text-blue-500' : 'text-gray-600']" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="end">
          <DropdownMenuItem @click="handleSetRecurrence('daily', 1)">
            <Repeat class="mr-2 h-4 w-4" />
            <span>每天</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetRecurrence('weekdays', 1)">
            <Repeat class="mr-2 h-4 w-4" />
            <span>工作日</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetRecurrence('weekly', 1)">
            <Repeat class="mr-2 h-4 w-4" />
            <span>每周</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetRecurrence('monthly', 1)">
            <Repeat class="mr-2 h-4 w-4" />
            <span>每月</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSetRecurrence('yearly', 1)">
            <Repeat class="mr-2 h-4 w-4" />
            <span>每年</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleOpenCustomRecurrence">
            <Repeat class="mr-2 h-4 w-4" />
            <span>自定义</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- 自定义日期选择器弹窗 -->
    <DatePicker
      v-model="selectedDate"
      v-model:open="isDatePickerOpen"
      @confirm="handleDateConfirm"
    />

    <!-- 自定义重复对话框 -->
    <Dialog v-model:open="customRecurrenceOpen">
      <DialogContent class="sm:max-w-md z-[103]">
        <DialogHeader>
          <DialogTitle>重复周期...</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="flex items-center gap-4">
            <Input v-model.number="customInterval" type="number" min="1" class="w-20" />
            <select
              v-model="customType"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">天</option>
              <option value="weekly">周</option>
              <option value="monthly">月</option>
              <option value="yearly">年</option>
            </select>
          </div>

          <!-- 周重复时显示星期选择 -->
          <div v-if="customType === 'weekly'" class="space-y-2">
            <div class="text-sm text-gray-600">选择星期</div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="(day, index) in ['周日', '周一', '周二', '周三', '周四', '周五', '周六']"
                :key="index"
                type="button"
                class="px-3 py-2 rounded-md border text-sm transition-colors"
                :class="
                  selectedWeekdays.includes(index)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                "
                @click="toggleWeekday(index)"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="customRecurrenceOpen = false">取消</Button>
          <Button @click="handleSaveCustomRecurrence">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 自定义提醒时间选择器 -->
    <Popover v-model:open="customReminderOpen">
      <PopoverTrigger class="absolute bottom-0 left-0 w-full h-0 opacity-0 pointer-events-none" />
      <PopoverContent class="w-auto p-0 z-[102]" align="end" side="top" :side-offset="10">
        <div class="bg-white">
          <!-- 日历部分 -->
          <div class="p-4 pb-3">
            <div class="bg-white w-64">
              <!-- 年月选择器 -->
              <div class="flex items-center justify-between mb-4">
                <button class="p-1 hover:bg-gray-100 rounded transition" @click="handlePrevMonth">
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div class="text-base font-medium">
                  {{ reminderCalendarYear }}年{{ reminderCalendarMonth + 1 }}月
                </div>
                <button class="p-1 hover:bg-gray-100 rounded transition" @click="handleNextMonth">
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <!-- 星期标题 -->
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div
                  v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
                  :key="day"
                  class="text-center text-xs text-gray-600 font-medium h-8 flex items-center justify-center"
                >
                  {{ day }}
                </div>
              </div>

              <!-- 日期网格 -->
              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="(day, idx) in reminderCalendarDays"
                  :key="idx"
                  class="h-8 text-sm rounded transition flex items-center justify-center"
                  :class="{
                    'text-gray-400': !day.isCurrentMonth,
                    'text-gray-800': day.isCurrentMonth,
                    'bg-blue-600 text-white font-semibold': isReminderDateSelected(day.fullDate),
                    'border-2 border-blue-600':
                      isReminderToday(day.fullDate) && !isReminderDateSelected(day.fullDate),
                    'hover:bg-gray-100':
                      day.isCurrentMonth && !isReminderDateSelected(day.fullDate),
                  }"
                  @click="selectReminderDate(day)"
                >
                  {{ day.date }}
                </button>
              </div>
            </div>
          </div>

          <!-- 时间选择 -->
          <div class="px-4 pb-3 border-t pt-3">
            <div class="flex items-center justify-center gap-2">
              <Input
                v-model="reminderHour"
                type="number"
                min="0"
                max="23"
                class="w-16 text-center text-lg font-medium"
                placeholder="09"
              />
              <span class="text-lg text-gray-500 font-medium">:</span>
              <Input
                v-model="reminderMinute"
                type="number"
                min="0"
                max="59"
                class="w-16 text-center text-lg font-medium"
                placeholder="00"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-end gap-2 px-4 pb-4 pt-3 border-t">
            <Button variant="ghost" size="sm" @click="customReminderOpen = false">取消</Button>
            <Button size="sm" @click="handleConfirmCustomReminder">保存</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
