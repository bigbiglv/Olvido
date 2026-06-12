<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import MarkdownSplitEditor from '@/components/Editor/MarkdownSplitEditor.vue'
import {
  Calendar,
  Clock,
  Database,
  Edit2,
  FileText,
  Trash2,
} from 'lucide-vue-next'

const store = useDocumentsStore()

// Debounced save timeout
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// Handle content and title updates with auto-save
function handleContentUpdate(newContent: string) {
  if (!store.selectedDocument) return

  // Set temporary local value
  store.selectedDocument.content = newContent

  // Debounce save to database
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (store.selectedDocument) {
      // Auto-extract first header as title if user writes one
      let title = store.selectedDocument.title
      if (newContent.trim().startsWith('# ')) {
        const firstLine = newContent.split('\n')[0]
        const extracted = firstLine.replace(/^#\s+/, '').trim()
        if (extracted) {
          title = extracted
          store.selectedDocument.title = title
        }
      }

      await store.saveDocument(store.selectedDocument.id, {
        content: newContent,
        title: title,
      })
    }
  }, 500)
}

function handleTitleUpdate(event: Event) {
  const newTitle = (event.target as HTMLInputElement).value.trim()
  if (!store.selectedDocument || !newTitle) return

  store.selectedDocument.title = newTitle

  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (store.selectedDocument) {
      await store.saveDocument(store.selectedDocument.id, {
        title: newTitle,
      })
    }
  }, 500)
}

// Helper to format date/time
function formatDocTime(dateStr: string | Date) {
  const date = new Date(dateStr)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    // Show HH:MM
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // Show MM-DD
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

function formatFullDateTime(dateStr: string | Date) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `${y}-${m}-${d} ${time}`
}

// Word & Character count calculation
const wordCount = computed(() => {
  const content = store.selectedDocument?.content || ''
  return content.split(/\s+/).filter(Boolean).length
})

const charCount = computed(() => {
  const content = store.selectedDocument?.content || ''
  return content.length
})

// Clean up auto-save timeouts
onBeforeUnmount(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
})
</script>

<template>
  <template v-if="store.selectedDocument">
    <!-- Editor Header Panel -->
    <div
      class="px-8 py-5 border-b border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 flex flex-col gap-2 shrink-0"
    >
      <div class="flex items-center gap-3 w-full">
        <Edit2 class="size-5 text-indigo-500 select-none shrink-0" />
        <!-- Document Title Input -->
        <input
          type="text"
          :value="store.selectedDocument.title"
          placeholder="无标题文档"
          class="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-50 border-0 p-0 focus:outline-none focus:ring-0 focus:border-0 bg-transparent flex-1"
          @input="handleTitleUpdate"
        />
      </div>

      <!-- Metadata -->
      <div
        class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-zinc-500 font-medium select-none"
      >
        <span class="flex items-center gap-1">
          <Calendar class="size-3.5" />
          创建于 {{ formatFullDateTime(store.selectedDocument.createdAt) }}
        </span>
        <span class="flex items-center gap-1">
          <Clock class="size-3.5" />
          自动保存于
          {{ store.lastSavedTime || formatDocTime(store.selectedDocument.updatedAt) }}
        </span>
        <span class="h-1.5 size-1.5 rounded-full bg-emerald-500"></span>
        <span class="text-emerald-600 dark:text-emerald-400">已保存</span>
      </div>
    </div>

    <!-- Markdown Split Editor Pane -->
    <div class="flex-1 overflow-hidden p-6 min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
      <MarkdownSplitEditor
        :model-value="store.selectedDocument.content"
        @update:model-value="handleContentUpdate"
      />
    </div>

    <!-- Bottom Status Bar -->
    <footer
      class="h-11 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center px-8 justify-between select-none text-xs text-slate-400 dark:text-zinc-500 font-medium shrink-0"
    >
      <!-- Left side: DB status -->
      <div class="flex items-center gap-2">
        <Database class="size-3.5 text-slate-400" />
        <span>{{ store.dbStatus }}</span>
      </div>

      <!-- Middle side: Characters & Words counts -->
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <FileText class="size-3.5" />
          {{ wordCount }} 词
        </span>
        <span>|</span>
        <span>{{ charCount }} 字</span>
      </div>

      <!-- Right side: Actions like delete -->
      <div class="flex items-center">
        <button
          class="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
          title="删除"
          @click="store.deleteDocument(store.selectedDocument.id)"
        >
          <Trash2 class="size-3.5" />
          <span>删除</span>
        </button>
      </div>
    </footer>
  </template>
</template>
