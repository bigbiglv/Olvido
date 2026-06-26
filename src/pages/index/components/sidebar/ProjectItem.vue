<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-vue-next'
import type { ProjectDto } from '../../../../../electron/types/project'

defineProps<{
  project: ProjectDto
  selected?: boolean
  opened?: boolean
}>()
</script>

<template>
  <Button
    data-context-region="project"
    variant="ghost"
    class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left border-0"
    :class="[
      opened
        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50'
        : '',
      selected && !opened
        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
        : '',
      !opened && !selected
        ? 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
        : ''
    ]"
  >
    <Folder class="size-4.5 opacity-70" />
    <span class="truncate">{{ project.name }}</span>
  </Button>
</template>
