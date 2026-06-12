export const DEFAULT_LOCALE = 'zh-CN'

export const locales = ['zh-CN', 'zh-HK', 'en-US'] as const

export type Locale = (typeof locales)[number]

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
