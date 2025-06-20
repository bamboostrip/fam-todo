import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// 1. 定义数据表的接口 (Interface)

export interface List {
  // [修改 1] id 从 number? 改为 string
  id: string
  name: string
  createdAt: Date
}

export interface Todo {
  // [修改 2] id 从 number? 改为 string
  id: string
  title: string
  notes?: string

  isDone: boolean
  createdAt: Date
  completedAt: Date | null

  // [修改 3] 外键 listId 也必须改为 string，以匹配 List 表的 id 类型
  listId: string

  isImportant: boolean
  myDay: Date | null
  dueDate: Date | null

  recurrenceRule: string | null
}

// 2. 创建 Dexie 子类并声明所有表
export class MyTodoDatabase extends Dexie {
  lists!: Table<List, string> // [修改 4] 明确指定主键类型为 string
  todos!: Table<Todo, string> // 明确指定主键类型为 string

  constructor() {
    super('mySuperTodoAppDB_v2') // 建议修改数据库名称，以防与旧的数字ID版本冲突

    this.version(1).stores({
      /**
       * lists 表的 Schema 定义
       * [修改 5] 主键从 '++id' 改为 'id'。
       * 不再使用 '++'，因为 ID 不再是自增的，而是我们手动提供的 UUID 字符串。
       */
      lists: 'id, &name',

      /**
       * todos 表的 Schema 定义
       * [修改 6] 主键从 '++id' 改为 'id'。
       * 其他索引保持不变，它们对于查询性能至关重要。
       */
      todos: 'id, isDone, listId, isImportant, myDay, dueDate',
    })
  }
}

// 3. 导出数据库单例
export const db = new MyTodoDatabase()

// [修改 7] 初始化逻辑现在需要手动提供 ID
export async function initializeDatabase() {
  const defaultListName = '任务'
  const existingList = await db.lists.where('name').equals(defaultListName).first()
  if (!existingList) {
    console.log("Creating default list '任务'...")
    // 为默认列表也生成一个 UUID
    const defaultListId = uuidv4()
    await db.lists.add({
      id: defaultListId,
      name: defaultListName,
      createdAt: new Date(),
    })
  }
}
