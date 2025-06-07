<script setup lang="ts">
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import UserAvatar from './UserAvatar.vue'
import SearchArea from './SearchArea.vue'
import FixedLists from './FixedLists.vue'
import CustomLists from './CustomLists.vue'
import CreateActions from './CreateActions.vue'
</script>

<template>
  <Sidebar class="w-60">
    <SidebarContent class="flex flex-col h-full">
      <!-- 用户信息区域 -->
      <UserAvatar />

      <!-- 搜索区域 -->
      <SearchArea />

      <!-- 固定菜单 -->
      <FixedLists />

      <!-- 分隔线 -->
      <div class="border-t mx-4 my-2"></div>
      <!-- 自定义列表区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 没有组的自定义列表 -->
        <CustomLists />
      </div>

      <!-- 底部操作按钮 -->
      <CreateActions />
    </SidebarContent>
  </Sidebar>
</template>
