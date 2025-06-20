<route lang="json5">
{
  name: 'home',
  meta: {
    requiresAuth: true,
  },
  layout: 'other',
}
</route>
<template>
  <div class="px-4 py-4 min-h-screen transition-all duration-300" :style="backgroundStyle">
    <div class="header-top flex items-center justify-between mb-4 mt-5">
      <div>
        <div class="font-bold text-2xl">我的一天</div>
        <div>{{ formattedDate }}</div>
      </div>
      <div>
        <!-- 切换按钮 + Popover -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline">切换</Button>
          </PopoverTrigger>
          <PopoverContent class="w-64">
            <div class="mb-2 font-semibold">选择背景</div>
            <div class="flex gap-2 mb-2">
              <div
                v-for="color in colorOptions"
                :key="color.value"
                :style="{ background: color.value }"
                class="w-8 h-8 rounded cursor-pointer border-2 flex-shrink-0"
                :class="
                  backgroundType === 'color' && backgroundValue === color.value
                    ? 'border-blue-500'
                    : 'border-transparent'
                "
                @click="setBackground('color', color.value)"
              ></div>
            </div>
            <div class="flex gap-2">
              <div
                v-for="img in imageOptions"
                :key="img"
                class="w-12 h-8 rounded cursor-pointer border-2 bg-cover bg-center flex-shrink-0"
                :style="{ backgroundImage: `url(${img})` }"
                :class="
                  backgroundType === 'image' && backgroundValue === img
                    ? 'border-blue-500'
                    : 'border-transparent'
                "
                @click="setBackground('image', img)"
              ></div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRequest } from 'alova/client'
import { toast } from 'vue-sonner'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/utils/db'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import Button from '@/components/ui/button/Button.vue'

// 背景选项
const colorOptions = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Black', value: '#18181b' },
]
const imageOptions = [
  new URL('@/assets/bg/1.png', import.meta.url).href,
  new URL('@/assets/bg/2.png', import.meta.url).href,
  new URL('@/assets/bg/3.png', import.meta.url).href,
]

const backgroundType = ref<'color' | 'image'>('color')
const backgroundValue = ref(colorOptions[0].value)

const setBackground = (type: 'color' | 'image', value: string) => {
  backgroundType.value = type
  backgroundValue.value = value
}

const backgroundStyle = computed(() => {
  if (backgroundType.value === 'color') {
    return { background: backgroundValue.value }
  } else {
    return {
      background: `url(${backgroundValue.value}) center/cover no-repeat`,
    }
  }
})

// 当前时间 展示 X月XX日,星期X
const currentDate = ref(new Date())
const formattedDate = ref('')
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  return date.toLocaleDateString('zh-CN', options)
}
formattedDate.value = formatDate(currentDate.value)

async function addNewTodo(title: string, listId: string) {
  const newTodo = {
    // 关键：在这里手动生成并提供 UUID
    id: uuidv4(),
    title,
    listId,
    isDone: false,
    createdAt: new Date(),
    completedAt: null,
    isImportant: false,
    myDay: null,
    dueDate: null,
    recurrenceRule: null,
  }

  try {
    // 使用 add() 方法将新对象存入数据库
    await db.todos.add(newTodo)
    console.log(`Todo "${title}" added successfully!`)
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}
</script>
