import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/constants'

const browserLocaleMap: Record<string, Locale> = {
  'zh-CN': 'zh-CN',
  'zh-SG': 'zh-CN',
  'zh-HK': 'zh-HK',
  'zh-TW': 'zh-HK',
  'zh-MO': 'zh-HK',
  en: 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-US',
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE
  }

  const browserLocales = [navigator.language, ...navigator.languages]

  for (const browserLocale of browserLocales) {
    if (isLocale(browserLocale)) {
      return browserLocale
    }

    const normalizedLocale = browserLocale.split('-')[0]
    const matchedLocale = browserLocaleMap[browserLocale] ?? browserLocaleMap[normalizedLocale]

    if (matchedLocale) {
      return matchedLocale
    }
  }

  return DEFAULT_LOCALE
}
