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
              'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted dark:bg-card px-1.5 font-mono text-[10px] font-bold text-muted-foreground opacity-100',
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
import { apiList } from '@/apis/project'
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
    const list = await apiList()
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
  <div class="flex flex-col h-full overflow-hidden bg-background">
    <!-- Top Search Input & Filter area -->
    <div class="px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
      <!-- Project Filter Select -->
      <select
        v-model="selectedProjectId"
        class="h-10 px-3 py-1.5 text-sm rounded-xl border border-border bg-muted/50 dark:bg-card text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer max-w-[140px] truncate"
      >
        <option value="">全部项目</option>
        <option value="global">全局</option>
        <option v-for="proj in projects" :key="proj.id" :value="proj.id">
          {{ proj.name }}
        </option>
      </select>

      <!-- Keywords input -->
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref="inputRef"
          v-model="store.keyword"
          type="text"
          placeholder="输入关键词搜索..."
          class="w-full pl-10 pr-4 h-10 text-sm rounded-xl border border-border bg-muted/50 dark:bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground transition"
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
      class="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0 bg-muted/20 dark:bg-background"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-bold"
          >
            ↑
          </kbd>
          <kbd
            class="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-bold"
          >
            ↓
          </kbd>
          <span>选择结果</span>
        </div>
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-bold"
          >
            Enter
          </kbd>
          <span>打开</span>
        </div>
        <div class="flex items-center gap-1.5">
          <kbd
            class="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] font-bold"
          >
            Esc
          </kbd>
          <span>关闭</span>
        </div>
      </div>
      <div>
        找到
        <span class="font-semibold text-muted-foreground dark:text-foreground">{{
          flatResults.length
        }}</span>
        个结果
      </div>
    </div>
  </div>
</template>
