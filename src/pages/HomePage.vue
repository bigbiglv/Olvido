<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import MarkdownSplitEditor from '@/components/Editor/MarkdownSplitEditor.vue'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Edit2,
  FileText,
  FileX,
  FilePlus,
  Trash2,
  CheckSquare,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useDocumentsStore()

const categoryTabs: ('日常' | '需求' | '已完成')[] = ['日常', '需求', '已完成']

// Debounced save timeout
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// Select document & navigate
function handleSelectDocument(docId: string) {
  store.selectedDocumentId = docId
  navigateToDocument(docId)
}

function navigateToDocument(docId: string) {
  if (store.currentProject) {
    router.push(`/project/${store.currentProject}/${docId}`)
  } else {
    router.push(`/notebook/${docId}`)
  }
}

// Watch selectedDocumentId changes from store to update URL if they don't match
watch(
  () => store.selectedDocumentId,
  (newId) => {
    if (newId && route.params.docId !== newId) {
      navigateToDocument(newId)
    }
  }
)

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
        title: title
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
        title: newTitle
      })
    }
  }, 500)
}

// Toggle completion checkbox in list
async function toggleCompletion(doc: DocumentItem, event: Event) {
  event.stopPropagation() // Prevent selecting the item when checking/unchecking
  const newCompleted = !doc.completed
  await store.saveDocument(doc.id, { completed: newCompleted })
  
  // Re-evaluate selection
  store.selectDefaultDocument()
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
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
  <div class="h-full flex min-w-0 overflow-hidden divide-x divide-slate-200 dark:divide-zinc-800">
    <!-- Middle Document List Column -->
    <div class="w-80 flex flex-col h-full bg-white dark:bg-zinc-900 shrink-0 select-none">
      <!-- Tabs header -->
      <div class="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div class="flex gap-4">
          <button
            v-for="tab in categoryTabs"
            :key="tab"
            class="relative pb-2 text-sm font-semibold transition cursor-pointer"
            :class="
              store.currentCategory === tab
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            "
            @click="store.selectCategory(tab)"
          >
            {{ tab }}
            <span
              v-if="store.currentCategory === tab"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
            ></span>
          </button>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-1">
        <div v-if="store.filteredDocuments.length === 0" class="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-zinc-500 p-4">
          <FileX class="size-8 opacity-40 mb-2" />
          <span class="text-xs">未找到文档</span>
        </div>

        <button
          v-for="doc in store.filteredDocuments"
          :key="doc.id"
          class="w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 cursor-pointer"
          :class="
            store.selectedDocumentId === doc.id
              ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 shadow-sm'
              : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
          "
          @click="handleSelectDocument(doc.id)"
        >
          <div class="flex items-start justify-between gap-3 w-full">
            <span
              class="font-semibold text-sm truncate flex-1"
              :class="store.selectedDocumentId === doc.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-zinc-200'"
            >
              {{ doc.title || '无标题文档' }}
            </span>
            <span class="text-xs text-slate-400 dark:text-zinc-500 font-medium whitespace-nowrap pt-0.5">
              {{ formatDocTime(doc.updatedAt) }}
            </span>
          </div>

          <div class="flex items-center justify-between w-full">
            <span class="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-[180px]">
              {{ doc.content.replace(/[#*`_\-\[\]]/g, '').trim() || '无内容' }}
            </span>

            <!-- Completion checkbox -->
            <button
              class="size-5 rounded-md flex items-center justify-center border transition-all cursor-pointer"
              :class="
                doc.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none'
                  : 'border-slate-300 dark:border-zinc-700 text-transparent hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-300 dark:hover:text-zinc-600'
              "
              @click="toggleCompletion(doc, $event)"
            >
              <CheckCircle2 class="size-3.5 fill-current" />
            </button>
          </div>
        </button>
      </div>
    </div>

    <!-- Right Workspace Column (Editor Panel + Bottom Status Bar) -->
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10">
      <template v-if="store.selectedDocument">
        <!-- Editor Header Panel -->
        <div class="px-8 py-5 border-b border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 flex flex-col gap-2 shrink-0">
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
          <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-zinc-500 font-medium select-none">
            <span class="flex items-center gap-1">
              <Calendar class="size-3.5" />
              创建于 {{ formatFullDateTime(store.selectedDocument.createdAt) }}
            </span>
            <span class="flex items-center gap-1">
              <Clock class="size-3.5" />
              自动保存于 {{ store.lastSavedTime || formatDocTime(store.selectedDocument.updatedAt) }}
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
        <footer class="h-11 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center px-8 justify-between select-none text-xs text-slate-400 dark:text-zinc-500 font-medium shrink-0">
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

      <!-- Blank Slate Placeholder -->
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900/40 p-8 select-none">
          <div class="flex flex-col items-center max-w-sm text-center">
            <div class="size-16 rounded-2xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-6 shadow-sm border border-slate-100 dark:border-zinc-700/50">
              <CheckSquare class="size-8" />
            </div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">欢迎使用</h2>
            <p class="text-sm text-slate-400 dark:text-zinc-500 leading-relaxed mb-6">
              选择或创建一个文档开始记录。
            </p>
            <button
              class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition cursor-pointer"
              @click="store.createDocument('新文档', '# 新文档\n\n在此开始编写内容...')"
            >
              <FilePlus class="size-4.5" />
              <span>创建您的第一个文档</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
