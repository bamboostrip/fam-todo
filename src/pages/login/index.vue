<route lang="json5">
{
  name: 'login',
  meta: {
    requiresAuth: false,
    layout: 'fullScreen',
  },
}
</route>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-2 sm:p-4 relative"
  >
    <!-- 主题切换按钮 -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle size="icon" variant="ghost" />
    </div>

    <div class="w-full max-w-sm sm:max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-6 sm:mb-8">
        <div
          class="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
        >
          <svg
            class="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground">Fam-TODO</h1>
        <p class="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          欢迎回来！请登录您的账户
        </p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-card rounded-2xl shadow-xl border p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div class="space-y-3 sm:space-y-4">
          <!-- 用户名输入框 -->
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-foreground">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <Input
                id="username"
                v-model="loginForm.username"
                placeholder="请输入用户名"
                class="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
                :class="{ 'border-destructive': formErrors.username }"
                @input="clearFieldError('username')"
              />
            </div>
            <p v-if="formErrors.username" class="text-xs sm:text-sm text-destructive">
              {{ formErrors.username }}
            </p>
          </div>

          <!-- 密码输入框 -->
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <Input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base"
                :class="{ 'border-destructive': formErrors.password }"
                @input="clearFieldError('password')"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.05 6.05M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.95 7.95M13.121 13.121a3 3 0 01-4.243 4.243"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>
            </div>
            <p v-if="formErrors.password" class="text-sm text-destructive">
              {{ formErrors.password }}
            </p>
          </div>

          <!-- 记住我选项 -->
          <div class="flex items-center space-x-2">
            <input
              id="remember"
              v-model="loginForm.remember"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label for="remember" class="text-sm text-muted-foreground">记住我</label>
          </div>
        </div>
        <!-- 登录按钮 -->
        <Button
          @click="handleLogin"
          :loading="loading"
          class="w-full h-10 sm:h-11 text-sm sm:text-base font-medium"
          :disabled="!isFormValid"
        >
          <span v-if="!loading">登录</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            登录中...
          </span>
        </Button>

        <!-- 演示账户提示 -->
        <div class="bg-muted/50 rounded-lg p-4 space-y-2">
          <p class="text-sm font-medium text-foreground">演示账户：</p>
          <div class="text-xs text-muted-foreground space-y-1">
            <p>用户名: admin / user / demo</p>
            <p>密码: 123456</p>
          </div>
        </div>

        <!-- 分割线和其他选项 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">或者</span>
          </div>
        </div>
        <!-- 其他登录选项 -->
        <div class="space-y-3">
          <Button variant="outline" class="w-full h-11" @click="handleGuestLogin">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            游客体验
          </Button>
        </div>

        <!-- 没有账户 -->
        <div class="text-center">
          <p class="text-sm text-muted-foreground">
            还没有账户？
            <button
              @click="goToRegister"
              class="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>

      <!-- 页脚信息 -->
      <div class="text-center mt-8 text-sm text-muted-foreground">
        <p>&copy; 2024 Fam-TODO. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateUsername, validatePassword } from '@/utils/validation'
import { useUserStore } from '@/store/user'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 登陆表单
const loginForm = ref({
  username: '',
  password: '',
  remember: false,
})

// 表单验证错误
const formErrors = ref({
  username: '',
  password: '',
})

// 显示密码状态
const showPassword = ref(false)

// 加载状态
const loading = ref(false)

// 验证表单
const validateForm = () => {
  const usernameValidation = validateUsername(loginForm.value.username)
  const passwordValidation = validatePassword(loginForm.value.password)

  formErrors.value.username = usernameValidation.message
  formErrors.value.password = passwordValidation.message

  return usernameValidation.isValid && passwordValidation.isValid
}

// 清除字段错误
const clearFieldError = (field: 'username' | 'password') => {
  formErrors.value[field] = ''
}

// 表单是否有效
const isFormValid = computed(() => {
  return (
    loginForm.value.username.trim() &&
    loginForm.value.password.length >= 6 &&
    !formErrors.value.username &&
    !formErrors.value.password
  )
})

// 模拟登录 API
const mockLoginApi = async (username: string, password: string) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 模拟的有效账户
  const validAccounts = [
    { username: 'admin', password: '123456' },
    { username: 'user', password: '123456' },
    { username: 'demo', password: '123456' },
  ]

  const account = validAccounts.find(
    (acc) => acc.username === username && acc.password === password,
  )

  if (!account) {
    throw new Error('用户名或密码错误')
  }
  return {
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      username,
      avatar: '', // 可以设置默认头像
      token: 'mock-jwt-token-' + Date.now(),
    },
  }
}

// 处理登录
const handleLogin = async () => {
  if (loading.value) return

  // 表单验证
  if (!validateForm()) {
    toast.error('请检查输入信息')
    return
  }

  loading.value = true
  try {
    const { username, password } = loginForm.value

    // 调用模拟登录 API
    const response = await mockLoginApi(username, password)

    // 保存登录信息到 user store
    userStore.setUserInfo(response.user)

    // 如果选择记住我，保存用户名
    if (loginForm.value.remember) {
      localStorage.setItem('rememberedUsername', username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

    toast.success('登录成功！')

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => goHome(), 500)
  } catch (error: any) {
    toast.error(error.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 游客登录
const handleGuestLogin = async () => {
  loading.value = true
  try {
    // 模拟游客登录延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 设置游客信息
    const guestInfo: IUserInfo = {
      username: 'guest',
      avatar: '',
      token: 'guest-token-' + Date.now(),
    }

    userStore.setUserInfo(guestInfo)

    toast.success('以游客身份进入')

    setTimeout(() => goHome(), 500)
  } catch (error) {
    toast.error('游客登录失败')
  } finally {
    loading.value = false
  }
}

// 跳转到首页
const goHome = () => {
  router.push('/')
}

// 跳转到注册页面
const goToRegister = () => {
  router.push({ name: 'register' })
}

// 组件挂载时检查是否有记住的用户名或从注册页面传来的用户名
onMounted(() => {
  // 检查路由查询参数中是否有用户名（从注册页面传来）
  const usernameFromQuery = route.query.username as string
  if (usernameFromQuery) {
    loginForm.value.username = usernameFromQuery
    return
  }

  // 检查本地存储中是否有记住的用户名
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    loginForm.value.username = rememberedUsername
    loginForm.value.remember = true
  }
})
</script>
