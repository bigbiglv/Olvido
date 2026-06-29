<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import DocumentListHeader from './DocumentListHeader.vue'
import DocumentListBody from './DocumentListBody.vue'
import { useDocumentList } from '../../composables/useDocumentList'

const appStore = useAppStore()

const {
  listSelectedIds,
  categoryTabs,
  requirementSortMode,
  filteredDocuments,
  handleOpenCompleted,
  handleQuickAdd,
  toggleCompletion,
  handleContextMenu,
  handleBackgroundContextMenu,
  handleSelectionChange,
  handleOpen,
  handleReorder
} = useDocumentList()

const disableDrag = computed(() => appStore.currentCategory === '需求' && requirementSortMode.value === 'date')

function handleClearSelection() {
  listSelectedIds.value = []
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-zinc-900 select-none">
    <DocumentListHeader
      :category-tabs="categoryTabs"
      @quick-add="handleQuickAdd"
      @open-completed="handleOpenCompleted"
    />

    <DocumentListBody
      :filtered-documents="filteredDocuments"
      :list-selected-ids="listSelectedIds"
      :disabled="disableDrag"
      @selection-change="handleSelectionChange"
      @open="handleOpen"
      @reorder="handleReorder"
      @context-menu="handleContextMenu"
      @background-context-menu="handleBackgroundContextMenu"
      @toggle-completion="toggleCompletion"
      @clear-selection="handleClearSelection"
    />
  </div>
</template>
