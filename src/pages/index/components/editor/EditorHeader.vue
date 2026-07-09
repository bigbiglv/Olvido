<script setup lang="ts">
import { Edit2, Calendar, Clock } from 'lucide-vue-next'
import { formatDocTime, formatFullDateTime } from '@/utils/date'

defineProps<{
  title: string
  createdAt: string | Date
  updatedAt: string | Date
  isSaving: boolean
  lastSavedTime: string
}>()

const emit = defineEmits<{
  (e: 'update:title', event: Event): void
}>()
</script>

<template>
  <div class="px-8 py-5 border-b border-border bg-background flex flex-col gap-2 shrink-0">
    <div class="flex items-center gap-3 w-full">
      <Edit2 class="size-5 text-primary select-none shrink-0" />
      <input
        type="text"
        :value="title"
        placeholder="无标题文档"
        class="text-2xl font-black tracking-tight text-foreground border-0 p-0 focus:outline-none focus:ring-0 focus:border-0 bg-transparent flex-1"
        @input="emit('update:title', $event)"
      />
    </div>

    <!-- Metadata -->
    <div
      class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground font-medium select-none"
    >
      <span class="flex items-center gap-1">
        <Calendar class="size-3.5" />
        创建于 {{ formatFullDateTime(createdAt) }}
      </span>
      <span class="flex items-center gap-1">
        <Clock class="size-3.5" />
        自动保存于 {{ lastSavedTime || formatDocTime(updatedAt) }}
      </span>
      <span
        class="h-1.5 size-1.5 rounded-full transition-colors duration-300"
        :class="isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
        :title="isSaving ? '正在保存...' : '已保存'"
      ></span>
    </div>
  </div>
</template>
