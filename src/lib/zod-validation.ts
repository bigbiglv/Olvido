import { z, ZodIssueCode } from 'zod'
import type { ZodErrorMap, ZodIssueOptionalMessage } from 'zod'

type MessageParams = Record<string, string | number | bigint | boolean | null | undefined>

const fieldLabelMap = new Map<string, string>()

const zhMessages: Record<string, string> = {
  'zod.required': '{field} 是必填项',
  'zod.invalidType': '{field} 类型不正确',
  'zod.exact.string': '{field} 长度必须为 {minimum} 字符',
  'zod.tooSmall.string': '{field} 至少包含 {minimum} 个字符',
  'zod.tooBig.string': '{field} 最多包含 {maximum} 个字符',
  'zod.exact.number': '{field} 必须等于 {minimum}',
  'zod.tooSmall.number': '{field} 必须大于或等于 {minimum}',
  'zod.tooBig.number': '{field} 必须小于或等于 {maximum}',
  'zod.exact.array': '{field} 必须包含 {minimum} 个元素',
  'zod.tooSmall.array': '{field} 至少包含 {minimum} 个元素',
  'zod.tooBig.array': '{field} 最多包含 {maximum} 个元素',
  'zod.invalidString.email': '请输入有效的电子邮箱地址',
  'zod.invalidString.url': '请输入有效的 URL',
  'zod.invalidString.uuid': '请输入有效的 UUID',
  'zod.invalidString.cuid': '请输入有效的 CUID',
  'zod.invalidString.regex': '{field} 格式不正确',
  'zod.invalidString.datetime': '请输入有效的日期时间',
  'zod.invalidEnum': '{field} 的值不合法',
  'zod.invalidDate': '{field} 日期无效',
  'zod.custom': '{field} 不合法',
  'zod.default': '{field} 验证失败',
  'zod.field': '此字段',
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
  const localeMessage = zhMessages[key] || key
  return interpolate(localeMessage, params)
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
