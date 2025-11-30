/*
 * @Author: bamboo
 * @Date: 2025-11-28 21:55:20
 * @LastEditors: kirarin 2199141791@qq.com
 * @LastEditTime: 2025-11-30 20:50:57
 * @FilePath: \fam-todo\src\utils\theme.ts
 * @Description:
 */
import { type ListTheme } from '@/store/lists'

// Configuration for Theme Colors and their corresponding Text Colors
// You can modify the values here to change the appearance.
export const THEME_COLORS = [
  { value: '#CA5474', textColor: '#FFFFFF' },
  { value: '#C5524D', textColor: '#FFFFFF' },
  { value: '#F2E7F9', textColor: '#7D5294' },
  { value: '#D5F1E5', textColor: '#1E704D' },
  { value: '#D4F1EF', textColor: '#166F6B' },
  { value: '#FFE4E9', textColor: '#AC395D' },
  { value: '#707E89', textColor: '#FFFFFF' },
  { value: '#E7ECF0', textColor: '#586570' },
  { value: '#FCE4EC', textColor: '#AC395D' },
  { value: '#5F73C1', textColor: '#FFFFFF' },
]

export const getTextColor = (theme: ListTheme | undefined): string => {
  if (!theme) return '#AC395D' // Default fallback

  if (theme.type === 'image') return '#ffffff' // Default text color for images

  // Find the color in the configuration
  const themeConfig = THEME_COLORS.find((c) => c.value.toLowerCase() === theme.value.toLowerCase())

  if (themeConfig) {
    return themeConfig.textColor
  }

  // Fallback for unknown colors (maintain old logic or default)
  const legacyColorMap: Record<string, string> = {
    '#fce4ec': '#AC395D',
    '#f5f5f5': '#AC395D',
  }

  return legacyColorMap[theme.value] || '#AC395D'
}
