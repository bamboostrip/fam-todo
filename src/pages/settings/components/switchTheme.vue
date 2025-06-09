<template>
  <div>
    <div class="tit mb-2">主题</div>
    <RadioGroup v-model="currentMode" class="space-y-2" @update:model-value="setTheme">
      <div v-for="option in themeOptions" :key="option.value" class="flex items-center space-x-2">
        <RadioGroupItem :value="option.value" :id="option.value" />
        <Label :for="option.value" class="flex items-center">
          {{ option.label }}
        </Label>
      </div>
    </RadioGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useThemeStore, type ThemeMode } from '@/store/theme'

const themeStore = useThemeStore()

const themeOptions = [
  { value: 'light', label: '浅色主题', icon: Sun },
  { value: 'dark', label: '深色主题', icon: Moon },
  { value: 'system', label: '使用我的系统主题', icon: Monitor },
]

// 用于双向绑定RadioGroup
const currentMode = ref<ThemeMode>(themeStore.mode)

watch(
  () => themeStore.mode,
  (val) => {
    if (val !== currentMode.value) currentMode.value = val
  },
)

function setTheme(mode: string) {
  const themeMode = mode as ThemeMode
  if (themeStore.mode !== themeMode) {
    themeStore.setMode(themeMode)
  }
}
</script>
