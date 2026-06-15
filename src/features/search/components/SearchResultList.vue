<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { FileX } from 'lucide-vue-next'
import SearchResultItem from './SearchResultItem.vue'
import { useSearchStore } from '../stores/search.store'
import type { SearchResult, SearchItem } from '../types/search'

defineProps<{
  results: SearchResult
  flatResults: SearchItem[]
}>()

const emit = defineEmits<{
  select: [item: SearchItem]
}>()

const store = useSearchStore()

// 监听键盘选中索引的变化，自动将选中的列表项平滑滚动进可视区域内
watch(
  () => store.selectedIndex,
  () => {
    nextTick(() => {
      const activeEl = document.querySelector('[data-search-item-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    })
  }
)
</script>

<template>
  <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
    <!-- 空状态展示 -->
    <div
      v-if="flatResults.length === 0"
      class="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-zinc-500"
    >
      <FileX class="size-10 opacity-30 mb-3" />
      <span class="text-sm font-medium">未找到匹配的笔记</span>
      <span class="text-xs text-slate-400 dark:text-zinc-500 mt-1">请尝试更换其他关键词搜索</span>
    </div>

    <template v-else>
      <!-- 第一组：标题匹配 -->
      <div v-if="results.titleMatches.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>标题匹配</span>
          <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]">
            {{ results.titleMatches.length }}
          </span>
        </div>
        <div class="space-y-2">
          <SearchResultItem
            v-for="(item, idx) in results.titleMatches"
            :key="item.id"
            :item="item"
            :is-active="store.selectedIndex === idx"
            @click="emit('select', item)"
          />
        </div>
      </div>

      <!-- 第二组：内容匹配 -->
      <div v-if="results.contentMatches.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>内容匹配</span>
          <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]">
            {{ results.contentMatches.length }}
          </span>
        </div>
        <div class="space-y-2">
          <SearchResultItem
            v-for="(item, idx) in results.contentMatches"
            :key="item.id"
            :item="item"
            :is-active="store.selectedIndex === results.titleMatches.length + idx"
            @click="emit('select', item)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
