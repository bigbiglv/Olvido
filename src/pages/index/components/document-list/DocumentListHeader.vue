<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { FilePlusCorner, BookOpenCheck } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

defineProps<{
  categoryTabs: Array<'日常' | '需求'>
}>()

const emit = defineEmits<{
  (e: 'quick-add'): void
  (e: 'open-completed'): void
}>()

const appStore = useAppStore()
</script>

<template>
  <div
    class="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between"
  >
    <Tabs
      :model-value="appStore.currentCategory"
      class="w-auto"
      @update:model-value="(val) => (appStore.currentCategory = val as any)"
    >
      <TabsList class="h-8 p-1">
        <TabsTrigger
          v-for="tab in categoryTabs"
          :key="tab"
          :value="tab"
          class="text-xs h-6 px-3 cursor-pointer data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-semibold text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
        >
          {{ tab }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <div class="flex items-center gap-2">
      <Button variant="outline" size="icon" aria-label="新增" @click="emit('quick-add')">
        <FilePlusCorner :size="16" />
      </Button>
      <Button variant="outline" size="icon" aria-label="完成列表" @click="emit('open-completed')">
        <BookOpenCheck :size="16" />
      </Button>
    </div>
  </div>
</template>
