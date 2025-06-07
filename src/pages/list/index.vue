<route lang="json5">
{
  name: 'list',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <div class="min-h-screen bg-background">
    <!-- 主内容区域 -->
    <div class="p-4">
      <!-- 列表信息 -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold mb-2">{{ listName }}</h1>
        <p class="text-muted-foreground">自定义列表</p>
      </div>

      <!-- 列表内容 -->
      <div class="space-y-4">
        <!-- 这里将来会显示该列表的待办事项 -->
        <div class="text-center py-12">
          <div class="w-12 h-12 text-muted-foreground mx-auto mb-4">
            <component :is="listIcon" class="w-full h-full" />
          </div>
          <h3 class="text-lg font-medium mb-2">{{ listName }}</h3>
          <p class="text-muted-foreground">这个列表还没有待办事项</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/store/lists'
import { ListTodo } from 'lucide-vue-next'
import * as Icons from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()

const listId = computed(() => route.query.id as string)

// 根据 ID 查找列表信息
const currentList = computed(() => {
  if (!listId.value) return null
  return listsStore.customLists.find((list) => list.id === listId.value)
})

// 列表名称
const listName = computed(() => {
  return currentList.value?.name || '未知列表'
})

// 列表图标
const listIcon = computed(() => {
  const iconName = currentList.value?.icon || 'ListTodo'
  return (Icons as any)[iconName] || ListTodo
})

// 监听路由变化，如果没有 ID 或列表不存在，跳转到首页
watch(
  [listId, currentList],
  ([id, list]) => {
    if (!id || !list) {
      router.push('/')
    }
  },
  { immediate: true },
)
</script>
