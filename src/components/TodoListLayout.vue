<script setup lang="ts">
import { ref, computed } from 'vue'
import { useListsStore, type ListTheme } from '@/store/lists'
import { THEME_COLORS, getTextColor } from '@/utils/theme'

import Button from '@/components/ui/button/Button.vue'
import { MoreHorizontal, Printer, Trash2 } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps<{
  listId: string
  title: string
  showDate?: boolean
}>()

const listsStore = useListsStore()

const imageOptions = [
  new URL('@/assets/bg/1.png', import.meta.url).href,
  new URL('@/assets/bg/2.png', import.meta.url).href,
  new URL('@/assets/bg/3.png', import.meta.url).href,
]

// Current Theme State
const currentTheme = computed(() => {
  const intelligentList = listsStore.intelligentLists.find((l) => l.id === props.listId)
  if (intelligentList?.theme) return intelligentList.theme

  const customList = listsStore.customLists.find((l) => l.id === props.listId)
  if (customList?.theme) return customList.theme

  return { type: 'color', value: '#f5f5f5' } as ListTheme
})

const backgroundStyle = computed(() => {
  if (currentTheme.value.type === 'color') {
    return { backgroundColor: currentTheme.value.value }
  } else {
    return {
      backgroundImage: `url(${currentTheme.value.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
})

const textColor = computed(() => {
  return getTextColor(currentTheme.value)
})

const setTheme = (type: 'color' | 'image', value: string) => {
  listsStore.updateListTheme(props.listId, { type, value })
}

// Date for "My Day"
const currentDate = ref(new Date())
const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  return currentDate.value.toLocaleDateString('zh-CN', options)
})
</script>

<template>
  <div class="flex flex-col h-screen transition-all duration-300" :style="backgroundStyle">
    <!-- Header -->
    <div class="px-8 pt-8 pb-4 flex items-start justify-between">
      <div class="drop-shadow-md" :style="{ color: textColor }">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <slot name="icon"></slot>
          {{ title }}
        </h1>
        <div v-if="showDate" class="mt-1 text-sm opacity-90">{{ formattedDate }}</div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Settings Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="hover:bg-white/20"
              :style="{ color: textColor }"
            >
              <MoreHorizontal class="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-80">
            <div class="p-2">
              <div class="text-sm font-semibold mb-2">主题</div>
              <div class="grid grid-cols-5 gap-2 mb-4">
                <button
                  v-for="color in THEME_COLORS"
                  :key="color.value"
                  class="w-10 h-10 rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :style="{ backgroundColor: color.value }"
                  :class="
                    currentTheme.type === 'color' && currentTheme.value === color.value
                      ? 'border-black'
                      : 'border-transparent'
                  "
                  @click="setTheme('color', color.value)"
                />
                <button
                  v-for="img in imageOptions"
                  :key="img"
                  class="w-10 h-10 rounded-md border-2 bg-cover bg-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :style="{ backgroundImage: `url(${img})` }"
                  :class="
                    currentTheme.type === 'image' && currentTheme.value === img
                      ? 'border-black'
                      : 'border-transparent'
                  "
                  @click="setTheme('image', img)"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Printer class="mr-2 h-4 w-4" />
              <span>隐藏已完成任务</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive">
              <Trash2 class="mr-2 h-4 w-4" />
              <span>删除列表</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto px-8 pb-8">
      <slot></slot>
    </div>

    <!-- Footer / Input Area -->
    <div class="px-8 pb-8">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
