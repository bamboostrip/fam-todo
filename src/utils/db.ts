import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// 1. 定义数据表的接口 (Interface)

/**
 * 列表类型枚举
 * - system: 系统默认列表（如"任务"）
 * - user: 用户自定义列表
 */
export type ListType = 'system' | 'user'

/**
 * 列表对象接口
 */
export interface List {
  id: string
  /** 列表名称 */
  name: string
  /** 列表图标 (Emoji 或 Icon name) */
  icon?: string
  /** 列表类型：system (系统默认) 或 user (用户自定义) */
  type: ListType
  /** 创建时间 */
  createdAt: Date
}

/**
 * 子任务/步骤接口
 * 轻量级对象，依附于主任务存在
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
 * 重复规则类型
 * - daily: 每天
 * - weekdays: 工作日
 * - weekly: 每周
 * - monthly: 每月
 * - yearly: 每年
 */
export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly'

/**
 * 重复规则接口
 */
export interface RecurrenceRule {
  type: RecurrenceType
  /** 间隔数量，如每2天 */
  interval?: number
  /** 对于 weekly，指定周几 (0-6, 0=周日) */
  daysOfWeek?: number[]
  /** 对于 monthly，指定每月第几天 */
  dayOfMonth?: number
}

/**
 * 主任务对象接口
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
  myDayDate: Date | null
  /** 计划日期 (截止日期) */
  plannedDate: Date | null
  /** 提醒时间 */
  reminderTime: Date | null
  /** 重复规则 (每天/工作日/每周/每月/每年) */
  recurrence: RecurrenceRule | null
  /** 备注 */
  note: string
  /**
   * 所属列表ID
   * 关联到系统列表或自定义列表，默认为 'tasks' (任务列表)
   */
  listId: string
  /** 子任务列表，存放该任务下的所有步骤 */
  steps: SubTodo[]
  /** 创建时间 */
  createdAt: Date
  /** 完成时间 */
  completedAt: Date | null
}

// 2. 创建 Dexie 子类并声明所有表
export class MyTodoDatabase extends Dexie {
  lists!: Table<List, string>
  todos!: Table<Todo, string>

  constructor() {
    super('mySuperTodoAppDB_v3') // 更新数据库版本以适配新的数据模型

    this.version(1).stores({
      /**
       * lists 表的 Schema 定义
       * - id: 主键 (UUID)
       * - &name: 唯一索引
       * - type: 索引，用于区分系统/用户列表
       */
      lists: 'id, &name, type',

      /**
       * todos 表的 Schema 定义
       * - id: 主键 (UUID)
       * - isCompleted: 索引，用于筛选已完成/未完成
       * - listId: 索引，用于按列表筛选
       * - isImportant: 索引，用于筛选重要任务
       * - myDayDate: 索引，用于筛选"我的一天"
       * - plannedDate: 索引，用于筛选"计划内"
       */
      todos: 'id, isCompleted, listId, isImportant, myDayDate, plannedDate',
    })
  }
}

// 3. 导出数据库单例
export const db = new MyTodoDatabase()

/** 默认任务列表ID（系统列表） */
export const DEFAULT_TASKS_LIST_ID = 'tasks'

/**
 * 初始化数据库
 * 创建默认的系统列表
 */
export async function initializeDatabase() {
  const defaultListName = '任务'
  const existingList = await db.lists.where('name').equals(defaultListName).first()
  if (!existingList) {
    console.log("Creating default list '任务'...")
    await db.lists.add({
      id: DEFAULT_TASKS_LIST_ID,
      name: defaultListName,
      icon: 'ListTodo',
      type: 'system',
      createdAt: new Date(),
    })
  }
}

/**
 * 创建新的 Todo
 * @param content 任务内容
 * @param options 可选属性
 */
export function createTodo(
  content: string,
  options?: Partial<Omit<Todo, 'id' | 'createdAt'>>,
): Todo {
  return {
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
    createdAt: new Date(),
    completedAt: null,
    ...options,
  }
}

/**
 * 创建新的子任务
 * @param content 子任务内容
 */
export function createSubTodo(content: string): SubTodo {
  return {
    id: uuidv4(),
    content,
    isCompleted: false,
  }
}

/**
 * 创建新的用户自定义列表
 * @param name 列表名称
 * @param icon 列表图标
 */
export function createList(name: string, icon: string = 'ListTodo'): List {
  return {
    id: uuidv4(),
    name,
    icon,
    type: 'user',
    createdAt: new Date(),
  }
}
