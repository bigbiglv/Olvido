import { onMounted, onUnmounted, type Ref, watch, ref } from 'vue'
import Sortable from 'sortablejs'
import { MultiDrag } from 'sortablejs'
import type { ReorderEvent } from './types'

// 向 SortableJS 挂载 MultiDrag 插件
Sortable.mount(new MultiDrag())

/** 
 * 全局单例状态：记录当前处于鼠标/触摸交互激活状态的拖拽组
 * 用于解决 SortableJS MultiDrag 插件全局跨列表拖拽的 Bug
 */
const activeSortableGroupId = ref<string | null>(null)

/**
 * 拖拽排序逻辑配置接口
 */
export interface SortableConfig<T> {
  /** 获取当前列表数据源的函数 */
  getItems: () => T[]
  /** 获取标识项唯一键的函数 */
  getItemKey: () => string
  /** 获取当前选中项唯一标识符集合的函数 */
  getSelectedIds: () => string[]
  /** 拖拽分组特定的选中样式名 */
  selectedClass?: string
  /** 拖拽分组名称 */
  group?: string
  /** 是否禁用拖拽 */
  disabled?: () => boolean
}

/**
 * 拖拽排序派发事件接口
 */
export interface SortableEmits<T> {
  /** 触发重新排序 */
  (e: 'reorder', event: ReorderEvent<T>): void
  /** 触发选中集合改变 */
  (e: 'selection-change', ids: string[]): void
  /** 触发选中某项 */
  (e: 'select', item: T): void
}

/**
 * 拖拽排序逻辑封装的 Composable
 *
 * @param containerRef 列表容器 DOM 引用
 * @param config 配置项函数集（保证响应式获取最新状态）
 * @param emit 组件的 emits 方法
 */
export function useSortable<T>(
  containerRef: Ref<HTMLElement | null>,
  config: SortableConfig<T>,
  emit: SortableEmits<T>,
) {
  let sortableInstance: Sortable | null = null
  let stopWatch: (() => void) | null = null

  onMounted(() => {
    if (!containerRef.value) return

    sortableInstance = new Sortable(containerRef.value, {
      group: config.group || 'default',
      disabled: config.disabled ? config.disabled() : false,
      animation: 150,
      multiDrag: true,
      selectedClass: config.selectedClass || 'dl-selected',
      ghostClass: 'dl-ghost',
      chosenClass: 'dl-chosen',
      dragClass: 'dl-drag',
      fallbackTolerance: 3,
      multiDragKey: 'none',

      onStart(event) {
        const dragEl = event.item
        const id = dragEl.getAttribute('data-id')
        if (!id) return

        const currentSelected = config.getSelectedIds()
        // 多选拖拽规则：拖拽未选中项，自动切换为单选
        if (!currentSelected.includes(id)) {
          const items = config.getItems()
          const itemKey = config.getItemKey()
          const targetItem = items.find((item) => String(item[itemKey as keyof T]) === id)
          if (targetItem) {
            emit('selection-change', [id])
            emit('select', targetItem)
          }
        }
      },

      onEnd(event) {
        const container = containerRef.value
        if (!container) return

        const items = config.getItems()
        const itemKey = config.getItemKey()

        // 1. 获取拖动后 DOM 树的最新的物理顺序
        const children = Array.from(container.children)
        const newOrderKeys = children
          .map((child) => child.getAttribute('data-id'))
          .filter(Boolean) as string[]

        // 2. 立即将 DOM 顺序还原为 props.items 的原始顺序。
        // 这是为了防止 SortableJS 的 DOM 变更和 Vue 内部虚拟 DOM 冲突。
        const childrenMap = new Map<string, Element>()
        children.forEach((child) => {
          const id = child.getAttribute('data-id')
          if (id) {
            childrenMap.set(id, child)
          }
        })

        const fragment = document.createDocumentFragment()
        items.forEach((item) => {
          const key = String(item[itemKey as keyof T])
          const child = childrenMap.get(key)
          if (child) {
            fragment.appendChild(child)
          }
        })
        container.appendChild(fragment)

        // 3. 构造根据 DOM 新顺序重新排布后的数组项
        const keyToItemMap = new Map(items.map((item) => [String(item[itemKey as keyof T]), item]))
        const newItems = newOrderKeys.map((key) => keyToItemMap.get(key)).filter(Boolean) as T[]

        // 4. 提取本次拖拽实际移动的项 ID 集合
        // MultiDrag 下多选时 event.oldIndicies 包含所有被移选项，单选拖动时回退到 event.item
        const movedElements =
          event.oldIndicies && event.oldIndicies.length > 0
            ? event.oldIndicies.map((x) => x.multiDragElement)
            : [event.item]

        const movedIds = movedElements
          .map((el) => el.getAttribute('data-id'))
          .filter(Boolean) as string[]

        // 5. 触发排序事件
        emit('reorder', {
          items: newItems,
          movedIds,
          oldIndex: event.oldIndex ?? -1,
          newIndex: event.newIndex ?? -1,
        })
      },
    })

    const groupId = config.group || 'default'

    const handleInteraction = () => {
      activeSortableGroupId.value = groupId
    }
    
    containerRef.value.addEventListener('mousedown', handleInteraction, { capture: true })
    containerRef.value.addEventListener('touchstart', handleInteraction, { capture: true })

    stopWatch = watch(
      [() => config.getSelectedIds(), activeSortableGroupId, () => config.disabled ? config.disabled() : false],
      ([newIds, activeGroup, disabled]) => {
        if (sortableInstance) {
          sortableInstance.option('disabled', disabled as boolean)
        }
        
        if (!containerRef.value) return
        const children = Array.from(containerRef.value.children)
        const sClass = config.selectedClass || 'dl-selected'
        const isActive = activeGroup === groupId

        children.forEach((child) => {
          const id = child.getAttribute('data-id')
          if (!id) return
          // 仅当该列表是当前活跃列表时，才将选中状态同步给 Sortable 引擎
          if (isActive && newIds.includes(id)) {
            Sortable.utils.select(child as HTMLElement)
            child.classList.add(sClass)
          } else {
            Sortable.utils.deselect(child as HTMLElement)
            child.classList.remove(sClass)
          }
        })
      },
      { deep: true, immediate: true }
    )
  })

  onUnmounted(() => {
    if (containerRef.value) {
      // previously had undefined handleInteraction listener removal
    }
    if (stopWatch) {
      stopWatch()
      stopWatch = null
    }
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
  })

  return {
    /** 暴露底层 Sortable 实例引用（用于可能的微调或测试） */
    sortableInstance,
  }
}
