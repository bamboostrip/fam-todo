<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="w-full relative">
      <SidebarTrigger class="absolute top-2 left-2 z-50" />
      <RouterView />
    </main>
  </SidebarProvider>
</template>

<script lang="ts" setup>
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
</script>
