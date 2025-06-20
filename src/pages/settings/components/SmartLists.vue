<template>
  <div class="border-t pt-4 mt-3">
    <div class="tit mb-2">智能列表</div>
    <div
      v-for="list in intelligentLists"
      :key="list.id"
      class="flex items-center justify-between py-2 px-2"
    >
      <div class="flex items-center">
        <component :is="getIconComponent(list.icon ?? 'List')" class="mr-2 text-xl" />
        <span>{{ list.name }}</span>
      </div>
      <div class="flex items-center">
        <Switch
          :model-value="!list.isHidden"
          @update:model-value="(val) => toggleListSwitch(list.id, val)"
        />
        <span class="ml-2 text-sm">{{ list.isHidden ? '关' : '开' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useListsStore } from '@/store/lists'
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'

const listsStore = useListsStore()
const intelligentLists = computed(() => listsStore.intelligentLists)

function toggleListSwitch(id: string, checked: boolean) {
  // checked=true 表示显示，isHidden=false
  const list = intelligentLists.value.find((l) => l.id === id)
  if (list && list.isHidden === checked) {
    listsStore.toggleIntelligentListHidden(id)
  }
}

function getIconComponent(iconName: string) {
  return (icons as any)[iconName] || icons.List
}
</script>
