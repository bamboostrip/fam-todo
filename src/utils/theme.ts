import { type ListTheme } from '@/store/lists'

// Configuration for Theme Colors and their corresponding Text Colors
// You can modify the values here to change the appearance.
export const THEME_COLORS = [
  { name: 'Blue', value: '#CA5474', textColor: '#FFFFFF' },
  { name: 'Red', value: '#C5524D', textColor: '#FFFFFF' },
  { name: 'Purple', value: '#F2E7F9', textColor: '#7D5294' },
  { name: 'Green', value: '#D5F1E5', textColor: '#1E704D' },
  { name: 'Teal', value: '#D4F1EF', textColor: '#166F6B' },
  { name: 'Pink', value: '#FFE4E9', textColor: '#AC395D' },
  { name: 'Gray', value: '#707E89', textColor: '#FFFFFF' },
  { name: 'Slate', value: '#E7ECF0', textColor: '#586570' },
  // Fallbacks or additional colors can be added here
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
