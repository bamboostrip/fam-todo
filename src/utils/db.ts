import Dexie, { type Table } from 'dexie'

// 1. 定义数据表的接口 (Interface)

/**
 * 分类列表接口
 * 用于实现 “归类” 功能，默认有名为 "任务" 的列表
 */
export interface List {
  id?: number
  name: string // 列表名称, e.g., "任务", "购物清单"
  createdAt: Date
}

/**
 * TODO 任务项接口
 * 这是我们应用的核心数据结构
 */
export interface Todo {
  id?: number
  title: string // 任务标题
  notes?: string // 任务备注（可选）

  // --- 核心状态 ---
  isDone: boolean // 是否完成
  createdAt: Date // 创建时间
  completedAt: Date | null // 完成时间，未完成时为 null

  // --- 外键，用于归类 ---
  listId: number // 关联到 List 表的 id

  // --- 智能列表标记 ---
  isImportant: boolean // 是否为重要任务
  myDay: Date | null // 加入“我的一天”的日期，为 null 表示未加入
  dueDate: Date | null // 截止日期，用于“计划内”功能

  // --- 重复功能 ---
  // 'daily', 'weekly', 'monthly', 'yearly' 等
  // 或者更复杂的 RRULE 字符串，初期建议用简单字符串
  recurrenceRule: string | null
}

// 2. 创建 Dexie 子类并声明所有表
export class MyTodoDatabase extends Dexie {
  lists!: Table<List>
  todos!: Table<Todo>

  constructor() {
    super('mySuperTodoAppDB') // 数据库名称

    this.version(1).stores({
      /**
       * lists 表的 Schema 定义
       * ++id: 自增主键
       * &name: 为 name 字段创建唯一索引，确保列表名称不重复
       */
      lists: '++id, &name',

      /**
       * todos 表的 Schema 定义
       * ++id: 自增主键
       * isDone: 索引，用于快速筛选已完成/未完成
       * listId: 外键索引，用于快速查找某个列表下的所有任务
       * isImportant: 索引，用于快速生成“重要”列表
       * myDay: 索引，用于快速生成“我的一天”列表
       * dueDate: 索引，用于快速生成“计划内”列表
       */
      todos: '++id, isDone, listId, isImportant, myDay, dueDate',
    })
  }
}

// 3. 导出数据库单例
export const db = new MyTodoDatabase()

// 可以在这里添加一些初始化逻辑，比如检查默认列表是否存在
export async function initializeDatabase() {
  const defaultListName = '任务'
  const existingList = await db.lists.where('name').equals(defaultListName).first()
  if (!existingList) {
    console.log("Creating default list '任务'...")
    await db.lists.add({
      name: defaultListName,
      createdAt: new Date(),
    })
  }
}
