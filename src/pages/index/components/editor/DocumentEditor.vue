<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import MarkdownSplitEditor from '@/components/Editor/MarkdownSplitEditor.vue'
import { FileText } from 'lucide-vue-next'
import EditorHeader from './EditorHeader.vue'
import { apiUpdate } from '@/apis/note'

const appStore = useAppStore()

// Debounced save timeout
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const isSaving = ref(false)

// Reset isSaving if selected document changes
watch(
  () => appStore.selectedDocument?.id,
  () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    isSaving.value = false
  },
)

// Helper function to save document changes directly to database
async function saveDocument(docId: string, updates: Partial<DocumentItem>) {
  try {
    const doc = appStore.selectedDocument
    if (!doc) return
    Object.assign(doc, updates)

    await apiUpdate({
      id: docId,
      title: doc.title,
      content: doc.content,
      isArchived: doc.completed,
      deadline: (doc.category === '需求' && doc.deadline) ? new Date(doc.deadline) : null,
    })
    appStore.lastSavedTime = new Date().toLocaleTimeString()
  } catch (err) {
    console.error('Failed to save document:', err)
  }
}

// Handle content and title updates with auto-save
function handleContentUpdate(newContent: string) {
  if (!appStore.selectedDocument) return

  // Set temporary local value
  appStore.selectedDocument.content = newContent
  isSaving.value = true

  // Debounce save to database
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (appStore.selectedDocument) {
      let title = appStore.selectedDocument.title

      try {
        await saveDocument(appStore.selectedDocument.id, {
          content: newContent,
          title: title,
        })
      } finally {
        isSaving.value = false
      }
    }
  }, 500)
}

function handleTitleUpdate(event: Event) {
  const newTitle = (event.target as HTMLInputElement).value.trim()
  if (!appStore.selectedDocument || !newTitle) return

  appStore.selectedDocument.title = newTitle
  isSaving.value = true

  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (appStore.selectedDocument) {
      try {
        await saveDocument(appStore.selectedDocument.id, {
          title: newTitle,
        })
      } finally {
        isSaving.value = false
      }
    }
  }, 500)
}

// Word & Character count calculation
const wordCount = computed(() => {
  const content = appStore.selectedDocument?.content || ''
  return content.split(/\s+/).filter(Boolean).length
})

const charCount = computed(() => {
  const content = appStore.selectedDocument?.content || ''
  return content.length
})

// Clean up auto-save timeouts
onBeforeUnmount(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
})
</script>

<template>
  <template v-if="appStore.selectedDocument">
    <!-- Editor Header Panel -->
    <EditorHeader
      :title="appStore.selectedDocument.title"
      :created-at="appStore.selectedDocument.createdAt"
      :updated-at="appStore.selectedDocument.updatedAt"
      :is-saving="isSaving"
      :last-saved-time="appStore.lastSavedTime"
      @update:title="handleTitleUpdate"
    />

    <!-- Markdown Split Editor Pane -->
    <div class="flex-1 overflow-hidden p-1 min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
      <MarkdownSplitEditor
        :model-value="appStore.selectedDocument.content"
        @update:model-value="handleContentUpdate"
      />
    </div>

    <!-- Bottom Status Bar -->
    <footer
      class="h-11 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center px-8 justify-end select-none text-xs text-slate-400 dark:text-zinc-500 font-medium shrink-0"
    >
      <!-- Right side: Characters & Words counts -->
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <FileText class="size-3.5" />
          {{ wordCount }} 词
        </span>
        <span>|</span>
        <span>{{ charCount }} 字</span>
      </div>
    </footer>
  </template>
</template>
