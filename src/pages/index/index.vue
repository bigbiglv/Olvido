<script setup lang="ts">
import { onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useDocumentsStore } from '@/stores/documents'
import Sidebar from './components/sidebar/Sidebar.vue'
import ResizeHandle from '@/components/common/ResizeHandle/index.vue'
import Header from './components/Header.vue'
import DocumentList from './components/document-list/DocumentList.vue'
import DocumentEditor from './components/editor/DocumentEditor.vue'
import EmptyState from './components/EmptyState.vue'
import { useKeyboardShortcuts } from './composables/use-keyboard-shortcuts'

const store = useDocumentsStore()

// 侧边栏宽度持久化 (默认 256px)
const sidebarWidth = useStorage('olvido-sidebar-width', 256)

// 文档栏宽度持久化 (默认 320px)
const docListWidth = useStorage('olvido-doclist-width', 320)

// 注册全局键盘快捷键
useKeyboardShortcuts()

onMounted(() => {
  store.loadDocuments().catch((err) => {
    console.error('Failed to initialize documents:', err)
  })
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <!-- Left Sidebar -->
    <Sidebar :style="{ width: `${sidebarWidth}px` }" class="shrink-0" />

    <!-- Resize Handle -->
    <ResizeHandle v-model="sidebarWidth" :min-width="200" :max-width="450" />

    <!-- Right Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 h-full">
      <!-- Top Header -->
      <Header />

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
        <div
          class="h-full flex min-w-0 overflow-hidden"
        >
          <DocumentList :style="{ width: `${docListWidth}px` }" class="shrink-0" />
          <ResizeHandle v-model="docListWidth" :min-width="240" :max-width="480" />
          <div
            class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10"
          >
            <DocumentEditor v-if="store.selectedDocument" />
            <EmptyState v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
