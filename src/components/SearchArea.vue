<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

// 监听搜索内容变化
watch(searchQuery, (newValue, oldValue) => {
  if (newValue.trim()) {
    // 有内容时跳转到搜索页面
    router.push({
      path: '/search',
      query: {
        q: newValue.trim(),
      },
    })
  } else if (oldValue && !newValue.trim()) {
    // 从有内容变为空时，跳转回上一个页面
    router.back()
  }
})

// 清空搜索框
const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="p-4 border-b">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
      />
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="搜索待办事项..."
        class="pl-10 pr-4 h-9 text-sm bg-background/50 border-muted-foreground/20 focus:border-primary transition-colors"
        @blur="() => {}"
      />
      <!-- 清空按钮 -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="清空搜索"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
