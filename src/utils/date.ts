/**
 * 格式化文档简短更新时间
 * - 今天的文档显示: 14:30
 * - 昨天的文档显示: 昨天
 * - 更早的文档显示: 06-15
 * @param dateStr 日期对象或日期字符串
 * @returns 格式化后的时间字符串
 */
export function formatDocTime(dateStr: string | Date): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

/**
 * 格式化文档完整创建/更新时间 (例如: 2026-06-16 14:30:15)
 * @param dateStr 日期对象或日期字符串
 * @returns 格式化后的完整时间字符串
 */
export function formatFullDateTime(dateStr: string | Date): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `${y}-${m}-${d} ${time}`
}
