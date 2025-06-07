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
          <CheckCircle :size="24" class="sm:w-8 sm:h-8 text-primary-foreground" :stroke-width="2" />
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
                <User :size="16" class="sm:w-5 sm:h-5 text-muted-foreground" :stroke-width="2" />
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
                <LockKeyhole
                  :size="16"
                  class="sm:w-5 sm:h-5 text-muted-foreground"
                  :stroke-width="2"
                />
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
                <Eye
                  v-if="!showPassword"
                  :size="16"
                  class="sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
                <EyeOff
                  v-else
                  :size="16"
                  class="sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
              </button>
            </div>
            <p v-if="formErrors.password" class="text-sm text-destructive">
              {{ formErrors.password }}
            </p>
          </div>
          <!-- 记住我选项 -->
          <div class="flex items-center space-x-2">
            <Checkbox id="remember" v-model:checked="loginForm.remember" />
            <Label for="remember" class="text-sm text-muted-foreground cursor-pointer">
              记住我
            </Label>
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
            <Loader2 :size="16" class="animate-spin -ml-1 mr-2" :stroke-width="2" />
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
            <UserPlus :size="16" class="mr-2" :stroke-width="2" />
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { validateUsername, validatePassword } from '@/utils/validation'
import { useUserStore } from '@/store/user'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Eye, EyeOff, LockKeyhole, User, CheckCircle, Loader2, UserPlus } from 'lucide-vue-next'

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
      nickname: '游客',
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
