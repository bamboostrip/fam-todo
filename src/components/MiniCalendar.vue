<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  modelValue?: Date | null
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date | null]
  confirm: [date: Date | null]
  cancel: []
}>()

// 当前显示的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-11

// 初始化时同步 props
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentYear.value = val.getFullYear()
      currentMonth.value = val.getMonth()
    }
  },
  { immediate: true },
)

// 生成日历网格
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const firstDayOfWeek = firstDay.getDay() // 0=周日
  const daysInMonth = lastDay.getDate()

  const days: Array<{ date: number; isCurrentMonth: boolean; fullDate: Date }> = []

  // 填充上月末尾几天
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      fullDate: new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
    })
  }

  // 填充本月
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(currentYear.value, currentMonth.value, i),
    })
  }

  // 填充下月开头几天，凑满6行
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(currentYear.value, currentMonth.value + 1, i),
    })
  }

  return days
})

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSelected = (date: Date) => {
  if (!props.modelValue) return false
  return (
    date.getDate() === props.modelValue.getDate() &&
    date.getMonth() === props.modelValue.getMonth() &&
    date.getFullYear() === props.modelValue.getFullYear()
  )
}

const selectDate = (day: { date: number; isCurrentMonth: boolean; fullDate: Date }) => {
  const selected = new Date(day.fullDate)
  selected.setHours(0, 0, 0, 0)
  emit('update:modelValue', selected)
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const cancel = () => {
  emit('cancel')
}

const confirm = () => {
  emit('confirm', props.modelValue || null)
}
</script>

<template>
  <div class="bg-white p-2 w-64" @click.stop>
    <!-- 年月选择器 -->
    <div class="flex items-center justify-between mb-4">
      <button class="p-1 hover:bg-gray-100 rounded transition" @click="prevMonth">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="text-base font-medium">{{ currentYear }}年{{ currentMonth + 1 }}月</div>
      <button class="p-1 hover:bg-gray-100 rounded transition" @click="nextMonth">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="h-8 text-sm rounded transition flex items-center justify-center"
        :class="{
          'text-gray-400': !day.isCurrentMonth,
          'text-gray-800': day.isCurrentMonth,
          'bg-blue-600 text-white font-semibold': isSelected(day.fullDate),
          'border-2 border-blue-600': isToday(day.fullDate) && !isSelected(day.fullDate),
          'hover:bg-gray-100': day.isCurrentMonth && !isSelected(day.fullDate),
        }"
        @click="selectDate(day)"
      >
        {{ day.date }}
      </button>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
      <Button variant="ghost" size="sm" @click="cancel">取消</Button>
      <Button size="sm" @click="confirm">保存</Button>
    </div>
  </div>
</template>
