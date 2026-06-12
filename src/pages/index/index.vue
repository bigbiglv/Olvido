<script setup lang="ts">
import { useDocumentsStore } from '@/stores/documents'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import DocumentList from './components/DocumentList.vue'
import DocumentEditor from './components/DocumentEditor.vue'
import EmptyState from './components/EmptyState.vue'

const store = useDocumentsStore()

// Initialize documents
store.loadDocuments()
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <!-- Left Sidebar -->
    <Sidebar />

    <!-- Right Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 h-full">
      <!-- Top Header -->
      <Header />

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
        <div class="h-full flex min-w-0 overflow-hidden divide-x divide-slate-200 dark:divide-zinc-800">
          <DocumentList />
          <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10">
            <DocumentEditor v-if="store.selectedDocument" />
            <EmptyState v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
