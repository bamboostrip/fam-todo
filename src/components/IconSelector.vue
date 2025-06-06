<script setup lang="ts">
import { ref } from 'vue'
import {
  ListTodo,
  Calendar,
  Star,
  CheckSquare,
  Heart,
  Home,
  Briefcase,
  BookOpen,
  ShoppingCart,
  Coffee,
  Gamepad2,
  Music,
  Camera,
  Target,
  Flag,
  Users,
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface Props {
  currentIcon?: string
  modelValue?: string
  popoverRef?: any // 新增 prop
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'iconSelected', icon: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)

// 可选图标列表
const availableIcons = [
  { name: 'ListTodo', component: ListTodo, label: '列表' },
  { name: 'Calendar', component: Calendar, label: '日历' },
  { name: 'Star', component: Star, label: '星标' },
  { name: 'CheckSquare', component: CheckSquare, label: '复选框' },
  { name: 'Heart', component: Heart, label: '心形' },
  { name: 'Home', component: Home, label: '首页' },
  { name: 'Briefcase', component: Briefcase, label: '公文包' },
  { name: 'BookOpen', component: BookOpen, label: '书本' },
  { name: 'ShoppingCart', component: ShoppingCart, label: '购物车' },
  { name: 'Coffee', component: Coffee, label: '咖啡' },
  { name: 'Gamepad2', component: Gamepad2, label: '游戏' },
  { name: 'Music', component: Music, label: '音乐' },
  { name: 'Camera', component: Camera, label: '相机' },
  { name: 'Target', component: Target, label: '目标' },
  { name: 'Flag', component: Flag, label: '旗帜' },
  { name: 'Users', component: Users, label: '用户' },
]

// 获取当前图标组件
const getCurrentIcon = () => {
  const iconName = props.currentIcon || props.modelValue || 'ListTodo'
  return availableIcons.find((icon) => icon.name === iconName)?.component || ListTodo
}

// 选择图标
const selectIcon = (iconName: string) => {
  emit('update:modelValue', iconName)
  emit('iconSelected', iconName)
  isOpen.value = false
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" class="w-8 h-8 p-0 hover:bg-accent cursor-pointer">
        <component :is="getCurrentIcon()" class="w-4 h-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-2" align="start" :ref="popoverRef">
      <div class="grid grid-cols-4 gap-1">
        <Button
          v-for="icon in availableIcons"
          :key="icon.name"
          variant="ghost"
          size="sm"
          class="w-12 h-12 p-0 hover:bg-accent"
          :class="{ 'bg-accent': (props.currentIcon || props.modelValue) === icon.name }"
          @click="selectIcon(icon.name)"
          :title="icon.label"
        >
          <component :is="icon.component" class="w-5 h-5" />
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
