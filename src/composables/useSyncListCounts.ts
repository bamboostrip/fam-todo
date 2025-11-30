import { watchEffect } from 'vue'
import { useListsStore } from '@/store/lists'
import { useTodosStore, DEFAULT_TASKS_LIST_ID } from '@/store/todos'

/**
 * 同步列表计数的组合式函数
 * 监听 todos 的变化，自动更新各个列表的计数
 */
export function useSyncListCounts() {
  const listsStore = useListsStore()
  const todosStore = useTodosStore()

  /**
   * 获取今天的本地日期字符串 (YYYY-MM-DD格式)
   */
  const getTodayDateString = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 从日期字符串中提取本地日期部分 (YYYY-MM-DD)
   */
  const getDatePart = (dateString: string): string => {
    if (dateString.includes('T')) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return dateString.split('T')[0]
  }

  /**
   * 检查日期是否是今天（使用本地时间）
   */
  const isToday = (dateString: string | null): boolean => {
    if (!dateString) return false
    return getDatePart(dateString) === getTodayDateString()
  }

  const updateCounts = () => {
    // 我的一天：未完成且 myDayDate 是今天的 TODO
    const myDayCount = todosStore.todos.filter((t) => isToday(t.myDayDate) && !t.isCompleted).length
    listsStore.updateIntelligentListCount('my-day', myDayCount)

    // 重要：未完成且标记为重要的 TODO
    const importantCount = todosStore.todos.filter((t) => t.isImportant && !t.isCompleted).length
    listsStore.updateIntelligentListCount('important', importantCount)

    // 计划内：未完成且有 plannedDate 或 reminderTime 的 TODO
    const plannedCount = todosStore.todos.filter(
      (t) => (t.plannedDate !== null || t.reminderTime !== null) && !t.isCompleted,
    ).length
    listsStore.updateIntelligentListCount('planned', plannedCount)

    // 任务：未完成且 listId 为默认任务列表的 TODO
    const tasksCount = todosStore.todos.filter(
      (t) => t.listId === DEFAULT_TASKS_LIST_ID && !t.isCompleted,
    ).length
    listsStore.updateIntelligentListCount('tasks', tasksCount)

    // 已完成：所有已完成的 TODO
    const completedCount = todosStore.todos.filter((t) => t.isCompleted).length
    listsStore.updateIntelligentListCount('completed', completedCount)

    // 全部：所有未完成的 TODO
    const allCount = todosStore.todos.filter((t) => !t.isCompleted).length
    listsStore.updateIntelligentListCount('all', allCount)
  }

  // 使用 watchEffect 自动追踪依赖，在 todos 变化时自动更新计数
  // watchEffect 会立即执行一次，并在依赖变化时重新执行
  watchEffect(() => {
    // 访问 todos 数组以建立依赖追踪
    const todos = todosStore.todos

    // 我的一天：未完成且 myDayDate 是今天的 TODO
    const myDayCount = todos.filter((t) => isToday(t.myDayDate) && !t.isCompleted).length
    listsStore.updateIntelligentListCount('my-day', myDayCount)

    // 重要：未完成且标记为重要的 TODO
    const importantCount = todos.filter((t) => t.isImportant && !t.isCompleted).length
    listsStore.updateIntelligentListCount('important', importantCount)

    // 计划内：未完成且有 plannedDate 或 reminderTime 的 TODO
    const plannedCount = todos.filter(
      (t) => (t.plannedDate !== null || t.reminderTime !== null) && !t.isCompleted,
    ).length
    listsStore.updateIntelligentListCount('planned', plannedCount)

    // 任务：未完成且 listId 为默认任务列表的 TODO
    const tasksCount = todos.filter(
      (t) => t.listId === DEFAULT_TASKS_LIST_ID && !t.isCompleted,
    ).length
    listsStore.updateIntelligentListCount('tasks', tasksCount)

    // 已完成：所有已完成的 TODO
    const completedCount = todos.filter((t) => t.isCompleted).length
    listsStore.updateIntelligentListCount('completed', completedCount)

    // 全部：所有未完成的 TODO
    const allCount = todos.filter((t) => !t.isCompleted).length
    listsStore.updateIntelligentListCount('all', allCount)

    // 自定义列表：更新每个自定义列表的未完成任务计数
    listsStore.customLists.forEach((list) => {
      const customListCount = todos.filter((t) => t.listId === list.id && !t.isCompleted).length
      listsStore.updateCustomListCount(list.id, customListCount)
    })
  })

  return {
    updateCounts,
  }
}
