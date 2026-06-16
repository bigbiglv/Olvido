<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'

interface Props {
  /** 文档数据项 */
  doc: DocumentItem
  /** 是否被选中 */
  isSelected?: boolean
  /** 是否处于打开状态（Active） */
  isOpened?: boolean
  /** 是否处于悬停状态（Hover） */
  isHovered?: boolean
}

interface Emits {
  /** 触发切换文档完成状态 */
  (e: 'toggle', doc: DocumentItem, event: Event): void
}

const { doc, isSelected = false, isOpened = false, isHovered = false } = defineProps<Props>()

const emit = defineEmits<Emits>()

/**
 * 切换文档完成状态事件处理
 */
function handleToggle(event: Event) {
  event.stopPropagation()
  emit('toggle', doc, event)
}

// 1. 使用 computed 统一计算天数差，并提供健壮的无效日期容错
const diffDays = computed(() => {
  if (!doc.deadline) return null
  const deadline = new Date(doc.deadline)
  if (isNaN(deadline.getTime())) return null // 容错：无效日期直接返回 null

  const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const now = new Date()
  const tDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = dDate.getTime() - tDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 2. 根据天数差返回文本
function getRemainingDays(days: number | null): string {
  if (days === null) return '未设截止日'
  if (days === 0) return '今天截止'
  if (days === 1) return '明天截止'
  if (days === 2) return '后天截止'
  if (days > 2) return `${days}天后截止`
  return `超期 ${Math.abs(days)} 天`
}

// 3. 根据天数差返回视觉警示类
function getDeadlineClass(days: number | null): string {
  if (days === null) return 'text-slate-400 dark:text-zinc-500'
  if (days < 0) return 'text-rose-500 dark:text-rose-400 font-semibold' // 超期
  if (days <= 1) return 'text-amber-500 dark:text-amber-400 font-semibold' // 今天/明天截止
  return 'text-slate-400 dark:text-zinc-500' // 后天及以后
}
</script>

<template>
  <div
    class="w-full text-left py-2 px-3 rounded-xl transition-all border flex items-center gap-3 cursor-pointer"
    :class="[
      isSelected
        ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 shadow-sm'
        : isHovered
          ? 'bg-slate-50/50 dark:bg-zinc-800/30 border-slate-100/50 dark:border-zinc-800/20'
          : 'bg-transparent border-transparent',
    ]"
    data-context-region="document"
  >
    <!-- Completion checkbox -->
    <button
      class="size-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0"
      :class="
        doc.completed
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none'
          : 'border-slate-300 dark:border-zinc-700 text-transparent hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-300 dark:hover:text-zinc-600'
      "
      @click="handleToggle"
    >
      <CheckCircle2 class="size-3.5 fill-current" />
    </button>

    <!-- Title and Time -->
    <div class="flex items-center justify-between gap-3 min-w-0 flex-1">
      <span
        class="font-semibold text-sm truncate transition-colors"
        :class="[
          isOpened
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-700 dark:text-zinc-200',
        ]"
      >
        {{ doc.title || '无标题文档' }}
      </span>
      <span class="text-xs whitespace-nowrap" :class="getDeadlineClass(diffDays)">
        {{ getRemainingDays(diffDays) }}
      </span>
    </div>
  </div>
</template>
