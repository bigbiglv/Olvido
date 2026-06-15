<script lang="ts">
import { h } from 'vue'

export default {
  // 对齐全局对话框管理器，定义对话框尺寸及顶栏 Esc 标识
  dialogOptions: {
    title: '搜索',
    footer: false, // 禁用默认的 确认/取消 底部按钮
    width: 800,
    height: 600,
    resizable: true,
    draggable: true,
    closeOnEsc: true,
    slots: {
      headerExtra: () =>
        h(
          'span',
          {
            class:
              'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/80 px-1.5 font-mono text-[10px] font-bold text-slate-400 dark:text-zinc-500 opacity-100',
          },
          'Esc',
        ),
    },
  },
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useSearchStore } from '../stores/search.store'
import { useSearch } from '../composables/useSearch'
import SearchResultList from './SearchResultList.vue'
import { apiListProjects } from '@/apis/project'
import type { ProjectDto } from '../../../../electron/types/project'

const store = useSearchStore()
const { results, flatResults, moveUp, moveDown, selectItem, handleEnter } = useSearch()

const projects = ref<ProjectDto[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

// 保证项目下拉列表支持 `全部项目` (绑空串映射 undefined) 的双向绑定
const selectedProjectId = computed({
  get: () => store.projectId ?? '',
  set: (val) => {
    store.projectId = val === '' ? undefined : val
  },
})

onMounted(async () => {
  // 聚焦搜索输入框
  if (inputRef.value) {
    inputRef.value.focus()
  }

  // 加载可供筛选的项目列表
  try {
    const list = await apiListProjects()
    // 过滤掉 'global'，因为全局笔记本在下拉中单独作为一个固定项 '全局' 渲染
    projects.value = list.filter((p) => p.id !== 'global')
  } catch (err) {
    console.error('Failed to load projects for search dialog:', err)
  }
})

onUnmounted(() => {
  store.closeSearch()
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900">
    <!-- Top Search Input & Filter area -->
    <div
      class="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center gap-3 shrink-0"
    >
      <!-- Project Filter Select -->
      <select
        v-model="selectedProjectId"
        class="h-10 px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-800/30 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer max-w-[140px] truncate"
      >
        <option value="">全部项目</option>
        <option value="global">全局</option>
        <option v-for="proj in projects" :key="proj.id" :value="proj.id">
          {{ proj.name }}
        </option>
      </select>

      <!-- Keywords input -->
      <div class="relative flex-1">
        <Search
          class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-zinc-500"
        />
        <input
          ref="inputRef"
          v-model="store.keyword"
          type="text"
          placeholder="输入关键词搜索..."
          class="w-full pl-10 pr-4 h-10 text-sm rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-800/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 transition"
          @keydown.up.prevent="moveUp"
          @keydown.down.prevent="moveDown"
          @keydown.enter.prevent="handleEnter"
        />
      </div>
    </div>

    <!-- Results Area -->
    <SearchResultList :results="results" :flat-results="flatResults" @select="selectItem" />

    <!-- Bottom Status Bar -->
    <div
      class="px-6 py-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 shrink-0 bg-slate-50/20 dark:bg-zinc-900/20"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 font-mono text-[10px] font-bold"
          >
            ↑
          </kbd>
          <kbd
            class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 font-mono text-[10px] font-bold"
          >
            ↓
          </kbd>
          <span>选择结果</span>
        </div>
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 font-mono text-[10px] font-bold"
          >
            Enter
          </kbd>
          <span>打开</span>
        </div>
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 font-mono text-[10px] font-bold"
          >
            Esc
          </kbd>
          <span>关闭</span>
        </div>
      </div>
      <div>
        找到
        <span class="font-semibold text-slate-600 dark:text-zinc-300">{{
          flatResults.length
        }}</span>
        个结果
      </div>
    </div>
  </div>
</template>
