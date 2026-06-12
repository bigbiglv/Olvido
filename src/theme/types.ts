export const THEME_NAMES = ['violet', 'blue'] as const
export const THEME_MODES = ['light', 'dark', 'system'] as const
export const RESOLVED_THEME_MODES = ['light', 'dark'] as const

export type ThemeName = (typeof THEME_NAMES)[number]
export type ThemeMode = (typeof THEME_MODES)[number]
export type ResolvedThemeMode = (typeof RESOLVED_THEME_MODES)[number]

export interface ThemeTokens {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  radius: string
  sidebarBackground: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
}

export type ThemeTokenOverrides = Partial<ThemeTokens>

export interface ThemeOption {
  name: ThemeName
  previewPrimary: string
}

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && THEME_NAMES.includes(value as ThemeName)
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)
}
