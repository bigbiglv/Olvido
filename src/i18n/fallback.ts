import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/constants'
import { messages } from '@/i18n/messages'

const DEFAULT_MISSING_MESSAGE = '文案暂不可用'

let currentLocale: Locale = DEFAULT_LOCALE

export function setMissingMessageLocale(locale: Locale) {
  currentLocale = locale
}

function resolveMessageValue(source: Record<string, unknown>, key: string) {
  return key.split('.').reduce<unknown>((currentValue, keySegment) => {
    if (typeof currentValue !== 'object' || currentValue === null) {
      return undefined
    }

    return (currentValue as Record<string, unknown>)[keySegment]
  }, source)
}

function normalizeMissingLocale(locale: string): Locale {
  const normalizedLocale = locale.replace(/!$/, '')

  if (isLocale(normalizedLocale)) {
    return normalizedLocale
  }

  // vue-i18n 的隐式地区回退可能传入 zh / en，这里统一还原为当前应用语言。
  if (normalizedLocale === currentLocale.split('-')[0]) {
    return currentLocale
  }

  return currentLocale
}

function logMissingMessage(locale: Locale, key: string) {
  if (import.meta.env.DEV) {
    console.error(`[i18n] Missing message: locale="${locale}", key="${key}"`)
  } else {
    console.error(`[i18n] Missing message: ${locale}:${key}`)
  }
}

export function handleMissingMessage(locale: string, key: string) {
  const missingLocale = normalizeMissingLocale(locale)

  logMissingMessage(missingLocale, key)

  if (missingLocale !== DEFAULT_LOCALE) {
    const fallbackMessage = resolveMessageValue(messages[DEFAULT_LOCALE], key)

    if (typeof fallbackMessage === 'string') {
      return fallbackMessage
    }

    logMissingMessage(DEFAULT_LOCALE, key)
  }

  return DEFAULT_MISSING_MESSAGE
}
