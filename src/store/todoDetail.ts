import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTodoDetailStore = defineStore('todoDetail', () => {
  const isOpen = ref(false)
  const selectedTodoId = ref<string | null>(null)

  const openDetail = (todoId: string) => {
    selectedTodoId.value = todoId
    isOpen.value = true
  }

  const closeDetail = () => {
    isOpen.value = false
    selectedTodoId.value = null
  }

  return {
    isOpen,
    selectedTodoId,
    openDetail,
    closeDetail,
  }
})
