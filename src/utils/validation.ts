/**
 * 表单验证工具函数
 */

export interface ValidationResult {
  isValid: boolean
  message: string
}

/**
 * 验证用户名
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username.trim()) {
    return { isValid: false, message: '用户名不能为空' }
  }
  if (username.length < 3) {
    return { isValid: false, message: '用户名至少3个字符' }
  }
  if (username.length > 20) {
    return { isValid: false, message: '用户名不能超过20个字符' }
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return { isValid: false, message: '用户名只能包含字母、数字、下划线和中文' }
  }
  return { isValid: true, message: '' }
}

/**
 * 验证密码
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: '密码不能为空' }
  }
  if (password.length < 6) {
    return { isValid: false, message: '密码至少6个字符' }
  }
  if (password.length > 50) {
    return { isValid: false, message: '密码不能超过50个字符' }
  }
  return { isValid: true, message: '' }
}

/**
 * 验证密码确认
 */
export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: '请确认密码' }
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: '两次输入的密码不一致' }
  }
  return { isValid: true, message: '' }
}

/**
 * 验证邀请码
 */
export const validateInviteCode = (inviteCode: string): ValidationResult => {
  if (!inviteCode.trim()) {
    return { isValid: false, message: '邀请码不能为空' }
  }
  if (inviteCode.length !== 8) {
    return { isValid: false, message: '邀请码应为8位' }
  }
  if (!/^[A-Z0-9]+$/.test(inviteCode)) {
    return { isValid: false, message: '邀请码只能包含大写字母和数字' }
  }
  return { isValid: true, message: '' }
}

/**
 * 验证邮箱
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: '邮箱不能为空' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' }
  }
  return { isValid: true, message: '' }
}

/**
 * 验证手机号
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, message: '手机号不能为空' }
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: '请输入有效的手机号码' }
  }
  return { isValid: true, message: '' }
}
