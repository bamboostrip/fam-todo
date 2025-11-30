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
     * 本地起始时间（去除时分秒）
     */
    const startOfLocalDay = (d: Date): Date => {
      const nd = new Date(d)
      nd.setHours(0, 0, 0, 0)
      return nd
    }

    /**
     * 将 YYYY-MM-DD 或 ISO 字符串解析为本地 00:00 的 Date
     */
    const parseToLocalDate = (dateString: string): Date => {
      if (!dateString) return startOfLocalDay(new Date())
      if (dateString.includes('T')) {
        return startOfLocalDay(new Date(dateString))
      }
      const [y, m, d] = dateString.split('-').map((n) => parseInt(n, 10))
      return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
    }

    /**
     * 将 Date 转成 ISO 字符串（保持本地 00:00）
     */
    const toIsoDateString = (d: Date): string => {
      return startOfLocalDay(d).toISOString()
    }

    /**
     * 计算从 prevDate 开始，按照 recurrence 规则前进一步的日期
     * 不执行 catch-up，仅向前推进一次
     */
    const stepNextByRule = (prevDate: Date, rule: RecurrenceRule): Date => {
      const interval = Math.max(1, rule.interval || 1)
      const date = startOfLocalDay(prevDate)
      const addDays = (n: number) =>
        startOfLocalDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() + n))
      const startOfWeek = (d: Date, weekStartsOn = 0): Date => {
        const dow = d.getDay()
        const diff = (dow - weekStartsOn + 7) % 7
        return startOfLocalDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff))
      }
      const addDaysFrom = (base: Date, n: number) =>
        startOfLocalDay(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n))
      switch (rule.type) {
        case 'daily':
          return addDays(interval)
        case 'weekdays': {
          // 每次向前至少一天，落到下一个工作日
          let next = addDays(1)
          while (next.getDay() === 0 || next.getDay() === 6) {
            next = addDays((next.getTime() - date.getTime()) / 86400000 + 1)
          }
          return next
        }
        case 'weekly': {
          // 支持 daysOfWeek；若未提供，则按整周推进（基于系列周对齐）
          const days = (rule.daysOfWeek || []).slice().sort((a, b) => a - b)
          if (days.length === 0) {
            return addDays(7 * interval)
          }
          const weekStart = startOfWeek(date, 0) // 以周日为周起始
          const currentDow = date.getDay()
          // 1) 本系列周内，寻找严格晚于当前日的下一个选中星期
          const after = days.filter((d) => d > currentDow)
          if (after.length > 0) {
            // 返回本周下一个选中日
            return addDaysFrom(weekStart, after[0])
          }
          // 2) 若本系列周已无后续选中日，则跳到下一“系列周”（按 interval 周数推进），取该周的第一个选中日
          const nextSeriesWeekStart = addDaysFrom(weekStart, 7 * interval)
          return addDaysFrom(nextSeriesWeekStart, days[0])
        }
        case 'monthly': {
          const next = new Date(date)
          next.setMonth(next.getMonth() + interval)
          return startOfLocalDay(next)
        }
        case 'yearly': {
          const next = new Date(date)
          next.setFullYear(next.getFullYear() + interval)
          return startOfLocalDay(next)
        }
        default:
          return addDays(1)
      }
    }

    /**
     * 按需求文档的 Catch-up 策略计算下一个日期
     * 规则：至少前进一步；若仍早于今天，则循环前进直到 >= 今天
     */
    const calculateNextRecurrenceDate = (previousDate: Date, rule: RecurrenceRule): Date => {
      const today = startOfLocalDay(new Date())
      let next = stepNextByRule(previousDate, rule)
      while (next.getTime() < today.getTime()) {
        next = stepNextByRule(next, rule)
      }
      return next
    }

    /**
     * 生成新任务时克隆 steps：复制内容，重置完成状态并生成新 id
     */
    const cloneStepsForNewTodo = (steps: SubTodo[] | undefined): SubTodo[] => {
      if (!steps || steps.length === 0) return []
      return steps.map((s) => ({ id: uuidv4(), content: s.content, isCompleted: false }))
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

        // 如果是重复任务完成，创建新实例（按需求文档）
        if (todo.isCompleted && todo.recurrence) {
          createNextRecurrence(todo)
        }
      }
    }

    /**
     * 创建重复任务的下一个实例
     */
    const createNextRecurrence = (completedTodo: Todo) => {
      if (!completedTodo.recurrence) return
      // 基准：若无 plannedDate，用 createdAt 或今天
      const base = completedTodo.plannedDate
        ? parseToLocalDate(completedTodo.plannedDate)
        : startOfLocalDay(new Date(completedTodo.createdAt || new Date()))

      const nextDate = calculateNextRecurrenceDate(base, completedTodo.recurrence)

      // 生成新任务（遵循需求文档字段规则）
      addTodo(completedTodo.content, {
        isImportant: completedTodo.isImportant,
        myDayDate: null, // 不自动进入我的一天
        plannedDate: toIsoDateString(nextDate),
        recurrence: { ...completedTodo.recurrence },
        note: completedTodo.note,
        listId: completedTodo.listId,
        steps: cloneStepsForNewTodo(completedTodo.steps),
        isCompleted: false,
        reminderTime: null,
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

    // 清除截止日期（按需求：同时清除重复）
    const clearDueDate = (id: string) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.plannedDate = null
        // 删除截止日期时，默认也要删除重复
        todo.recurrence = null
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
        // 若设置了重复规则且尚无 plannedDate，根据规则赋默认到期（需求 6）
        if (recurrence && !todo.plannedDate) {
          const today = startOfLocalDay(new Date())
          let initial = today

          if (recurrence.type === 'weekdays') {
            const day = today.getDay()
            // 周六 -> 下周一(+2); 周日 -> 周一(+1)
            if (day === 6)
              initial = startOfLocalDay(
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
              )
            else if (day === 0)
              initial = startOfLocalDay(
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
              )
          } else if (
            recurrence.type === 'weekly' &&
            recurrence.daysOfWeek &&
            recurrence.daysOfWeek.length > 0
          ) {
            // 找到从今天起的最近匹配的星期
            const days = recurrence.daysOfWeek.slice().sort((a, b) => a - b)
            let found: Date | null = null
            for (let offset = 0; offset < 7 * Math.max(1, recurrence.interval || 1); offset++) {
              const candidate = startOfLocalDay(
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset),
              )
              if (days.includes(candidate.getDay())) {
                found = candidate
                break
              }
            }
            if (found) initial = found
          }
          todo.plannedDate = toIsoDateString(initial)
        }
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
