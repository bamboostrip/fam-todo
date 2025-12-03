import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'
import '@/style/index.css'

// 导入路由守卫设置函数
import { setupRouterGuards } from './router'
// 导入主题store
import { useThemeStore } from './store/theme'
// 导入提醒服务
import { reminderService } from './services/reminderService'

/**
 * 检查并迁移旧的 todos 数据格式
 * 在应用启动前执行
 */
function checkAndMigrateTodosData() {
  try {
    const storedData = localStorage.getItem('todos')
    if (storedData) {
      const parsed = JSON.parse(storedData)
      // 检查是否是旧格式（包含 title 字段而不是 content）
      if (parsed.todos && Array.isArray(parsed.todos) && parsed.todos.length > 0) {
        const firstTodo = parsed.todos[0]
        // 如果是旧格式，清除数据让 store 重新初始化
        if (
          'title' in firstTodo ||
          'completed' in firstTodo ||
          ('myDay' in firstTodo && typeof firstTodo.myDay === 'boolean')
        ) {
          console.log('检测到旧版本数据格式，正在迁移...')
          // 迁移数据
          parsed.todos = parsed.todos.map((old: any) => ({
            id: old.id,
            content: old.title || old.content || '',
            isCompleted: old.completed ?? old.isCompleted ?? false,
            isImportant: old.important ?? old.isImportant ?? false,
            myDayDate: old.myDay === true ? new Date().toISOString() : (old.myDayDate ?? null),
            plannedDate: old.dueDate ?? old.plannedDate ?? null,
            reminderTime: old.reminder ?? old.reminderTime ?? null,
            recurrence: old.recurrence ?? null,
            note: old.note ?? old.notes ?? '',
            listId: old.listId || 'tasks',
            steps: old.steps ?? [],
            createdAt: old.createdAt || new Date().toISOString(),
            completedAt: old.completedAt ?? null,
          }))
          localStorage.setItem('todos', JSON.stringify(parsed))
          console.log('数据迁移完成')
        }
      }
    }
  } catch (e) {
    console.error('数据迁移出错，清除旧数据:', e)
    localStorage.removeItem('todos')
  }
}

// 在创建应用前执行数据迁移
checkAndMigrateTodosData()

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 设置路由守卫
setupRouterGuards(router) // <--- 在这里调用

const app = createApp(App)
app.use(router)
app.use(store)

// 在应用挂载后初始化主题
app.mount('#app')

// 初始化主题系统
const themeStore = useThemeStore()
themeStore.initTheme()

// 启动提醒服务（定时检查任务提醒并发送系统通知）
reminderService.start()
