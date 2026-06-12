import { locales, type Locale } from '@/i18n/constants'

type LocaleMessageValue = string | LocaleMessages

interface LocaleMessages {
  [key: string]: LocaleMessageValue
}

function isPlainObject(value: unknown): value is LocaleMessages {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeMessages(...sources: LocaleMessages[]): LocaleMessages {
  return sources.reduce<LocaleMessages>((mergedMessages, source) => {
    Object.entries(source).forEach(([key, value]) => {
      const currentValue = mergedMessages[key]

      // 同一语言下的拆分 JSON 需要按命名空间深合并，避免 components 等节点互相覆盖。
      mergedMessages[key] =
        isPlainObject(currentValue) && isPlainObject(value)
          ? mergeMessages(currentValue, value)
          : (value as LocaleMessageValue)
    })

    return mergedMessages
  }, {})
}

const localeModules = import.meta.glob<{ default: LocaleMessages }>('./locales/*/**/*.json', {
  eager: true,
})

function createLocaleMessages(locale: Locale) {
  const localeFilePrefix = `./locales/${locale}/`
  const localeMessageFiles = Object.entries(localeModules)
    .filter(([filePath]) => filePath.startsWith(localeFilePrefix))
    .sort(([previousFilePath], [nextFilePath]) => previousFilePath.localeCompare(nextFilePath))

  return mergeMessages(...localeMessageFiles.map(([, localeModule]) => localeModule.default))
}

export const messages = locales.reduce(
  (localeMessages, locale) => {
    localeMessages[locale] = createLocaleMessages(locale)
    return localeMessages
  },
  {} as Record<Locale, LocaleMessages>,
)
