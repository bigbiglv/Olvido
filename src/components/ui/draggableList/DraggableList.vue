<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useSortable } from './useSortable'
import type { ReorderEvent } from './types'

interface Props<T> {
  /** 列表数据源数组 */
  items: T[]
  /** 标识项的唯一键，默认为 'id' */
  itemKey?: string
  /** 当前被选中项的唯一标识符集合 */
  selectedIds?: string[]
  /** 当前处于“打开”状态的项的唯一标识符 */
  openedId?: string | null
}

interface Emits<T> {
  (e: 'select', item: T): void
  (e: 'open', item: T): void
  (e: 'selection-change', ids: string[]): void
  (e: 'context-menu', item: T, event: MouseEvent): void
  (e: 'reorder', event: ReorderEvent<T>): void
}

const { items, itemKey = 'id', selectedIds = [], openedId = null } = defineProps<Props<T>>()

const emit = defineEmits<Emits<T>>()

/** 范围选择的起点标识 */
const anchorId = ref<string | null>(null)
/** 当前鼠标悬停的项标识 */
const hoverId = ref<string | null>(null)
/** 列表容器 DOM 引用 */
const containerRef = ref<HTMLElement | null>(null)
/** 已播放过入场动画的项标识集合，防止拖拽时重复播放 */
const animatedIds = ref(new Set<string>())

function onAnimationEnd(item: T) {
  animatedIds.value.add(String(item[itemKey as keyof T]))
}

// 挂载 Sortable 逻辑
useSortable<T>(
  containerRef,
  {
    getItems: () => items,
    getItemKey: () => itemKey,
    getSelectedIds: () => selectedIds,
  },
  emit,
)

/**
 * 处理项的单击事件（支持 Ctrl / Shift 修饰符）
 */
function handleItemClick(item: T, event: MouseEvent) {
  const currentId = String(item[itemKey as keyof T])

  if (event.ctrlKey || event.metaKey) {
    // Ctrl + Click: 切换当前项选中状态
    let newSelected = [...selectedIds]
    if (newSelected.includes(currentId)) {
      newSelected = newSelected.filter((id) => id !== currentId)
    } else {
      newSelected.push(currentId)
    }
    emit('selection-change', newSelected)
    // 更新范围选择起点
    anchorId.value = currentId
  } else if (event.shiftKey) {
    // Shift + Click: 范围选择
    const anchor = anchorId.value || currentId
    const anchorIndex = items.findIndex((x) => String(x[itemKey as keyof T]) === anchor)
    const currentIndex = items.findIndex((x) => String(x[itemKey as keyof T]) === currentId)

    if (anchorIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(anchorIndex, currentIndex)
      const end = Math.max(anchorIndex, currentIndex)
      const rangeIds = items.slice(start, end + 1).map((x) => String(x[itemKey as keyof T]))
      emit('selection-change', rangeIds)
    }
  } else {
    // 普通单击
    emit('selection-change', [currentId])
    emit('select', item)
    // 更新范围选择起点
    anchorId.value = currentId
    emit('open', item)
  }
}

/**
 * 处理项的双击事件
 */
function handleItemDblClick(item: T) {
  const currentId = String(item[itemKey as keyof T])
  emit('selection-change', [currentId])
  emit('select', item)
  anchorId.value = currentId
  emit('open', item)
}

/**
 * 处理项的右键菜单事件
 */
function handleItemContextMenu(item: T, event: MouseEvent) {
  event.preventDefault()
  const currentId = String(item[itemKey as keyof T])

  if (selectedIds.includes(currentId)) {
    // 情况一：右键当前已选中项，保持当前选区，直接触发 contextMenu
    emit('context-menu', item, event)
  } else {
    // 情况二：右键未选中项，清空并仅选择当前项，触发 selectionChange，再触发 contextMenu
    emit('selection-change', [currentId])
    emit('context-menu', item, event)
  }
}

/**
 * 处理鼠标进入项事件
 */
function handleItemMouseEnter(item: T) {
  hoverId.value = String(item[itemKey as keyof T])
}

/**
 * 处理鼠标离开项事件
 */
function handleItemMouseLeave() {
  hoverId.value = null
}
</script>

<template>
  <div ref="containerRef" class="dl-container" @click.self="emit('selection-change', [])">
    <div
      v-for="(item, index) in items"
      :key="String(item[itemKey as keyof T])"
      :data-id="String(item[itemKey as keyof T])"
      class="dl-item"
      :class="{
        'animate-list-enter': !animatedIds.has(String(item[itemKey as keyof T])),
        'dl-selected': selectedIds.includes(String(item[itemKey as keyof T])),
      }"
      :style="{ animationDelay: !animatedIds.has(String(item[itemKey as keyof T])) ? `${Math.min(index, 15) * 40}ms` : '0ms' }"
      @animationend="onAnimationEnd(item)"
      @click="handleItemClick(item, $event)"
      @dblclick="handleItemDblClick(item)"
      @contextmenu="handleItemContextMenu(item, $event)"
      @mouseenter="handleItemMouseEnter(item)"
      @mouseleave="handleItemMouseLeave"
    >
      <slot
        name="item"
        :item="item"
        :selected="selectedIds.includes(String(item[itemKey as keyof T]))"
        :opened="openedId === String(item[itemKey as keyof T])"
        :hover="hoverId === String(item[itemKey as keyof T])"
      />
    </div>
  </div>
</template>

<style scoped>
.dl-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dl-item {
  user-select: none;
  cursor: pointer;
}

/* SortableJS drag classes */
.dl-ghost {
  opacity: 0.4 !important;
  background-color: var(--color-slate-100, #f1f5f9) !important;
}

.dl-chosen {
  background-color: var(--color-slate-50, #f8fafc) !important;
}

.dl-drag {
  cursor: grabbing !important;
}

.animate-list-enter {
  animation: list-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes list-enter {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
