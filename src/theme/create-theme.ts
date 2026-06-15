import { defaultDarkTokens } from '@/theme/tokens/default-dark'
import { defaultLightTokens } from '@/theme/tokens/default-light'
import { blueDarkTokens } from '@/theme/themes/blue/dark'
import { blueLightTokens } from '@/theme/themes/blue/light'
import { violetDarkTokens } from '@/theme/themes/violet/dark'
import { violetLightTokens } from '@/theme/themes/violet/light'
import type { ResolvedThemeMode, ThemeName, ThemeTokenOverrides, ThemeTokens } from '@/theme/types'

const defaultTokensByMode: Record<ResolvedThemeMode, ThemeTokens> = {
  light: defaultLightTokens,
  dark: defaultDarkTokens,
}

const themeOverridesByName: Record<ThemeName, Record<ResolvedThemeMode, ThemeTokenOverrides>> = {
  violet: {
    light: violetLightTokens,
    dark: violetDarkTokens,
  },
  blue: {
    light: blueLightTokens,
    dark: blueDarkTokens,
  },
}

export function createTheme(themeName: ThemeName, mode: ResolvedThemeMode): ThemeTokens {
  return {
    ...defaultTokensByMode[mode],
    ...themeOverridesByName[themeName][mode],
  }
}
