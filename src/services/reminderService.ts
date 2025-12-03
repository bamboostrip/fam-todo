import {
  sendNotification,
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/plugin-notification'
import { useTodosStore } from '@/store/todos'

/**
 * 提醒服务
 * 负责检查任务提醒时间并发送系统通知
 */
class ReminderService {
  private checkInterval: number | null = null
  private readonly CHECK_INTERVAL_MS = 30000 // 每30秒检查一次
  private notifiedReminders = new Set<string>() // 记录已经提醒过的任务ID
  private lastCheckTime: Date | null = null // 记录上次检查时间

  /**
   * 启动提醒服务
   */
  async start() {
    console.log('🔔 提醒服务启动')

    // 请求通知权限
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }

    if (!permissionGranted) {
      console.warn('⚠️ 通知权限未授予，提醒功能将无法使用')
      return
    }

    // 设置初始检查时间为当前时间，避免启动时提醒过期任务
    this.lastCheckTime = new Date()

    // 设置定时检查
    this.checkInterval = window.setInterval(() => {
      this.checkReminders()
    }, this.CHECK_INTERVAL_MS)
  }

  /**
   * 停止提醒服务
   */
  stop() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      this.lastCheckTime = null
      console.log('🔕 提醒服务已停止')
    }
  }

  /**
   * 检查所有任务的提醒时间
   */
  private checkReminders() {
    const todosStore = useTodosStore()
    const now = new Date()

    // 获取所有未完成且有提醒时间的任务
    const tasksWithReminders = todosStore.todos.filter(
      (todo) => !todo.isCompleted && todo.reminderTime,
    )

    for (const task of tasksWithReminders) {
      if (!task.reminderTime) continue

      const reminderTime = new Date(task.reminderTime)
      const taskKey = `${task.id}-${task.reminderTime}`

      // 只提醒在上次检查之后到达提醒时间的任务
      // 这样可以避免应用启动时提醒所有过期任务
      const shouldNotify =
        now >= reminderTime &&
        !this.notifiedReminders.has(taskKey) &&
        (this.lastCheckTime === null || reminderTime >= this.lastCheckTime)

      if (shouldNotify) {
        this.sendReminderNotification(task)
        this.notifiedReminders.add(taskKey)

        // 清理旧的已提醒记录（避免内存泄漏）
        if (this.notifiedReminders.size > 100) {
          const firstKey = this.notifiedReminders.values().next().value
          if (firstKey) {
            this.notifiedReminders.delete(firstKey)
          }
        }
      }
    }

    // 更新最后检查时间
    this.lastCheckTime = now
  }

  /**
   * 发送提醒通知
   */
  private async sendReminderNotification(task: any) {
    try {
      await sendNotification({
        title: '任务提醒',
        body: task.content,
        icon: 'icons/icon.png', // 可选，使用应用图标
      })

      console.log(`📬 已发送提醒通知: ${task.content}`)
    } catch (error) {
      console.error('发送通知失败:', error)
    }
  }

  /**
   * 清除某个任务的提醒记录
   */
  clearNotifiedReminder(taskId: string) {
    // 清除所有与该任务相关的提醒记录
    const keysToDelete = Array.from(this.notifiedReminders).filter((key) => key.startsWith(taskId))
    keysToDelete.forEach((key) => this.notifiedReminders.delete(key))
  }

  /**
   * 清除所有提醒记录
   */
  clearAllNotifiedReminders() {
    this.notifiedReminders.clear()
  }
}

// 导出单例
export const reminderService = new ReminderService()
