<script setup lang="ts">
import DocumentListHeader from './DocumentListHeader.vue'
import DocumentListBody from './DocumentListBody.vue'
import { useDocumentList } from '../../composables/useDocumentList'

const {
  listSelectedIds,
  categoryTabs,
  filteredDocuments,
  handleOpenCompleted,
  handleQuickAdd,
  toggleCompletion,
  handleContextMenu,
  handleSelectionChange,
  handleOpen,
  handleReorder
} = useDocumentList()

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
      @selection-change="handleSelectionChange"
      @open="handleOpen"
      @reorder="handleReorder"
      @context-menu="handleContextMenu"
      @toggle-completion="toggleCompletion"
      @clear-selection="handleClearSelection"
    />
  </div>
</template>
