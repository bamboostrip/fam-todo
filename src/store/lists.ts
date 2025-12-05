import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 列表类型
 * - system: 系统默认列表（智能列表）
 * - user: 用户自定义列表
 */
export type ListType = 'system' | 'user'

// 列表主题接口
export interface ListTheme {
  type: 'color' | 'image'
  value: string
}

// 智能列表接口（固定菜单）- 系统类型
export interface IntelligentList {
  id: string
  name: string
  route?: string
  count?: number
  icon?: string
  order: number
  isHidden?: boolean
  theme?: ListTheme
  type: 'system' // 明确标记为系统类型
}

// 用户自定义列表接口
export interface CustomList {
  id: string
  name: string
  route?: string
  count?: number
  icon?: string
  order: number
  theme?: ListTheme
  type: 'user' // 明确标记为用户类型
}

export const useListsStore = defineStore(
  'lists',
  () => {
    // 智能列表（固定菜单）
    const intelligentLists = ref<IntelligentList[]>([
      {
        id: 'my-day',
        name: '我的一天',
        route: '/',
        count: undefined,
        order: 0,
        icon: 'Sun',
        isHidden: false,
        theme: { type: 'color', value: '#F2E7F9' },
        type: 'system',
      },
      {
        id: 'important',
        name: '重要',
        route: '/important',
        count: undefined,
        order: 1,
        icon: 'Star',
        isHidden: false,
        theme: { type: 'color', value: '#FCE4EC' },
        type: 'system',
      },
      {
        id: 'planned',
        name: '计划内',
        route: '/planned',
        count: undefined,
        order: 2,
        icon: 'Calendar',
        isHidden: false,
        theme: { type: 'color', value: '#D5F1E5' },
        type: 'system',
      },
      {
        id: 'tasks',
        name: '任务',
        route: '/tasks',
        count: undefined,
        order: 3,
        icon: 'ListTodo',
        isHidden: false,
        theme: { type: 'color', value: '#707E89' },
        type: 'system',
      },
      {
        id: 'completed',
        name: '已完成',
        route: '/completed',
        count: undefined,
        order: 4,
        icon: 'CheckCircle',
        isHidden: true,
        theme: { type: 'color', value: '#C5524D' },
        type: 'system',
      },
      {
        id: 'all',
        name: '全部',
        route: '/all',
        count: undefined,
        order: 5,
        icon: 'List',
        isHidden: true,
        theme: { type: 'color', value: '#CA5474' },
        type: 'system',
      },
    ])

    // 用户自定义列表
    const customLists = ref<CustomList[]>([])

    // 检查列表名称是否重复
    const isNameDuplicate = (name: string, excludeId?: string) => {
      return customLists.value.some((list) => list.name === name && list.id !== excludeId)
    }

    // 智能列表相关方法
    const toggleIntelligentListHidden = (listId: string) => {
      const list = intelligentLists.value.find((l) => l.id === listId)
      if (list) {
        list.isHidden = !list.isHidden
      }
    }

    const updateIntelligentListCount = (listId: string, count: number) => {
      const list = intelligentLists.value.find((l) => l.id === listId)
      if (list) {
        list.count = count
      }
    }

    const updateCustomListCount = (listId: string, count: number) => {
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        list.count = count
      }
    }

    // 重新计算列表的 order
    const reorderLists = () => {
      customLists.value.forEach((list, index) => {
        list.order = index
      })
    }

    // 添加新列表
    const addList = (name: string, _theme?: undefined, icon: string = 'ListTodo') => {
      if (isNameDuplicate(name)) {
        throw new Error('列表名重复')
      }
      const maxOrder = Math.max(-1, ...customLists.value.map((l) => l.order))
      const newListId = `list-${Date.now()}`
      const newList: CustomList = {
        id: newListId,
        name,
        route: `/list?id=${newListId}`,
        count: 0,
        icon,
        order: maxOrder + 1,
        type: 'user', // 明确标记为用户自定义列表
        theme: { type: 'color', value: '#5F73C1' }, // 默认蓝色主题
      }
      customLists.value.push(newList)
      return newList
    }

    // 删除列表
    const deleteList = (listId: string) => {
      const listIndex = customLists.value.findIndex((l) => l.id === listId)
      if (listIndex > -1) {
        customLists.value.splice(listIndex, 1)
        reorderLists()
      }
    }

    // 重命名列表
    const renameList = (listId: string, newName: string) => {
      if (isNameDuplicate(newName, listId)) {
        throw new Error('列表名重复')
      }
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        list.name = newName
      }
    }

    // 更新列表图标
    const updateListIcon = (listId: string, icon: string) => {
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        list.icon = icon
      }
    }

    // 移动列表位置
    const moveList = (sourceId: string, targetId: string, position: 'before' | 'after') => {
      const sourceList = customLists.value.find((l) => l.id === sourceId)
      const targetList = customLists.value.find((l) => l.id === targetId)

      if (!sourceList || !targetList) {
        console.warn('Move failed: lists not found.')
        return
      }

      const sourceIndex = customLists.value.findIndex((l) => l.id === sourceId)
      let targetIndex = customLists.value.findIndex((l) => l.id === targetId)

      if (sourceIndex === -1 || targetIndex === -1) return

      // Remove source list
      const [movedItem] = customLists.value.splice(sourceIndex, 1)

      // Recalculate target index after removal
      targetIndex = customLists.value.findIndex((l) => l.id === targetId)

      if (position === 'before') {
        customLists.value.splice(targetIndex, 0, movedItem)
      } else {
        customLists.value.splice(targetIndex + 1, 0, movedItem)
      }

      // Update order for all lists
      reorderLists()
    }

    // 更新列表主题
    const updateListTheme = (listId: string, theme: ListTheme) => {
      // Try to find in intelligent lists first
      const intelligentList = intelligentLists.value.find((l) => l.id === listId)
      if (intelligentList) {
        intelligentList.theme = theme
        return
      }

      // Then try custom lists
      const customList = customLists.value.find((l) => l.id === listId)
      if (customList) {
        customList.theme = theme
      }
    }

    // 更新所有列表的计数（基于 todos store）
    const updateAllListCounts = () => {
      // 需要从 todos store 导入，但为了避免循环依赖，我们在组件中调用
      // 这个方法会在 App.vue 或其他地方被调用
    }

    return {
      intelligentLists,
      customLists,
      // methods for intelligent lists
      toggleIntelligentListHidden,
      updateIntelligentListCount,
      updateCustomListCount,
      updateAllListCounts,
      // methods for custom lists
      addList,
      deleteList,
      renameList,
      updateListIcon,
      moveList,
      updateListTheme,
      // utility
      isNameDuplicate,
    }
  },
  {
    persist: {
      // 数据恢复后重置计数，让 useSyncListCounts 重新计算
      afterRestore: (ctx) => {
        const store = ctx.store
        if (store.intelligentLists && Array.isArray(store.intelligentLists)) {
          // 重置所有智能列表的计数为 undefined，让 useSyncListCounts 重新计算
          store.intelligentLists.forEach((list: any) => {
            list.count = undefined
          })
        }
      },
    },
  },
)
