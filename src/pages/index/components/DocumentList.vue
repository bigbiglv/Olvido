<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileX } from 'lucide-vue-next'
import { Dialog } from '@/components/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompletedDocsDialog from './CompletedDocsDialog.vue'

const store = useDocumentsStore()

const filteredDocuments = inject<ComputedRef<DocumentItem[]>>('filteredDocuments')!
const saveDocument = inject<(docId: string, updates: Partial<DocumentItem>) => Promise<void>>('saveDocument')!
const deleteDocument = inject<(docId: string) => Promise<void>>('deleteDocument')!
const loadDocuments = inject<() => Promise<void>>('loadDocuments')!
const selectDefaultDocument = inject<() => void>('selectDefaultDocument')!

function handleOpenCompleted() {
  Dialog.show(CompletedDocsDialog, {
    saveDocument,
    loadDocuments,
    deleteDocument,
  }, {
    title: '已完成的文档',
    footer: false,
    width: 600,
    height: 480,
  })
}

const categoryTabs: Array<'日常' | '需求'> = ['日常', '需求']


// Toggle completion checkbox in list
async function toggleCompletion(doc: DocumentItem, event: Event) {
  event.stopPropagation() // Prevent selecting the item when checking/unchecking
  const newCompleted = !doc.completed
  await saveDocument(doc.id, { completed: newCompleted })

  // Re-evaluate selection
  selectDefaultDocument()
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
</script>

<template>
  <div class="w-80 flex flex-col h-full bg-white dark:bg-zinc-900 shrink-0 select-none">
    <!-- Tabs header -->
    <div
      class="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between"
    >
      <Tabs
        :model-value="store.currentCategory"
        class="w-auto"
        @update:model-value="(val) => store.currentCategory = val as any"
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
      <Button
        variant="outline"
        size="sm"
        @click="handleOpenCompleted"
      >
        已完成
      </Button>
    </div>

    <!-- Scrollable List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1">
      <div
        v-if="filteredDocuments.length === 0"
        class="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-zinc-500 p-4"
      >
        <FileX class="size-8 opacity-40 mb-2" />
        <span class="text-xs">未找到文档</span>
      </div>

      <button
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 cursor-pointer"
        :class="
          store.selectedDocumentId === doc.id
            ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 shadow-sm'
            : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
        "
        @click="store.selectedDocumentId = doc.id"
      >
        <div class="flex items-start justify-between gap-3 w-full">
          <span
            class="font-semibold text-sm truncate flex-1"
            :class="
              store.selectedDocumentId === doc.id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-zinc-200'
            "
          >
            {{ doc.title || '无标题文档' }}
          </span>
          <span
            class="text-xs text-slate-400 dark:text-zinc-500 font-medium whitespace-nowrap pt-0.5"
          >
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
</template>
