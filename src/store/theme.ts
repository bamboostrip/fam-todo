import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const mode = ref<ThemeMode>('system')
    const systemPrefersDark = ref(false)

    // 获取系统主题偏好
    const updateSystemPreference = () => {
      systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 计算实际应用的主题
    const actualTheme = computed(() => {
      if (mode.value === 'system') {
        return systemPrefersDark.value ? 'dark' : 'light'
      }
      return mode.value
    })

    // 应用主题到 DOM
    const applyTheme = () => {
      const root = document.documentElement
      const isDark = actualTheme.value === 'dark'

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // 设置主题模式
    const setMode = (newMode: ThemeMode) => {
      mode.value = newMode
      applyTheme()
    }

    // 切换主题（在 light、dark、system 之间循环）
    const toggleTheme = () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system']
      const currentIndex = modes.indexOf(mode.value)
      const nextIndex = (currentIndex + 1) % modes.length
      setMode(modes[nextIndex])
    }

    // 初始化主题
    const initTheme = () => {
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      // 初始化系统偏好
      updateSystemPreference()

      // 监听系统主题变化
      mediaQuery.addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
        if (mode.value === 'system') {
          applyTheme()
        }
      })

      // 应用当前主题
      applyTheme()
    }

    return {
      mode,
      systemPrefersDark,
      actualTheme,
      setMode,
      toggleTheme,
      initTheme,
    }
  },
  {
    persist: {
      key: 'fam-todo-theme',
      storage: localStorage,
      paths: ['mode'], // 只持久化 mode
    },
  },
)
