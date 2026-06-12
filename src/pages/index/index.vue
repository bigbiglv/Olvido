<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import DocumentList from './components/DocumentList.vue'
import DocumentEditor from './components/DocumentEditor.vue'
import EmptyState from './components/EmptyState.vue'
import SettingsPage from './components/SettingsPage.vue'

const route = useRoute()
const router = useRouter()
const store = useDocumentsStore()

// Initialize documents
store.loadDocuments()

// Watch route to sync store filters
watch(
  () => route.params,
  (params) => {
    // Sync project filter
    if (route.name === 'project' || route.name === 'project-detail') {
      store.currentProject = params.projectName as string
    } else if (route.name === 'notebook' || route.name === 'notebook-detail') {
      store.currentProject = null
    }

    // Sync selected document
    if (params.docId) {
      store.selectedDocumentId = params.docId as string
    }
  },
  { immediate: true }
)

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
  },
)
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
        <SettingsPage v-if="route.name === 'settings'" />
        <div v-else class="h-full flex min-w-0 overflow-hidden divide-x divide-slate-200 dark:divide-zinc-800">
          <DocumentList @select="navigateToDocument" />
          <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10">
            <DocumentEditor v-if="store.selectedDocument" />
            <EmptyState v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
