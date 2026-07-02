<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useSearchStore } from '@/features/search/stores/search.store'
import { Dialog } from '@/components/dialog'
import SearchDialog from '@/features/search/components/SearchDialog.vue'
import { Search, Calendar } from 'lucide-vue-next'
import HeaderDatePickerDialog from './HeaderDatePickerDialog.vue'

const appStore = useAppStore()
const searchStore = useSearchStore()

function handleOpenSearch() {
  // 默认进入当前项目内搜索模式
  searchStore.openProjectSearch(appStore.currentProject)
  Dialog.show(SearchDialog)
}

function handleOpenDatePicker() {
  Dialog.show(HeaderDatePickerDialog)
}
</script>

<template>
  <header
    class="h-16 border-b border-border flex items-center px-8 justify-between select-none bg-card/50 dark:bg-background backdrop-blur-md shrink-0"
  >
    <!-- Left Spacer -->
    <div class="flex-1"></div>

    <div class="flex items-center gap-3 w-full max-w-lg">
      <button
        class="relative w-full flex items-center justify-between pl-9 pr-3 py-1.5 text-sm rounded-xl border border-border bg-muted/50 dark:bg-card text-muted-foreground hover:border-border transition cursor-pointer text-left focus:outline-none"
        @click="handleOpenSearch"
      >
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <span>搜索笔记...</span>
        <span
          class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground select-none"
        >
          Ctrl+F
        </span>
      </button>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2 flex-1 justify-end">
      <button
        class="p-2 rounded-xl text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-muted transition cursor-pointer focus:outline-none"
        title="日历"
        @click="handleOpenDatePicker"
      >
        <Calendar class="size-5" />
      </button>
    </div>
  </header>
</template>
