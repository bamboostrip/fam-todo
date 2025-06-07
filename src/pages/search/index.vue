<route lang="json5">
{
  name: 'serch',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)

// 执行搜索（暂时为模拟数据）
const performSearch = async () => {
  isLoading.value = true

  try {
    // TODO: 这里将来会调用真实的搜索接口
    // const results = await searchAPI(searchQuery.value)

    // 模拟搜索延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟搜索结果
    searchResults.value = [
      {
        id: 1,
        title: `包含 "${searchQuery.value}" 的待办事项 1`,
        description: '这是一个示例搜索结果',
        type: 'todo',
        listName: '工作列表',
      },
      {
        id: 2,
        title: `包含 "${searchQuery.value}" 的待办事项 2`,
        description: '这是另一个示例搜索结果',
        type: 'todo',
        listName: '个人列表',
      },
    ]
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// 监听路由查询参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    console.log('newQuery: ', newQuery)
    searchQuery.value = (newQuery as string) || ''
    if (searchQuery.value) {
      performSearch()
    } else {
      searchResults.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- 主内容区域 -->
    <div class="p-4">
      <!-- 搜索信息 -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold mb-2">搜索结果</h1>
        <p class="text-muted-foreground">
          <span v-if="searchQuery">搜索 "</span>
          <span v-if="searchQuery" class="font-medium">{{ searchQuery }}</span>
          <span v-if="searchQuery">"</span>
          <span v-if="!isLoading && searchResults.length > 0">
            ，找到 {{ searchResults.length }} 个结果
          </span>
          <span v-if="!isLoading && searchResults.length === 0 && searchQuery">
            ，没有找到相关结果
          </span>
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-2 text-muted-foreground">
          <div
            class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          ></div>
          <span>正在搜索...</span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchResults.length > 0" class="space-y-4">
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium mb-1">{{ result.title }}</h3>
              <p class="text-sm text-muted-foreground mb-2">{{ result.description }}</p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="px-2 py-1 bg-accent rounded-full">{{ result.listName }}</span>
                <span>·</span>
                <span>{{ result.type === 'todo' ? '待办事项' : '其他' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果状态 -->
      <div v-else-if="!isLoading && searchQuery" class="text-center py-12">
        <Search class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-medium mb-2">没有找到相关结果</h3>
        <p class="text-muted-foreground mb-4">尝试使用不同的关键词或检查拼写</p>
      </div>
      <!-- 初始状态 -->
      <div v-else-if="!searchQuery" class="text-center py-12">
        <Search class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-medium mb-2">开始搜索</h3>
        <p class="text-muted-foreground">在侧边栏的搜索框中输入关键词来查找待办事项</p>
      </div>
    </div>
  </div>
</template>
