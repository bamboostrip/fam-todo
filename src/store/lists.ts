import { defineStore } from 'pinia'
import { ref } from 'vue'

// 智能列表接口（固定菜单）
export interface IntelligentList {
  id: string
  name: string
  route?: string
  count?: number
  icon?: string
  order: number
  isHidden?: boolean
}

// 用户自定义列表接口
export interface CustomList {
  id: string
  name: string
  route?: string
  count?: number
  icon?: string
  order: number
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
        count: 0,
        order: 0,
        icon: 'Sun',
        isHidden: false,
      },
      {
        id: 'important',
        name: '重要',
        route: '/important',
        count: 1,
        order: 1,
        icon: 'Star',
        isHidden: false,
      },
      {
        id: 'planned',
        name: '计划内',
        route: '/planned',
        count: 0,
        order: 2,
        icon: 'Calendar',
        isHidden: false,
      },
      {
        id: 'tasks',
        name: '任务',
        route: '/tasks',
        count: 2,
        order: 3,
        icon: 'ListTodo',
        isHidden: false,
      },
      {
        id: 'completed',
        name: '已完成',
        route: '/completed',
        count: 0,
        order: 4,
        icon: 'CheckCircle',
        isHidden: true,
      },
      {
        id: 'all',
        name: '全部',
        route: '/all',
        count: 0,
        order: 5,
        icon: 'List',
        isHidden: true,
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

    // 重新计算列表的 order
    const reorderLists = () => {
      customLists.value.forEach((list, index) => {
        list.order = index
      })
    }

    // 添加新列表
    const addList = (name: string, icon: string = 'ListTodo') => {
      if (isNameDuplicate(name)) {
        throw new Error('列表名重复')
      }
      const maxOrder = Math.max(-1, ...customLists.value.map((l) => l.order))
      const newList: CustomList = {
        id: `list-${Date.now()}`,
        name,
        route: `/list?id=list-${Date.now()}`,
        count: 0,
        icon,
        order: maxOrder + 1,
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

    return {
      intelligentLists,
      customLists,
      // methods for intelligent lists
      toggleIntelligentListHidden,
      updateIntelligentListCount,
      // methods for custom lists
      addList,
      deleteList,
      renameList,
      updateListIcon,
      moveList,
      // utility
      isNameDuplicate,
    }
  },
  {
    persist: true,
  },
)
