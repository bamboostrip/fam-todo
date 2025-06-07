<route lang="json5">
{
  name: 'important',
  meta: {
    requiresAuth: true,
    layout: 'default',
  },
}
</route>

<template>
  <div class="min-h-screen bg-background">
    重要
    <div class="loading-container">
      <LoadingAnimation />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoadingAnimation from '@/components/LoadingAnimation.vue'
console.log('All page loaded')
</script>
