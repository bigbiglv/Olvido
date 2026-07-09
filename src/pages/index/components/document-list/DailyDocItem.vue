<script setup lang="ts">
import { formatDocTime } from '@/utils/date'

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
  isHovered: false,
})
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

      <!-- Time -->
      <div
        class="text-[11px] font-medium whitespace-nowrap transition-colors duration-200 shrink-0"
        :class="[
          props.isOpened
            ? 'text-primary'
            : props.isSelected
              ? 'text-muted-foreground'
              : 'text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground',
        ]"
      >
        {{ formatDocTime(doc.updatedAt) }}
      </div>
    </div>
  </div>
</template>
