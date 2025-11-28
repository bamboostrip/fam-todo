<script setup lang="ts">
import { computed } from 'vue'
import { type ListTheme } from '@/store/lists'
import { getTextColor } from '@/utils/theme'

const props = withDefaults(
  defineProps<{
    theme?: ListTheme
    message: string
    imageSrc?: string
  }>(),
  {
    imageSrc: () => new URL('@/assets/bg/todo.png', import.meta.url).href,
  },
)

const textColor = computed(() => getTextColor(props.theme))

const containerClass = computed(() => {
  if (props.theme?.type === 'image') {
    return 'w-[240px] bg-black/70 rounded-xl py-8 px-4 flex flex-col items-center shadow-2xl'
  }
  return 'opacity-80 flex flex-col items-center'
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center text-center">
    <div :class="containerClass">
      <div class="mb-4">
        <img :src="imageSrc" width="128" height="128" alt="" />
      </div>
      <div class="text-sm font-medium max-w-[200px]" :style="{ color: textColor }">
        {{ message }}
      </div>
    </div>
  </div>
</template>
