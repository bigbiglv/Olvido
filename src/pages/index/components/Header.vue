<script setup lang="ts">
import { useDocumentsStore } from '@/stores/documents'
import { Search } from 'lucide-vue-next'

const store = useDocumentsStore()
</script>

<template>
  <header
    class="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center px-8 justify-center select-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10 shrink-0"
  >
    <!-- Search Bar Area -->
    <div class="flex items-center gap-3 flex-1 max-w-lg">
      <div class="relative w-full">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-zinc-500"
        />
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="搜索任务标题或内容"
          class="w-full pl-9 pr-10 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-800/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 transition"
        />
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 select-none"
        >
          Ctrl+K
        </span>
      </div>
    </div>
  </header>
</template>
