<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/components/dialog/hooks/useDialog'
import { Label } from '@/components/ui/label'

const dialog = useDialog<string>()
// Default deadline to tomorrow or today
const todayStr = new Date().toISOString().split('T')[0]
const deadlineDate = ref(todayStr)

dialog.onConfirm(() => {
  const val = deadlineDate.value
  if (!val) return false
  return val
})
</script>

<template>
  <div class="space-y-4 py-4">
    <div class="space-y-2">
      <Label for="deadline">截止日期</Label>
      <input
        id="deadline"
        v-model="deadlineDate"
        type="date"
        class="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
        autofocus
      />
    </div>
  </div>
</template>
