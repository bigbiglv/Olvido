/**
 * 拖拽重新排序事件参数接口
 */
export interface ReorderEvent<T> {
  /** 排序后的新列表数据源数组 */
  items: T[]
  /** 本次拖拽中被移动项的唯一标识符（由 itemKey 字段指定）集合 */
  movedIds: string[]
  /** 拖拽起点项的物理索引（从 0 开始） */
  oldIndex: number
  /** 拖拽终点项的物理索引（从 0 开始） */
  newIndex: number
}
