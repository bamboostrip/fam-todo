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
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-1.5 sm:p-3 relative"
  >
    <!-- 主题切换按钮 -->
    <div class="absolute top-3 right-3 z-10">
      <ThemeToggle size="icon" variant="ghost" class="w-8 h-8" />
    </div>
    <div class="w-full max-w-xs sm:max-w-sm">
      <!-- Logo 和标题 -->
      <div class="text-center mb-4 sm:mb-6">
        <div
          class="mx-auto w-10 h-10 sm:w-14 sm:h-14 bg-primary rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg"
        >
          <UserPlus :size="20" class="text-primary-foreground" :stroke-width="2" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">加入 Fam-TODO</h1>
        <p class="text-muted-foreground mt-1 text-xs sm:text-sm">创建您的账户，开始高效管理</p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-card rounded-xl shadow-lg border p-4 sm:p-6 space-y-4">
        <div class="space-y-3">
          <!-- 邀请码输入框 -->
          <div class="space-y-1.5">
            <label for="inviteCode" class="text-xs font-medium text-foreground">邀请码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Key :size="16" class="text-muted-foreground" :stroke-width="2" />
              </div>
              <Input
                id="inviteCode"
                v-model="registerForm.inviteCode"
                placeholder="请输入8位邀请码"
                class="pl-9 h-9 sm:h-10 uppercase text-xs sm:text-sm"
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
          <div class="space-y-1.5">
            <label for="username" class="text-xs font-medium text-foreground">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <User :size="16" class="text-muted-foreground" :stroke-width="2" />
              </div>
              <Input
                id="username"
                v-model="registerForm.username"
                placeholder="请输入用户名"
                class="pl-9 h-9 sm:h-10 text-xs sm:text-sm"
                :class="{ 'border-destructive': formErrors.username }"
                @input="clearFieldError('username')"
              />
            </div>
            <p v-if="formErrors.username" class="text-sm text-destructive">
              {{ formErrors.username }}
            </p>
          </div>

          <!-- 密码输入框 -->
          <div class="space-y-1.5">
            <label for="password" class="text-xs font-medium text-foreground">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <LockKeyhole :size="16" class="text-muted-foreground" :stroke-width="2" />
              </div>
              <Input
                id="password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="pl-9 pr-9 h-9 sm:h-10 text-xs sm:text-sm"
                :class="{ 'border-destructive': formErrors.password }"
                @input="clearFieldError('password')"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                @click="showPassword = !showPassword"
              >
                <Eye
                  v-if="!showPassword"
                  :size="16"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
                <EyeOff
                  v-else
                  :size="16"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
              </button>
            </div>
            <p v-if="formErrors.password" class="text-sm text-destructive">
              {{ formErrors.password }}
            </p>
          </div>

          <!-- 确认密码输入框 -->
          <div class="space-y-1.5">
            <label for="confirmPassword" class="text-xs font-medium text-foreground">
              确认密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <CircleCheckBig :size="16" class="text-muted-foreground" :stroke-width="2" />
              </div>
              <Input
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="pl-9 pr-9 h-9 sm:h-10 text-xs sm:text-sm"
                :class="{ 'border-destructive': formErrors.confirmPassword }"
                @input="clearFieldError('confirmPassword')"
                @keyup.enter="handleRegister"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye
                  v-if="!showConfirmPassword"
                  :size="16"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
                <EyeOff
                  v-else
                  :size="16"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  :stroke-width="2"
                />
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
          class="w-full h-9 sm:h-10 text-sm font-medium"
          :disabled="!isFormValid"
        >
          <span v-if="!loading">立即注册</span>
          <span v-else class="flex items-center">
            <Loader2 :size="14" class="animate-spin -ml-1 mr-1.5" :stroke-width="2" />
            注册中...
          </span>
        </Button>

        <!-- 演示邀请码提示 -->
        <div class="bg-muted/50 rounded-md p-2.5 space-y-1.5">
          <p class="text-xs font-medium text-foreground">演示邀请码：</p>
          <div class="text-2xs text-muted-foreground space-y-0.5">
            <p>邀请码: FAM2024T</p>
            <p class="text-2xs text-muted-foreground">*用于测试注册功能</p>
          </div>
        </div>

        <!-- 已有账户 -->
        <div class="text-center">
          <p class="text-xs text-muted-foreground">
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
      <div class="text-center mt-6 text-xs text-muted-foreground">
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
import {
  Key,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  CircleCheckBig,
  Loader2,
  UserPlus,
} from 'lucide-vue-next'

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
