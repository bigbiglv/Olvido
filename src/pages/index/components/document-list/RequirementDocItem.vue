<script setup lang="ts">
import { computed } from 'vue'

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

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isOpened: false,
  isHovered: false
})

// 计算天数差
const diffDays = computed(() => {
  if (!props.doc.deadline) return null
  const deadline = new Date(props.doc.deadline)
  if (isNaN(deadline.getTime())) return null

  const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const now = new Date()
  const tDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = dDate.getTime() - tDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 返回文本
function getRemainingDays(days: number | null): string {
  if (days === null) return '未设截止日'
  if (days === 0) return '今天截止'
  if (days === 1) return '明天截止'
  if (days === 2) return '后天截止'
  if (days > 2) return `最后 ${days} 天`
  return `超期 ${Math.abs(days)} 天`
}

// 返回视觉类
function getDeadlineClass(days: number | null, isOpened: boolean): string {
  if (days === null) return isOpened ? 'text-primary' : 'text-muted-foreground'
  if (days < 0) return 'text-rose-500 dark:text-rose-400 font-bold' 
  if (days === 0) return 'text-orange-500 dark:text-orange-400 font-semibold' 
  if (days <= 2) return 'text-amber-500 dark:text-amber-400 font-semibold' 
  return isOpened ? 'text-primary' : 'text-muted-foreground'
}
</script>

<template>
  <div
    class="relative w-full text-left flex flex-col cursor-pointer group py-2.5 px-3 rounded-xl my-0.5 transition-all duration-200 border border-transparent"
    :class="[
      props.isOpened
        ? 'bg-card shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] ring-1 ring-border z-20'
        : props.isSelected
          ? 'bg-muted z-10'
          : props.isHovered
            ? 'bg-muted/60 dark:bg-card z-10'
            : 'bg-transparent z-0',
    ]"
    data-context-region="document"
  >
    <!-- Opened state left indicator -->
    <div 
      class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 bg-primary"
      :class="props.isOpened ? 'h-3/5 opacity-100' : 'h-0 opacity-0'"
    ></div>

    <div class="flex items-center justify-between gap-3 min-w-0 w-full relative z-10">
      <!-- Title -->
      <div class="flex-1 min-w-0">
        <div
          class="text-[13.5px] transition-colors duration-200 truncate pr-4"
          :title="doc.title || '无标题文档'"
          :class="[
            props.isOpened
              ? 'text-primary font-semibold'
              : props.isSelected
                ? 'text-foreground font-medium'
                : 'text-foreground dark:text-muted-foreground group-hover:text-foreground dark:group-hover:text-foreground font-medium',
          ]"
        >
          {{ doc.title || '无标题文档' }}
        </div>
      </div>
      
      <!-- Deadline -->
      <div 
        class="text-[11px] whitespace-nowrap transition-colors duration-200 shrink-0"
        :class="getDeadlineClass(diffDays, props.isOpened)"
      >
        {{ getRemainingDays(diffDays) }}
      </div>
    </div>
  </div>
</template>
