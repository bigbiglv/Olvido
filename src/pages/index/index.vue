<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/sidebar/Sidebar.vue'
import ResizeHandle from '@/components/common/ResizeHandle/index.vue'
import Header from './components/Header.vue'
import DocumentList from './components/document-list/DocumentList.vue'
import DocumentEditor from './components/editor/DocumentEditor.vue'
import EmptyState from './components/EmptyState.vue'
import { useKeyboardShortcuts } from './composables/use-keyboard-shortcuts'
import { useConfigStore } from '@/stores/config'

const appStore = useAppStore()
const configStore = useConfigStore()

const sidebarWidth = computed({
  get: () => configStore.config.sidebarWidth,
  set: (val) => configStore.updateConfig({ sidebarWidth: val }),
})

const docListWidth = computed({
  get: () => configStore.config.docListWidth,
  set: (val) => configStore.updateConfig({ docListWidth: val }),
})

// 注册全局键盘快捷键
useKeyboardShortcuts()
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <!-- Left Sidebar -->
    <Sidebar :style="{ width: `${sidebarWidth}px` }" class="shrink-0" />

    <!-- Resize Handle -->
    <ResizeHandle v-model="sidebarWidth" :min-width="200" :max-width="450" />

    <!-- Right Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-background h-full">
      <!-- Top Header -->
      <Header />

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden min-h-0 bg-muted/30 dark:bg-background">
        <div class="h-full flex min-w-0 overflow-hidden">
          <DocumentList :style="{ width: `${docListWidth}px` }" class="shrink-0" />
          <ResizeHandle v-model="docListWidth" :min-width="240" :max-width="480" />
          <div class="flex-1 flex flex-col h-full overflow-hidden bg-muted/20 dark:bg-background">
            <DocumentEditor v-if="appStore.selectedDocument" />
            <EmptyState v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
