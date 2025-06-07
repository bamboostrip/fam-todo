<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

// 记录进入搜索前的页面路径
let previousNonSearchPath = '/'

// 监听路由变化，记录非搜索页面的路径
watch(
  () => route.path,
  (newPath) => {
    if (newPath !== '/search') {
      previousNonSearchPath = newPath
    }
  },
  { immediate: true },
)

// 监听搜索内容变化
watch(searchQuery, (newValue, oldValue) => {
  console.log('newValue: ', newValue)
  if (newValue.trim()) {
    // 有内容时跳转到搜索页面
    router.push({
      path: '/search',
      query: {
        q: newValue.trim(),
      },
    })
  } else if (oldValue && !newValue.trim()) {
    // 从有内容变为空时，回到之前记录的非搜索页面
    router.push(previousNonSearchPath)
  }
})

// 清空搜索框
const clearSearch = () => {
  searchQuery.value = ''
  console.log('searchQuery.value: ', searchQuery.value)
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
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
