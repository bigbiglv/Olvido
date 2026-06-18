<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDialog, type DialogOptions } from '@/components/dialog'
import { apiDetail } from '@/apis/note'
import type { SearchItem } from '../types/search'
import type { NoteDto } from '../../../../electron/types/note'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

defineOptions({
  dialogOptions: {
    title: '预览笔记',
    footer: true,
    width: 800,
    height: 600,
    resizable: true,
    draggable: true,
    closeOnEsc: true,
    okText: '在主编辑器中打开',
    cancelText: '关闭',
  } as DialogOptions,
})

const props = defineProps<{
  item: SearchItem
}>()

const dialog = useDialog<string>()

// 注册 onConfirm，使点击确认按钮时，Dialog.show Promise 被解决为 'edit' 字符串
dialog.onConfirm(() => 'edit')

const loading = ref(true)
const noteData = ref<NoteDto | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
let crepe: Crepe | null = null

// 简单的日期格式化工具
function formatDate(dateStr: string | Date | undefined) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 归档状态计算
const isArchived = computed(() => {
  if (noteData.value) {
    return noteData.value.isArchived
  }
  return props.item.isArchived
})

onMounted(async () => {
  try {
    loading.value = true
    const note = await apiDetail(props.item.id)
    if (note) {
      noteData.value = note
    }
  } catch (err) {
    console.error('Failed to fetch note in preview dialog:', err)
  } finally {
    loading.value = false
  }

  // 挂载只读模式编辑器
  if (editorRef.value) {
    crepe = new Crepe({
      root: editorRef.value,
      defaultValue: noteData.value?.content || '',
      features: {
        [Crepe.Feature.Toolbar]: false,
        [Crepe.Feature.TopBar]: false,
        [Crepe.Feature.BlockEdit]: false,
      },
    })

    try {
      await crepe.create()
      crepe.setReadonly(true)
    } catch (err) {
      console.error('Failed to create milkdown crepe editor in preview:', err)
    }
  }
})

onBeforeUnmount(async () => {
  if (crepe) {
    try {
      await crepe.destroy()
    } catch (err) {
      console.error('Failed to destroy crepe editor in preview:', err)
    }
  }
})
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
  >
    <!-- 顶部元信息栏 -->
    <div
      class="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 bg-gradient-to-r from-slate-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-900 flex flex-col gap-2 shrink-0"
    >
      <h1 class="text-xl font-bold text-slate-900 dark:text-zinc-50 truncate leading-snug">
        {{ noteData?.title || item.title }}
      </h1>

      <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <!-- 所属项目标签 -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium"
        >
          <span class="size-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
          <span>{{ item.projectName }}</span>
        </div>

        <!-- 归档状态标签 -->
        <div
          v-if="isArchived"
          class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium border border-amber-200/40 dark:border-amber-900/30"
        >
          <span>已归档</span>
        </div>

        <!-- 创建时间 -->
        <div class="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
          <span>创建时间:</span>
          <span>{{ formatDate(noteData?.createdAt || item.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 中间滚动编辑区 -->
    <div class="flex-1 overflow-y-auto relative p-6 bg-slate-50/10 dark:bg-zinc-950/10">
      <!-- 优雅的旋转加载动画 -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-20 transition-all duration-300"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-600 dark:border-indigo-400/20 dark:border-t-indigo-400"
          ></div>
          <span class="text-sm text-slate-500 dark:text-zinc-400 font-medium">加载内容中...</span>
        </div>
      </div>

      <!-- 编辑器容器 -->
      <div v-show="!loading" class="editor-container h-full">
        <div ref="editorRef" class="w-full"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container :deep(.milkdown) {
  max-width: 100%;
}

.editor-container :deep(.ProseMirror) {
  padding: 1rem 1.5rem !important;
  outline: none !important;
}

/* 消除首行顶部过大的边距 */
.editor-container :deep(.ProseMirror > *:first-child) {
  margin-top: 0 !important;
}

/* 隐藏 readonly 编辑器上不需要的元素 */
.editor-container :deep(.milkdown-block-handle),
.editor-container :deep(.milkdown-slash-menu),
.editor-container :deep(.milkdown-toolbar),
.editor-container :deep(.milkdown-link-edit) {
  display: none !important;
}
</style>
