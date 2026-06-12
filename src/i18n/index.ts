import { createI18n } from 'vue-i18n'

import { DEFAULT_LOCALE, type Locale } from '@/i18n/constants'
import { handleMissingMessage, setMissingMessageLocale } from '@/i18n/fallback'
import { messages } from '@/i18n/messages'
import { setZodValidationLocale, setupZodValidationMessages } from '@/lib/zod-validation'

export { DEFAULT_LOCALE, isLocale, locales } from '@/i18n/constants'
export type { Locale } from '@/i18n/constants'

type I18nInternalLocale = `${Locale}!`

function toI18nInternalLocale(locale: Locale): I18nInternalLocale {
  return `${locale}!`
}

export const i18n = createI18n({
  legacy: false as const,
  locale: toI18nInternalLocale(DEFAULT_LOCALE),
  fallbackLocale: false,
  fallbackWarn: false,
  missing: handleMissingMessage,
  missingWarn: false,
  messages,
})

setupZodValidationMessages()

export function setI18nLocale(locale: Locale) {
  const internalLocale = toI18nInternalLocale(locale)
  const globalLocale = i18n.global.locale as unknown

  setMissingMessageLocale(locale)
  setZodValidationLocale(locale)

  if (typeof globalLocale === 'object' && globalLocale !== null && 'value' in globalLocale) {
    ;(globalLocale as { value: I18nInternalLocale }).value = internalLocale
  } else {
    ;(i18n.global as unknown as { locale: I18nInternalLocale }).locale = internalLocale
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}
