import { defaultDarkTokens } from '@/theme/tokens/default-dark'
import { defaultLightTokens } from '@/theme/tokens/default-light'
import { blueDarkTokens } from '@/theme/themes/blue/dark'
import { blueLightTokens } from '@/theme/themes/blue/light'
import { violetDarkTokens } from '@/theme/themes/violet/dark'
import { violetLightTokens } from '@/theme/themes/violet/light'
import { emeraldDarkTokens } from '@/theme/themes/emerald/dark'
import { emeraldLightTokens } from '@/theme/themes/emerald/light'
import { carmineDarkTokens } from '@/theme/themes/carmine/dark'
import { carmineLightTokens } from '@/theme/themes/carmine/light'
import { amberDarkTokens } from '@/theme/themes/amber/dark'
import { amberLightTokens } from '@/theme/themes/amber/light'
import { slateDarkTokens } from '@/theme/themes/slate/dark'
import { slateLightTokens } from '@/theme/themes/slate/light'
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
  emerald: {
    light: emeraldLightTokens,
    dark: emeraldDarkTokens,
  },
  carmine: {
    light: carmineLightTokens,
    dark: carmineDarkTokens,
  },
  amber: {
    light: amberLightTokens,
    dark: amberDarkTokens,
  },
  slate: {
    light: slateLightTokens,
    dark: slateDarkTokens,
  },
}

export function createTheme(themeName: ThemeName, mode: ResolvedThemeMode): ThemeTokens {
  return {
    ...defaultTokensByMode[mode],
    ...themeOverridesByName[themeName][mode],
  }
}
