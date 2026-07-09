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
  () => appStore.selectedDocument,
  (_, oldDoc) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null

      // Flush pending save for the previous document
      if (oldDoc) {
        saveDocument(oldDoc, { content: oldDoc.content, title: oldDoc.title })
      }
    }
    isSaving.value = false
  },
)

// Helper function to save document changes directly to database
async function saveDocument(doc: DocumentItem, updates: Partial<DocumentItem>) {
  if (!doc) return
  try {
    Object.assign(doc, updates)

    await apiUpdate({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      isArchived: doc.completed,
      deadline: doc.category === '需求' && doc.deadline ? new Date(doc.deadline) : null,
    })
    appStore.lastSavedTime = new Date().toLocaleTimeString()
  } catch (err) {
    console.error('Failed to save document:', err)
  }
}

// Handle content and title updates with auto-save
function handleContentUpdate(newContent: string) {
  if (!appStore.selectedDocument) return
  if (appStore.selectedDocument.content === newContent) return

  // Set temporary local value
  appStore.selectedDocument.content = newContent
  isSaving.value = true

  // Debounce save to database
  if (saveTimeout) clearTimeout(saveTimeout)
  const docToSave = appStore.selectedDocument
  saveTimeout = setTimeout(async () => {
    let title = docToSave.title

    try {
      await saveDocument(docToSave, {
        content: newContent,
        title: title,
      })
    } finally {
      isSaving.value = false
    }
  }, 500)
}

function handleTitleUpdate(event: Event) {
  const newTitle = (event.target as HTMLInputElement).value.trim()
  if (!appStore.selectedDocument || !newTitle) return

  appStore.selectedDocument.title = newTitle
  isSaving.value = true

  if (saveTimeout) clearTimeout(saveTimeout)
  const docToSave = appStore.selectedDocument
  saveTimeout = setTimeout(async () => {
    try {
      await saveDocument(docToSave, {
        title: newTitle,
      })
    } finally {
      isSaving.value = false
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
    <div class="flex-1 overflow-hidden p-1 min-h-0 bg-muted/30 dark:bg-background">
      <MarkdownSplitEditor
        :model-value="appStore.selectedDocument.content"
        @update:model-value="handleContentUpdate"
      />
    </div>

    <!-- Bottom Status Bar -->
    <footer
      class="h-11 border-t border-border bg-background flex items-center px-8 justify-end select-none text-xs text-muted-foreground font-medium shrink-0"
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
