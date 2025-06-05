<route lang="json5">
{
  name: 'register',
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
            class="w-8 h-8 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-foreground">加入 Fam-TODO</h1>
        <p class="text-muted-foreground mt-2">创建您的账户，开始高效管理</p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-card rounded-2xl shadow-xl border p-6 md:p-8 space-y-6">
        <div class="space-y-4">
          <!-- 邀请码输入框 -->
          <div class="space-y-2">
            <label for="inviteCode" class="text-sm font-medium text-foreground">邀请码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  ></path>
                </svg>
              </div>
              <Input
                id="inviteCode"
                v-model="registerForm.inviteCode"
                placeholder="请输入8位邀请码"
                class="pl-10 h-11 uppercase"
                maxlength="8"
                :class="{ 'border-destructive': formErrors.inviteCode }"
                @input="clearFieldError('inviteCode')"
              />
            </div>
            <p v-if="formErrors.inviteCode" class="text-sm text-destructive">
              {{ formErrors.inviteCode }}
            </p>
          </div>

          <!-- 用户名输入框 -->
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-foreground">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-muted-foreground"
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
                v-model="registerForm.username"
                placeholder="请输入用户名"
                class="pl-10 h-11"
                :class="{ 'border-destructive': formErrors.username }"
                @input="clearFieldError('username')"
              />
            </div>
            <p v-if="formErrors.username" class="text-sm text-destructive">
              {{ formErrors.username }}
            </p>
          </div>

          <!-- 密码输入框 -->
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-muted-foreground"
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
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="pl-10 pr-10 h-11"
                :class="{ 'border-destructive': formErrors.password }"
                @input="clearFieldError('password')"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
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

          <!-- 确认密码输入框 -->
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium text-foreground">
              确认密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.586-3.586l-2.586 2.586-4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <Input
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="pl-10 pr-10 h-11"
                :class="{ 'border-destructive': formErrors.confirmPassword }"
                @input="clearFieldError('confirmPassword')"
                @keyup.enter="handleRegister"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  v-if="!showConfirmPassword"
                  class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
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
            <p v-if="formErrors.confirmPassword" class="text-sm text-destructive">
              {{ formErrors.confirmPassword }}
            </p>
          </div>
        </div>

        <!-- 注册按钮 -->
        <Button
          @click="handleRegister"
          :loading="loading"
          class="w-full h-11 text-base font-medium"
          :disabled="!isFormValid"
        >
          <span v-if="!loading">立即注册</span>
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
            注册中...
          </span>
        </Button>

        <!-- 演示邀请码提示 -->
        <div class="bg-muted/50 rounded-lg p-4 space-y-2">
          <p class="text-sm font-medium text-foreground">演示邀请码：</p>
          <div class="text-xs text-muted-foreground space-y-1">
            <p>邀请码: FAM2024T</p>
            <p class="text-xs text-muted-foreground">*用于测试注册功能</p>
          </div>
        </div>

        <!-- 已有账户 -->
        <div class="text-center">
          <p class="text-sm text-muted-foreground">
            已有账户？
            <button
              @click="goToLogin"
              class="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              立即登录
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
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  validateUsername,
  validatePassword,
  validatePasswordConfirm,
  validateInviteCode,
} from '@/utils/validation'

const router = useRouter()

// 注册表单
const registerForm = ref({
  inviteCode: '',
  username: '',
  password: '',
  confirmPassword: '',
})

// 表单验证错误
const formErrors = ref({
  inviteCode: '',
  username: '',
  password: '',
  confirmPassword: '',
})

// 显示密码状态
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 加载状态
const loading = ref(false)

// 清除字段错误
const clearFieldError = (field: keyof typeof formErrors.value) => {
  formErrors.value[field] = ''
}

// 验证表单
const validateForm = () => {
  const inviteCodeValidation = validateInviteCode(registerForm.value.inviteCode)
  const usernameValidation = validateUsername(registerForm.value.username)
  const passwordValidation = validatePassword(registerForm.value.password)
  const confirmPasswordValidation = validatePasswordConfirm(
    registerForm.value.password,
    registerForm.value.confirmPassword,
  )

  formErrors.value.inviteCode = inviteCodeValidation.message
  formErrors.value.username = usernameValidation.message
  formErrors.value.password = passwordValidation.message
  formErrors.value.confirmPassword = confirmPasswordValidation.message

  return (
    inviteCodeValidation.isValid &&
    usernameValidation.isValid &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid
  )
}

// 表单是否有效
const isFormValid = computed(() => {
  return (
    registerForm.value.inviteCode.trim() &&
    registerForm.value.username.trim() &&
    registerForm.value.password.length >= 6 &&
    registerForm.value.confirmPassword &&
    !formErrors.value.inviteCode &&
    !formErrors.value.username &&
    !formErrors.value.password &&
    !formErrors.value.confirmPassword
  )
})

// 模拟注册 API
const mockRegisterApi = async (inviteCode: string, username: string, password: string) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // 验证邀请码
  const validInviteCodes = ['FAM2024T', 'DEMO2024', 'TEST2024']
  if (!validInviteCodes.includes(inviteCode)) {
    throw new Error('邀请码无效或已过期')
  }

  // 模拟用户名已存在的情况
  const existingUsers = ['admin', 'user', 'demo']
  if (existingUsers.includes(username)) {
    throw new Error('用户名已存在，请选择其他用户名')
  }

  return {
    message: '注册成功',
    user: {
      id: Date.now(),
      username,
      name: username,
    },
  }
}

// 处理注册
const handleRegister = async () => {
  if (loading.value) return

  // 表单验证
  if (!validateForm()) {
    toast.error('请检查输入信息')
    return
  }

  loading.value = true

  try {
    const { inviteCode, username, password } = registerForm.value

    // 调用模拟注册 API
    await mockRegisterApi(inviteCode, username, password)

    toast.success('注册成功！请返回登录页面')

    // 延迟跳转到登录页面
    setTimeout(() => {
      router.push({
        name: 'login',
        query: { username }, // 传递用户名到登录页面
      })
    }, 1000)
  } catch (error: any) {
    toast.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>
