import { createTheme } from '@/theme/create-theme'
import type { ResolvedThemeMode, ThemeMode, ThemeName, ThemeTokens } from '@/theme/types'

const systemThemeQuery = '(prefers-color-scheme: dark)'

const tokenCssVariables: Record<keyof ThemeTokens, `--${string}`> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  radius: '--radius',
  sidebarBackground: '--sidebar-background',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
}

export interface AppliedTheme {
  themeName: ThemeName
  themeMode: ThemeMode
  resolvedMode: ResolvedThemeMode
  tokens: ThemeTokens
}

export function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode !== 'system') {
    return mode
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light'
}

export function applyTheme(themeName: ThemeName, mode: ThemeMode): AppliedTheme {
  const resolvedMode = resolveThemeMode(mode)
  const tokens = createTheme(themeName, resolvedMode)

  if (typeof document !== 'undefined') {
    const root = document.documentElement

    root.classList.toggle('dark', resolvedMode === 'dark')
    root.dataset.theme = themeName
    root.dataset.themeMode = resolvedMode

    for (const tokenKey of Object.keys(tokenCssVariables) as Array<keyof ThemeTokens>) {
      root.style.setProperty(tokenCssVariables[tokenKey], tokens[tokenKey])
    }
  }

  return {
    themeName,
    themeMode: mode,
    resolvedMode,
    tokens,
  }
}

export function subscribeSystemThemeChange(onChange: (mode: ResolvedThemeMode) => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const mediaQueryList = window.matchMedia(systemThemeQuery)
  const listener = (event: MediaQueryListEvent) => {
    onChange(event.matches ? 'dark' : 'light')
  }

  mediaQueryList.addEventListener('change', listener)

  return () => {
    mediaQueryList.removeEventListener('change', listener)
  }
}
