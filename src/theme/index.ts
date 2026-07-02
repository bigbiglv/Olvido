export { applyTheme, resolveThemeMode, subscribeSystemThemeChange } from '@/theme/apply-theme'
export { createTheme } from '@/theme/create-theme'
export type { AppliedTheme } from '@/theme/apply-theme'
export type {
  ResolvedThemeMode,
  ThemeMode,
  ThemeName,
  ThemeOption,
  ThemeTokenOverrides,
  ThemeTokens,
} from '@/theme/types'
export { RESOLVED_THEME_MODES, THEME_MODES, THEME_NAMES } from '@/theme/types'
export { isThemeMode, isThemeName } from '@/theme/types'
import type { ThemeOption } from '@/theme/types'

export const themeOptions: ThemeOption[] = [
  {
    name: 'violet',
    previewPrimary: 'hsl(262.1 83.3% 57.8%)',
  },
  {
    name: 'blue',
    previewPrimary: 'hsl(221.2 83.2% 53.3%)',
  },
  {
    name: 'emerald',
    previewPrimary: 'hsl(140 61% 35%)',
  },
  {
    name: 'carmine',
    previewPrimary: 'hsl(355 58% 39%)',
  },
  {
    name: 'amber',
    previewPrimary: 'hsl(25 70% 47%)',
  },
  {
    name: 'slate',
    previewPrimary: 'hsl(205 15% 37%)',
  },
]
