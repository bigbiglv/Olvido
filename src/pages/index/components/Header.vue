<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useSearchStore } from '@/features/search/stores/search.store'
import { Dialog } from '@/components/dialog'
import SearchDialog from '@/features/search/components/SearchDialog.vue'
import { Search } from 'lucide-vue-next'

const appStore = useAppStore()
const searchStore = useSearchStore()

function handleOpenSearch() {
  // 默认进入当前项目内搜索模式
  searchStore.openProjectSearch(appStore.currentProject)
  Dialog.show(SearchDialog)
}
</script>

<template>
  <header
    class="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center px-8 justify-center select-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shrink-0"
  >
    <!-- Search Bar Area -->
    <div class="flex items-center gap-3 flex-1 max-w-lg">
      <button
        class="relative w-full flex items-center justify-between pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-800/30 text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-600 transition cursor-pointer text-left focus:outline-none"
        @click="handleOpenSearch"
      >
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-zinc-500"
        />
        <span>搜索笔记...</span>
        <span
          class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400 select-none"
        >
          Ctrl+F
        </span>
      </button>
    </div>
  </header>
</template>
