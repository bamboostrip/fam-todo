import { computed, watch } from 'vue'
import { useTodosStore } from '@/store/todos'
import { invoke } from '@tauri-apps/api/core'

/**
 * 任务栏角标管理
 * 显示"我的一天"和"重要"任务的总数（去重）
 */
export function useBadgeCount() {
  const todosStore = useTodosStore()

  /**
   * 计算角标数字
   * 规则：我的一天 + 重要任务，如果一个任务同时在两个列表中，只计算一次
   */
  const badgeCount = computed(() => {
    const myDayTodos = todosStore.myDayTodos
    const importantTodos = todosStore.importantTodos

    // 使用 Set 来去重
    const uniqueTodoIds = new Set<string>()

    // 添加"我的一天"的任务
    myDayTodos.forEach((todo) => {
      uniqueTodoIds.add(todo.id)
    })

    // 添加"重要"的任务
    importantTodos.forEach((todo) => {
      uniqueTodoIds.add(todo.id)
    })

    return uniqueTodoIds.size
  })

  /**
   * 使用 Canvas 生成角标图像数据 (RGBA)
   */
  const generateBadgeData = async (
    count: number,
  ): Promise<{ rgba: number[]; width: number; height: number } | null> => {
    if (count === 0) return null

    // 提升到 512x512 超高清分辨率，确保缩放后依然锐利
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', {
      // 启用抗锯齿，提升渲染质量
      alpha: true,
      desynchronized: false,
    })

    if (!ctx) return null

    // 优化Canvas渲染质量
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 1. 绘制蓝色圆形背景 (Windows 风格蓝: #0078D7)
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 4 // 留一点边缘

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = '#0078D7'
    ctx.fill()

    // 2. 绘制文字
    const text = count > 99 ? '99+' : count.toString()

    // 字体设置：根据 512px 调整大小
    const fontSize = count > 99 ? 256 : 320
    // 使用系统字体栈，确保渲染效果最好
    ctx.font = `bold ${fontSize}px "Segoe UI", "Microsoft YaHei", Arial, sans-serif`
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 优化文字渲染质量
    ctx.textRendering = 'optimizeLegibility'

    // 垂直居中修正 - 减小偏移量使数字更居中
    const yOffset = size * 0.02 // 从0.06降低到0.02，减少向下偏移
    ctx.fillText(text, centerX, centerY + yOffset)

    // 3. 获取 RGBA 数据
    const imageData = ctx.getImageData(0, 0, size, size)
    const rgba = Array.from(imageData.data)

    return { rgba, width: size, height: size }
  }

  /**
   * 更新任务栏角标
   */
  const updateBadge = async (count: number) => {
    try {
      console.log('Updating badge count to:', count)

      if (count === 0) {
        await invoke('set_badge_count', { count, rgba: null, width: null, height: null })
      } else {
        const badgeData = await generateBadgeData(count)
        if (badgeData) {
          await invoke('set_badge_count', {
            count,
            rgba: badgeData.rgba,
            width: badgeData.width,
            height: badgeData.height,
          })
        }
      }
    } catch (error) {
      console.error('Failed to update badge count:', error)
    }
  }

  /**
   * 监听角标数字变化并更新
   */
  watch(
    badgeCount,
    (newCount) => {
      updateBadge(newCount)
    },
    { immediate: true },
  )

  return {
    badgeCount,
    updateBadge,
  }
}
