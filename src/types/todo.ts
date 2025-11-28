/**
 * Todo 应用数据模型类型定义
 * 根据 Requirement.md 需求文档设计
 */

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
 * 列表类型
 * - system: 系统默认列表（智能列表）
 * - user: 用户自定义列表
 */
export type ListType = 'system' | 'user'

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
   * 格式: ISO 8601 日期字符串
   */
  myDayDate: string | null
  /** 计划日期 (截止日期)，格式: ISO 8601 日期字符串 */
  plannedDate: string | null
  /** 提醒时间，格式: ISO 8601 日期时间字符串 */
  reminderTime: string | null
  /** 重复规则 (每天/工作日/每周/每月/每年) */
  recurrence: RecurrenceRule | null
  /** 备注 */
  note: string
  /**
   * 所属列表ID
   * 关联到系统列表或自定义列表，默认为 'tasks'
   */
  listId: string
  /** 子任务列表，存放该任务下的所有步骤 */
  steps: SubTodo[]
  /** 创建时间，格式: ISO 8601 日期时间字符串 */
  createdAt: string
  /** 完成时间，格式: ISO 8601 日期时间字符串 */
  completedAt: string | null
}

/**
 * 列表对象接口
 */
export interface TodoList {
  /** 唯一标识符 */
  id: string
  /** 列表名称 */
  title: string
  /** 列表图标 (Emoji 或 Icon name) */
  icon: string
  /** 列表类型：system (系统默认) 或 user (用户自定义) */
  type: ListType
}

/** 默认任务列表ID（系统列表） */
export const DEFAULT_TASKS_LIST_ID = 'tasks'

/**
 * 上下文创建选项
 * 用于在不同视图创建任务时自动填充默认属性
 */
export type CreateTodoContext =
  | 'my-day' // 我的一天视图
  | 'important' // 重要视图
  | 'planned' // 计划内视图
  | 'tasks' // 任务视图
  | 'custom-list' // 自定义列表视图
