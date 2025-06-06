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
  groupId?: string
  route?: string
  count?: number
  icon?: string
  order: number
}

// 用户自定义组接口
export interface CustomGroup {
  id: string
  name: string
  isExpanded: boolean
  order: number
}

// 兼容性接口（保持旧的接口）
export interface TodoList {
  id: string
  name: string
  groupId?: string
  isCustom: boolean
  route?: string
  count?: number
  icon?: string
  order: number
  isHidden?: boolean
}

export interface TodoGroup {
  id: string
  name: string
  isExpanded: boolean
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
        route: '/my-day',
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

    // 用户自定义组和列表
    const customGroups = ref<CustomGroup[]>([])
    const customLists = ref<CustomList[]>([])

    // 为了兼容性，保留 groups 引用
    const groups = customGroups

    // 检查名称是否重复
    const isNameDuplicate = (name: string, type: 'list' | 'group', excludeId?: string) => {
      if (type === 'list') {
        return customLists.value.some((list) => list.name === name && list.id !== excludeId)
      } else {
        return customGroups.value.some((group) => group.name === name && group.id !== excludeId)
      }
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
    } // 辅助函数：重新计算指定范围内列表的 order
    const reorderScope = (scopeId?: string) => {
      const listsInScope = customLists.value.filter((l) => l.groupId === scopeId)
      listsInScope.forEach((list, index) => {
        list.order = index
      })
    } // 添加新组
    const addGroup = (name: string) => {
      if (isNameDuplicate(name, 'group')) {
        throw new Error('组名重复')
      }
      const maxOrder = Math.max(0, ...customGroups.value.map((g) => g.order))
      const newGroup: CustomGroup = {
        id: `group-${Date.now()}`,
        name,
        isExpanded: true,
        order: customGroups.value.length > 0 ? maxOrder + 1 : 0,
      }
      customGroups.value.push(newGroup)
      return newGroup
    } // 删除组
    const deleteGroup = (groupId: string) => {
      customLists.value = customLists.value.filter((list) => list.groupId !== groupId)
      customGroups.value = customGroups.value.filter((group) => group.id !== groupId)
      // Re-order remaining groups
      customGroups.value.forEach((group, index) => {
        group.order = index
      })
    } // 解散组（不删除列表）
    const dissolveGroup = (groupId: string) => {
      customLists.value.forEach((list) => {
        if (list.groupId === groupId) {
          list.groupId = undefined
        }
      })
      customGroups.value = customGroups.value.filter((group) => group.id !== groupId)
      reorderScope(undefined) // Re-order ungrouped lists
      // Re-order remaining groups
      customGroups.value.forEach((group, index) => {
        group.order = index
      })
    } // 重命名组
    const renameGroup = (groupId: string, newName: string) => {
      if (isNameDuplicate(newName, 'group', groupId)) {
        throw new Error('组名重复')
      }
      const group = customGroups.value.find((g) => g.id === groupId)
      if (group) {
        group.name = newName
      }
    } // 切换组展开状态
    const toggleGroup = (groupId: string) => {
      const group = customGroups.value.find((g) => g.id === groupId)
      if (group) {
        group.isExpanded = !group.isExpanded
      }
    } // 添加新列表
    const addList = (name: string, groupId?: string, icon: string = 'ListTodo') => {
      if (isNameDuplicate(name, 'list')) {
        throw new Error('列表名重复')
      }
      const listsInScope = customLists.value.filter((l) => l.groupId === groupId)
      const maxOrder = Math.max(-1, ...listsInScope.map((l) => l.order))
      const newList: CustomList = {
        id: `list-${Date.now()}`,
        name,
        groupId,
        route: `/custom-list/${Date.now()}`,
        count: 0,
        icon,
        order: maxOrder + 1,
      }
      customLists.value.push(newList)
      return newList
    } // 删除列表
    const deleteList = (listId: string) => {
      const listIndex = customLists.value.findIndex((l) => l.id === listId)
      if (listIndex > -1) {
        const deletedList = customLists.value[listIndex]
        customLists.value.splice(listIndex, 1)
        reorderScope(deletedList.groupId)
      }
    } // 重命名列表
    const renameList = (listId: string, newName: string) => {
      if (isNameDuplicate(newName, 'list', listId)) {
        throw new Error('列表名重复')
      }
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        list.name = newName
      }
    } // 移动列表到组
    const moveListToGroup = (listId: string, newGroupId?: string) => {
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        const oldGroupId = list.groupId
        if (oldGroupId !== newGroupId) {
          list.groupId = newGroupId
          reorderScope(oldGroupId) // Re-order lists in the old scope
          reorderScope(newGroupId) // Re-order lists in the new scope (this will include the moved list)
        }
      }
    }

    // 更新列表图标
    const updateListIcon = (listId: string, icon: string) => {
      const list = customLists.value.find((l) => l.id === listId)
      if (list) {
        list.icon = icon
      }
    }

    // 重新排序列表 (仅在同一 group 内或都在 group 外时有效)
    const reorderLists = (sourceId: string, targetId: string, position: 'before' | 'after') => {
      const sourceList = customLists.value.find((l) => l.id === sourceId)
      const targetList = customLists.value.find((l) => l.id === targetId)

      if (!sourceList || !targetList || sourceList.groupId !== targetList.groupId) {
        console.warn('Reorder failed: lists not found or in different scopes.')
        return
      }

      const scopeGroupId = sourceList.groupId
      // Create a mutable copy of lists in the current scope for reordering
      const listsInScope = customLists.value.filter((l) => l.groupId === scopeGroupId)

      const sourceIndexInScope = listsInScope.findIndex((l) => l.id === sourceId)
      let targetIndexInScope = listsInScope.findIndex((l) => l.id === targetId)

      if (sourceIndexInScope === -1 || targetIndexInScope === -1) return // Should not happen

      const [movedItem] = listsInScope.splice(sourceIndexInScope, 1)

      // After splice, the targetIndexInScope might need adjustment if source was before target
      // Re-find target index in the modified listsInScope
      targetIndexInScope = listsInScope.findIndex((l) => l.id === targetId)
      if (targetIndexInScope === -1 && position === 'before') {
        targetIndexInScope = 0 // Default to beginning if target is gone (e.g. if source was target)
      } else if (targetIndexInScope === -1 && position === 'after') {
        targetIndexInScope = listsInScope.length - 1 // Default to end
      }

      if (position === 'before') {
        listsInScope.splice(targetIndexInScope, 0, movedItem)
      } else {
        listsInScope.splice(targetIndexInScope + 1, 0, movedItem)
      }

      // Update order property for all items in the reordered scope
      listsInScope.forEach((list, index) => {
        list.order = index
      })

      // Update the main customLists array
      // Remove all lists from the current scope first
      const otherLists = customLists.value.filter((l) => l.groupId !== scopeGroupId)
      // Then add the reordered lists from the scope
      customLists.value = [...otherLists, ...listsInScope].sort((a, b) => {
        // Sort primarily by group, then by order within the group/ungrouped
        if (a.groupId === b.groupId) {
          return a.order - b.order
        }
        return 0 // Keep original order for items outside the current scope relative to each other
      })
      listsInScope.sort((a, b) => a.order - b.order) // Ensure it's sorted by the new order
      customLists.value = [...otherLists, ...listsInScope]
    }

    return {
      intelligentLists,
      customLists,
      groups, // which is customGroups
      // methods for intelligent lists
      toggleIntelligentListHidden,
      updateIntelligentListCount,
      // methods for groups
      addGroup,
      deleteGroup,
      dissolveGroup,
      renameGroup,
      toggleGroup,
      // methods for custom lists
      addList,
      deleteList,
      renameList,
      moveListToGroup,
      updateListIcon,
      reorderLists,
      // utility
      isNameDuplicate,
    }
  },
  {
    persist: true,
  },
)
