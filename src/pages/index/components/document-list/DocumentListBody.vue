<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { FileX } from 'lucide-vue-next'
import { DraggableList, type ReorderEvent } from '@/components/ui/draggableList'
import DailyDocItem from './DailyDocItem.vue'
import RequirementDocItem from './RequirementDocItem.vue'


defineProps<{
  filteredDocuments: DocumentItem[]
  listSelectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'selection-change', ids: string[]): void
  (e: 'open', doc: DocumentItem): void
  (e: 'reorder', event: ReorderEvent<DocumentItem>): void
  (e: 'context-menu', event: MouseEvent, doc: DocumentItem): void
  (e: 'toggle-completion', doc: DocumentItem): void
  (e: 'clear-selection'): void
}>()

const appStore = useAppStore()
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4" @click.self="emit('clear-selection')">
    <div
      v-if="filteredDocuments.length === 0"
      class="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-zinc-500 p-4"
    >
      <FileX class="size-8 opacity-40 mb-2" />
      <span class="text-xs">未找到文档</span>
    </div>

    <DraggableList
      v-else
      :items="filteredDocuments"
      item-key="id"
      :selected-ids="listSelectedIds"
      :opened-id="appStore.selectedDocumentId"
      @selection-change="(ids) => emit('selection-change', ids)"
      @open="(item) => emit('open', item)"
      @reorder="(event) => emit('reorder', event)"
      @context-menu="(item, event) => emit('context-menu', event, item)"
    >
      <template #item="{ item: doc, selected, opened, hover }">
        <component
          :is="doc.category === '需求' ? RequirementDocItem : DailyDocItem"
          :doc="doc"
          :is-selected="selected"
          :is-opened="opened"
          :is-hovered="hover"
          @toggle="(docItem: DocumentItem) => emit('toggle-completion', docItem)"
        />
      </template>
    </DraggableList>
  </div>
</template>
