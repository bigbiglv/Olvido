import { z, ZodIssueCode } from 'zod'
import type { ZodErrorMap, ZodIssueOptionalMessage } from 'zod'

import { DEFAULT_LOCALE, type Locale } from '@/i18n/constants'
import { messages } from '@/i18n/messages'

type MessageNode = string | { [key: string]: MessageNode }
type MessageParams = Record<string, string | number | bigint | boolean | null | undefined>

let currentLocale: Locale = DEFAULT_LOCALE
const fieldLabelMap = new Map<string, string>()

/**
 * 判断值是否为对象类型的消息记录
 */
function isMessageRecord(value: unknown): value is Record<string, MessageNode> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 解析嵌套对象中的消息值（根据路径键名）
 */
function resolveMessageValue(source: Record<string, unknown>, key: string) {
  return key.split('.').reduce<unknown>((currentValue, keySegment) => {
    if (!isMessageRecord(currentValue)) {
      return undefined
    }

    return currentValue[keySegment]
  }, source)
}

/**
 * 替换消息文本中的变量模板
 */
function interpolate(message: string, params: MessageParams) {
  return message.replace(/\{(\w+)\}/g, (matchedText, paramName: string) => {
    const value = params[paramName]

    return value === undefined || value === null ? matchedText : String(value)
  })
}

/**
 * 根据当前语言环境翻译校验消息
 */
function translateValidationMessage(key: string, params: MessageParams = {}) {
  const localeMessage = resolveMessageValue(messages[currentLocale], key)

  if (typeof localeMessage === 'string') {
    return interpolate(localeMessage, params)
  }

  if (currentLocale !== DEFAULT_LOCALE) {
    const fallbackMessage = resolveMessageValue(messages[DEFAULT_LOCALE], key)

    if (typeof fallbackMessage === 'string') {
      return interpolate(fallbackMessage, params)
    }
  }

  return key
}

/**
 * 获取 Zod 校验错误发生的字段路径
 */
function getIssuePath(issue: ZodIssueOptionalMessage) {
  return issue.path.map((pathSegment) => String(pathSegment)).join('.')
}

/**
 * 获取 Zod 校验错误对应的字段标签。
 */
function getIssueField(issue: ZodIssueOptionalMessage) {
  const issuePath = getIssuePath(issue)

  if (!issuePath) {
    return translateValidationMessage('zod.field')
  }

  const fieldLabel = fieldLabelMap.get(issuePath)

  if (fieldLabel) {
    return fieldLabel
  }

  return issuePath
}

/**
 * 获取错误类型对应的大小提示前缀
 */
function getSizeIssueKeyPrefix(issueType: string) {
  switch (issueType) {
    case 'array':
      return 'array'
    case 'number':
    case 'bigint':
      return 'number'
    case 'set':
      return 'set'
    case 'date':
      return 'date'
    case 'string':
    default:
      return 'string'
  }
}

/**
 * 获取无效字符串的验证类型
 */
function getInvalidStringValidation(
  issue: Extract<ZodIssueOptionalMessage, { code: 'invalid_string' }>,
) {
  return typeof issue.validation === 'string' ? issue.validation : 'default'
}

/**
 * Zod 错误信息自定义映射逻辑
 */
const zodErrorMap: ZodErrorMap = (issue, ctx) => {
  const field = getIssueField(issue)

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return {
          message: translateValidationMessage('zod.required', { field }),
        }
      }

      return {
        message: translateValidationMessage('zod.invalidType', { field }),
      }

    case ZodIssueCode.too_small: {
      if (issue.type === 'string' && Number(issue.minimum) <= 1 && issue.inclusive) {
        return {
          message: translateValidationMessage('zod.required', { field }),
        }
      }

      const type = getSizeIssueKeyPrefix(issue.type)
      const sizeKey = issue.exact ? `zod.exact.${type}` : `zod.tooSmall.${type}`

      return {
        message: translateValidationMessage(sizeKey, {
          field,
          minimum: issue.minimum,
        }),
      }
    }

    case ZodIssueCode.too_big: {
      const type = getSizeIssueKeyPrefix(issue.type)
      const sizeKey = issue.exact ? `zod.exact.${type}` : `zod.tooBig.${type}`

      return {
        message: translateValidationMessage(sizeKey, {
          field,
          maximum: issue.maximum,
        }),
      }
    }

    case ZodIssueCode.invalid_string: {
      const validation = getInvalidStringValidation(issue)

      return {
        message: translateValidationMessage(`zod.invalidString.${validation}`, {
          field,
        }),
      }
    }

    case ZodIssueCode.invalid_enum_value:
      return {
        message: translateValidationMessage('zod.invalidEnum', { field }),
      }

    case ZodIssueCode.invalid_date:
      return {
        message: translateValidationMessage('zod.invalidDate', { field }),
      }

    case ZodIssueCode.custom:
      if (typeof issue.params?.i18nKey === 'string') {
        return {
          message: translateValidationMessage(issue.params.i18nKey, {
            field,
            ...issue.params,
          }),
        }
      }

      return {
        message: translateValidationMessage('zod.custom', { field }),
      }

    default:
      return {
        message: ctx.defaultError || translateValidationMessage('zod.default', { field }),
      }
  }
}

/**
 * 设置 Zod 验证的本地化语言环境
 */
export function setZodValidationLocale(locale: Locale) {
  currentLocale = locale
}

/**
 * 注册表单字段标签，供 Zod 全局错误映射在运行时生成字段名。
 */
export function registerZodFieldLabel(name: string, label: string) {
  fieldLabelMap.set(name, label)

  return () => {
    if (fieldLabelMap.get(name) === label) {
      fieldLabelMap.delete(name)
    }
  }
}

/**
 * 全局配置 Zod 错误信息映射表
 */
export function setupZodValidationMessages() {
  z.setErrorMap(zodErrorMap)
}
