import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/**
 * 重复规则类型
 */
export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly'

/**
 * 重复规则接口
 */
export interface RecurrenceRule {
  type: RecurrenceType
  interval?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
}

/**
 * 子任务/步骤接口
 */
export interface SubTodo {
  /** 唯一标识符 */
  id: string
  /** 子任务内容 */
  content: string
  /** 是否完成 */
  isCompleted: boolean
}

/**
 * 主任务接口
 */
export interface Todo {
  /** 唯一标识符 */
  id: string
  /** 具体内容 (标题) */
  content: string
  /** 是否完成 */
  isCompleted: boolean
  /** 是否重要 (星标) */
  isImportant: boolean
  /**
   * 我的一天
   * 记录加入当天的日期，逻辑判断 myDayDate === Today
   */
  myDayDate: string | null
  /** 计划日期 (截止日期) */
  plannedDate: string | null
  /** 提醒时间 */
  reminderTime: string | null
  /** 重复规则 */
  recurrence: RecurrenceRule | null
  /** 备注 */
  note: string
  /**
   * 所属列表ID
   * 关联到系统列表或自定义列表，默认为 'tasks'
   */
  listId: string
  /** 子任务列表 */
  steps: SubTodo[]
  /** 创建时间 */
  createdAt: string
  /** 完成时间 */
  completedAt: string | null
}

/** 默认任务列表ID */
export const DEFAULT_TASKS_LIST_ID = 'tasks'

export const useTodosStore = defineStore(
  'todos',
  () => {
    const todos = ref<Todo[]>([])

    /**
     * 迁移旧数据到新格式
     * 处理从旧数据结构到新数据结构的转换
     */
    const migrateOldData = (oldTodos: any[]): Todo[] => {
      return oldTodos.map((old) => {
        // 检查是否是旧格式数据
        const isOldFormat = 'title' in old || 'completed' in old || 'myDay' in old

        if (!isOldFormat) {
          // 已经是新格式，确保所有字段都存在
          return {
            id: old.id || uuidv4(),
            content: old.content || '',
            isCompleted: old.isCompleted ?? false,
            isImportant: old.isImportant ?? false,
            myDayDate: old.myDayDate ?? null,
            plannedDate: old.plannedDate ?? null,
            reminderTime: old.reminderTime ?? null,
            recurrence: old.recurrence ?? null,
            note: old.note ?? '',
            listId: old.listId || DEFAULT_TASKS_LIST_ID,
            steps: old.steps ?? [],
            createdAt: old.createdAt || new Date().toISOString(),
            completedAt: old.completedAt ?? null,
          } as Todo
        }

        // 转换旧格式到新格式
        return {
          id: old.id || uuidv4(),
          content: old.title || old.content || '', // 旧格式用 title，新格式用 content
          isCompleted: old.completed ?? old.isCompleted ?? false,
          isImportant: old.important ?? old.isImportant ?? false,
          // 旧格式 myDay 是 boolean，新格式 myDayDate 是日期字符串
          myDayDate: old.myDay === true ? new Date().toISOString() : (old.myDayDate ?? null),
          // 旧格式 dueDate，新格式 plannedDate
          plannedDate: old.dueDate ?? old.plannedDate ?? null,
          // 旧格式 reminder，新格式 reminderTime
          reminderTime: old.reminder ?? old.reminderTime ?? null,
          recurrence: old.recurrence ?? null,
          note: old.note ?? old.notes ?? '',
          listId: old.listId || DEFAULT_TASKS_LIST_ID,
          steps: old.steps ?? [],
          createdAt: old.createdAt || new Date().toISOString(),
          completedAt: old.completedAt ?? null,
        } as Todo
      })
    }

    /**
     * 获取今天的本地日期字符串 (YYYY-MM-DD格式)
     * 使用本地时间而非 UTC 时间
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
     * 支持 ISO 格式和本地格式
     */
    const getDatePart = (dateString: string): string => {
      // 如果是 ISO 格式，转换为本地日期
      if (dateString.includes('T')) {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      // 已经是 YYYY-MM-DD 格式
      return dateString.split('T')[0]
    }

    /**
     * 检查日期是否是今天
     */
    const isToday = (dateString: string | null): boolean => {
      if (!dateString) return false
      return getDatePart(dateString) === getTodayDateString()
    }

    /**
     * 创建新的子任务
     */
    const createSubTodo = (content: string): SubTodo => {
      return {
        id: uuidv4(),
        content,
        isCompleted: false,
      }
    }

    /**
     * 添加新TODO
     * @param content 任务内容
     * @param options 可选属性，支持上下文创建逻辑
     */
    const addTodo = (content: string, options?: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      const newTodo: Todo = {
        id: uuidv4(),
        content,
        isCompleted: false,
        isImportant: false,
        myDayDate: null,
        plannedDate: null,
        reminderTime: null,
        recurrence: null,
        note: '',
        listId: DEFAULT_TASKS_LIST_ID,
        steps: [],
        createdAt: new Date().toISOString(),
        completedAt: null,
        ...options,
      }
      todos.value.unshift(newTodo)
      return newTodo
    }

    /**
     * 在"我的一天"视图创建任务
     */
    const addTodoToMyDay = (content: string, options?: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      return addTodo(content, {
        myDayDate: new Date().toISOString(),
        listId: DEFAULT_TASKS_LIST_ID,
        ...options,
      })
    }

    /**
     * 在"重要"视图创建任务
     */
    const addImportantTodo = (
      content: string,
      options?: Partial<Omit<Todo, 'id' | 'createdAt'>>,
    ) => {
      return addTodo(content, {
        isImportant: true,
        listId: DEFAULT_TASKS_LIST_ID,
        ...options,
      })
    }

    /**
     * 在"计划内"视图创建任务
     */
    const addPlannedTodo = (
      content: string,
      date?: Date,
      options?: Partial<Omit<Todo, 'id' | 'createdAt'>>,
    ) => {
      const plannedDate = date || new Date()
      plannedDate.setHours(0, 0, 0, 0)
      return addTodo(content, {
        plannedDate: plannedDate.toISOString(),
        listId: DEFAULT_TASKS_LIST_ID,
        ...options,
      })
    }

    /**
     * 在自定义列表视图创建任务
     */
    const addTodoToList = (
      content: string,
      listId: string,
      options?: Partial<Omit<Todo, 'id' | 'createdAt'>>,
    ) => {
      return addTodo(content, {
        listId,
        ...options,
      })
    }

    // 切换完成状态
    const toggleComplete = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.isCompleted = !todo.isCompleted
        todo.completedAt = todo.isCompleted ? new Date().toISOString() : null

        // 如果是重复任务完成，创建新实例
        if (todo.isCompleted && todo.recurrence) {
          createNextRecurrence(todo)
        }
      }
    }

    /**
     * 创建重复任务的下一个实例
     */
    const createNextRecurrence = (completedTodo: Todo) => {
      if (!completedTodo.recurrence || !completedTodo.plannedDate) return

      const currentDate = new Date(completedTodo.plannedDate)
      let nextDate: Date

      switch (completedTodo.recurrence.type) {
        case 'daily':
          nextDate = new Date(
            currentDate.setDate(currentDate.getDate() + (completedTodo.recurrence.interval || 1)),
          )
          break
        case 'weekdays':
          nextDate = new Date(currentDate)
          do {
            nextDate.setDate(nextDate.getDate() + 1)
          } while (nextDate.getDay() === 0 || nextDate.getDay() === 6)
          break
        case 'weekly':
          nextDate = new Date(
            currentDate.setDate(
              currentDate.getDate() + 7 * (completedTodo.recurrence.interval || 1),
            ),
          )
          break
        case 'monthly':
          nextDate = new Date(
            currentDate.setMonth(currentDate.getMonth() + (completedTodo.recurrence.interval || 1)),
          )
          break
        case 'yearly':
          nextDate = new Date(
            currentDate.setFullYear(
              currentDate.getFullYear() + (completedTodo.recurrence.interval || 1),
            ),
          )
          break
        default:
          return
      }

      addTodo(completedTodo.content, {
        isImportant: completedTodo.isImportant,
        plannedDate: nextDate.toISOString(),
        recurrence: completedTodo.recurrence,
        note: completedTodo.note,
        listId: completedTodo.listId,
        steps: [], // 新实例不继承子任务
      })
    }

    // 切换重要状态
    const toggleImportant = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.isImportant = !todo.isImportant
      }
    }

    // 切换"我的一天"状态
    const toggleMyDay = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.myDayDate = todo.myDayDate && isToday(todo.myDayDate) ? null : new Date().toISOString()
      }
    }

    // 删除TODO
    const deleteTodo = (id: string) => {
      const index = todos.value.findIndex((t) => t.id === id)
      if (index > -1) {
        todos.value.splice(index, 1)
      }
    }

    // 更新TODO
    const updateTodo = (id: string, updates: Partial<Todo>) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        Object.assign(todo, updates)
      }
    }

    // 设置截止日期（并自动加入计划）
    const setDueDate = (id: string, date: Date) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        const normalized = new Date(date)
        normalized.setHours(0, 0, 0, 0)
        todo.plannedDate = normalized.toISOString()
      }
    }

    // 清除截止日期
    const clearDueDate = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.plannedDate = null
      }
    }

    // 设置提醒时间
    const setReminder = (id: string, reminderTime: Date) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.reminderTime = reminderTime.toISOString()
      }
    }

    // 清除提醒
    const clearReminder = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.reminderTime = null
      }
    }

    // 设置重复规则
    const setRecurrence = (id: string, recurrence: RecurrenceRule | null) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.recurrence = recurrence
      }
    }

    // 更新备注
    const updateNote = (id: string, note: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.note = note
      }
    }

    // 移动任务到其他列表
    const moveTodoToList = (id: string, listId: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.listId = listId
      }
    }

    // ========== 子任务相关操作 ==========

    /**
     * 添加子任务
     */
    const addStep = (todoId: string, content: string) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const newStep = createSubTodo(content)
        todo.steps.push(newStep)
        return newStep
      }
      return null
    }

    /**
     * 切换子任务完成状态
     */
    const toggleStepComplete = (todoId: string, stepId: string) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const step = todo.steps.find((s) => s.id === stepId)
        if (step) {
          step.isCompleted = !step.isCompleted
        }
      }
    }

    /**
     * 删除子任务
     */
    const deleteStep = (todoId: string, stepId: string) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const index = todo.steps.findIndex((s) => s.id === stepId)
        if (index > -1) {
          todo.steps.splice(index, 1)
        }
      }
    }

    /**
     * 更新子任务内容
     */
    const updateStep = (todoId: string, stepId: string, content: string) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const step = todo.steps.find((s) => s.id === stepId)
        if (step) {
          step.content = content
        }
      }
    }

    /**
     * 重新排序子任务
     */
    const reorderSteps = (todoId: string, steps: SubTodo[]) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        todo.steps = steps
      }
    }

    /**
     * 提升子任务为独立任务
     * 创建新任务，继承父任务的listId
     */
    const promoteStepToTodo = (todoId: string, stepId: string) => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const step = todo.steps.find((s) => s.id === stepId)
        if (step) {
          // 创建新的独立任务，继承父任务的listId
          const newTodo = addTodo(step.content, {
            listId: todo.listId,
          })

          // 从父任务中移除该子任务
          deleteStep(todoId, stepId)

          return newTodo
        }
      }
      return null
    }

    // ========== 获取过滤后的TODO列表 (计算属性) ==========

    /**
     * 获取"我的一天"的TODO列表
     * 筛选条件: myDayDate === Today AND !isCompleted
     */
    const myDayTodos = computed(() => {
      return todos.value.filter((t) => isToday(t.myDayDate) && !t.isCompleted)
    })

    /**
     * 获取"重要"的TODO列表
     * 筛选条件: isImportant === true
     */
    const importantTodos = computed(() => {
      return todos.value.filter((t) => t.isImportant && !t.isCompleted)
    })

    /**
     * 获取"计划内"的TODO列表
     * 筛选条件: plannedDate !== null
     */
    const plannedTodos = computed(() => {
      return todos.value.filter((t) => t.plannedDate && !t.isCompleted)
    })

    /**
     * 获取"任务"列表的TODO
     * 筛选条件: listId === 'tasks'
     */
    const tasksTodos = computed(() => {
      return todos.value.filter((t) => t.listId === DEFAULT_TASKS_LIST_ID && !t.isCompleted)
    })

    /**
     * 获取"已完成"的TODO列表
     */
    const completedTodos = computed(() => {
      return todos.value.filter((t) => t.isCompleted)
    })

    /**
     * 获取所有TODO列表
     */
    const allTodos = computed(() => {
      return todos.value
    })

    /**
     * 按列表ID获取TODO
     */
    const getTodosByListId = (listId: string) => {
      return todos.value.filter((t) => t.listId === listId && !t.isCompleted)
    }

    /**
     * 获取子任务完成进度
     */
    const getStepsProgress = (todoId: string): { completed: number; total: number } => {
      const todo = todos.value.find((t) => t.id === todoId)
      if (!todo || !todo.steps || todo.steps.length === 0) {
        return { completed: 0, total: 0 }
      }
      const completed = todo.steps.filter((s) => s.isCompleted).length
      return { completed, total: todo.steps.length }
    }

    /**
     * "我的一天"重置逻辑
     * 检查所有todo，若myDayDate !== current_date，则清除myDayDate显示
     * 注意：这个方法不需要实际清除数据，因为过滤时会自动判断日期
     */
    const cleanupMyDay = () => {
      // 由于我们使用 isToday() 判断，非今天的任务自动不显示在"我的一天"
      // 如果需要清理历史数据，可以启用以下代码：
      // todos.value.forEach((todo) => {
      //   if (todo.myDayDate && !isToday(todo.myDayDate)) {
      //     todo.myDayDate = null
      //   }
      // })
    }

    return {
      todos,
      // 创建方法
      addTodo,
      addTodoToMyDay,
      addImportantTodo,
      addPlannedTodo,
      addTodoToList,
      // 基本操作
      toggleComplete,
      toggleImportant,
      toggleMyDay,
      deleteTodo,
      updateTodo,
      // 日期和提醒
      setDueDate,
      clearDueDate,
      setReminder,
      clearReminder,
      setRecurrence,
      // 其他
      updateNote,
      moveTodoToList,
      // 子任务操作
      addStep,
      toggleStepComplete,
      deleteStep,
      updateStep,
      reorderSteps,
      promoteStepToTodo,
      getStepsProgress,
      // 计算属性
      myDayTodos,
      importantTodos,
      plannedTodos,
      tasksTodos,
      completedTodos,
      allTodos,
      getTodosByListId,
      // 工具方法
      cleanupMyDay,
      isToday,
      migrateOldData,
    }
  },
  {
    persist: {
      // 自定义序列化/反序列化以处理数据迁移
      afterRestore: (ctx) => {
        // 数据恢复后进行迁移
        const store = ctx.store
        if (store.todos && Array.isArray(store.todos)) {
          store.todos = store.migrateOldData(store.todos)
        }
      },
    },
  },
)
