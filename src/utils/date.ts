/**
 * 格式化文档简短更新时间
 * - 今天的文档显示: 14:30
 * - 昨天的文档显示: 昨天 14:30
 * - 今年的文档显示: 06-15 14:30
 * - 更早的文档显示: 2025-06-15 14:30
 * @param dateStr 日期对象或日期字符串
 * @returns 格式化后的时间字符串
 */
export function formatDocTime(dateStr: string | Date): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()

  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const time = `${hh}:${mm}`

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const diffTime = todayOnly.getTime() - dateOnly.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return time
  } else if (diffDays === 1) {
    return `昨天 ${time}`
  } else if (date.getFullYear() === today.getFullYear()) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day} ${time}`
  } else {
    const yStr = date.getFullYear().toString()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${yStr}-${month}-${day} ${time}`
  }
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
