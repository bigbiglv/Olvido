<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

interface Props {
  doc: DocumentItem
  isSelected: boolean
}

interface Emits {
  (e: 'select', id: string): void
  (e: 'toggle', doc: DocumentItem, event: Event): void
  (e: 'contextmenu', event: MouseEvent, doc: DocumentItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleClick() {
  emit('select', props.doc.id)
}

function handleToggle(event: Event) {
  event.stopPropagation()
  emit('toggle', props.doc, event)
}

function handleContextMenu(event: MouseEvent) {
  emit('contextmenu', event, props.doc)
}

function formatDocTime(dateStr: string | Date) {
  const date = new Date(dateStr)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    // Show HH:MM
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // Show MM-DD
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}
</script>

<template>
  <div
    class="w-full text-left py-2 px-3 rounded-xl transition-all border flex items-center gap-3 cursor-pointer"
    :class="
      isSelected
        ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 shadow-sm'
        : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
    "
    data-context-region="document"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
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
        class="font-semibold text-sm truncate"
        :class="
          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-zinc-200'
        "
      >
        {{ doc.title || '无标题文档' }}
      </span>
      <span class="text-xs text-slate-400 dark:text-zinc-500 font-medium whitespace-nowrap">
        {{ formatDocTime(doc.updatedAt) }}
      </span>
    </div>
  </div>
</template>
