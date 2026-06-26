/** 日期单位 */
export type DateUnit = 'year' | 'month' | 'day'

/** 日期差值数据 */
export interface DiffData {
  /** 天数差（正为未来，负为过去） */
  diff: number
  /** 文本显示类型 */
  mainType: 'word' | 'number'
  /** 预设词汇 (如: 今天, 明天) */
  mainText: string
  /** 绝对值天数 */
  mainNumber: number
  /** 后缀词 (如: 天后, 天前) */
  mainSuffix: string
  /** 包含的工作日天数 */
  workdays: number
}

/** 拾取器配置 */
export interface PickerConfig {
  /** 时间单位 */
  unit: DateUnit
  /** Day.js 格式化字符串 */
  format: string
  /** 默认宽度类名 */
  displayWidth: string
  /** 弹窗宽度类名 */
  popupWidth: string
}
