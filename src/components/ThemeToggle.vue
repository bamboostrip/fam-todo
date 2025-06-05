<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useThemeStore, type ThemeMode } from '@/store/theme'

interface Props {
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'icon',
  variant: 'ghost',
  showText: false,
})

const themeStore = useThemeStore()

const getThemeIcon = (mode: ThemeMode) => {
  switch (mode) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'system':
      return Monitor
  }
}

const getThemeLabel = (mode: ThemeMode) => {
  switch (mode) {
    case 'light':
      return '浅色主题'
    case 'dark':
      return '深色主题'
    case 'system':
      return '跟随系统'
  }
}

const currentIcon = computed(() => getThemeIcon(themeStore.mode))
const currentLabel = computed(() => getThemeLabel(themeStore.mode))
</script>

<template>
  <Button
    :size="size"
    :variant="variant"
    @click="themeStore.toggleTheme"
    :title="currentLabel"
    class="transition-all duration-200"
  >
    <component
      :is="currentIcon"
      class="h-4 w-4 transition-transform duration-200 hover:scale-110"
    />
    <span v-if="showText" class="ml-2">{{ currentLabel }}</span>
  </Button>
</template>
