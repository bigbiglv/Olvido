<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type DialogOptions } from '@/components/dialog'
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { RotateCcw, Trash2, Search, Inbox } from 'lucide-vue-next'
import { isElectron } from '@/utils/env'
import { apiList, apiDelete, apiUpdate } from '@/apis/note'
import { mapNoteToDocument } from '@/apis/note-mapper'
import { confirm } from '@/components/confirm'

defineOptions({
  dialogOptions: {
    title: '已完成的文档',
    footer: false,
    width: 600,
    height: 480,
  } as DialogOptions,
})

const appStore = useAppStore()
const searchQuery = ref('')
const allCompletedDocs = ref<DocumentItem[]>([])

// Load completed documents
async function loadCompletedDocs() {
  if (isElectron) {
    try {
      const pid = appStore.currentProject || 'global'
      const notes = await apiList(pid, 'archived')
      allCompletedDocs.value = notes.map(mapNoteToDocument)
    } catch (err) {
      console.error('Failed to load completed documents:', err)
    }
  } else {
    allCompletedDocs.value = []
  }
}

onMounted(() => {
  loadCompletedDocs()
})

// Filter completed documents
const completedDocs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return allCompletedDocs.value.filter((doc) => {
    if (!query) return true
    return doc.title.toLowerCase().includes(query) || doc.content.toLowerCase().includes(query)
  })
})

// Restore document (set completed = false)
async function handleRestore(docId: string, event: Event) {
  event.stopPropagation()
  try {
    const doc = allCompletedDocs.value.find((d) => d.id === docId)
    if (doc) {
      await apiUpdate({
        id: docId,
        isArchived: false,
        deadline: (doc.category === '需求' && doc.deadline) ? new Date(doc.deadline) : null,
      })
      // Remove from local list
      allCompletedDocs.value = allCompletedDocs.value.filter((d) => d.id !== docId)
      // Trigger list update on main document list
      appStore.lastSavedTime = new Date().toLocaleTimeString()
    }
  } catch (error) {
    console.error('Failed to restore completed document:', error)
  }
}

// Permanently delete document
async function handleDelete(docId: string, event: Event) {
  event.stopPropagation()
  try {
    const isConfirmed = await confirm({
      title: '永久删除文档',
      description: '将永久删除此文档，不可恢复。',
      destructive: true,
      okText: '删除',
      cancelText: '取消',
    })

    if (isConfirmed) {
      await apiDelete(docId)
      // Trigger list update on main document list
      appStore.lastSavedTime = new Date().toLocaleTimeString()
      // Remove from local list
      allCompletedDocs.value = allCompletedDocs.value.filter((d) => d.id !== docId)
    }
  } catch (error) {
    console.error('Failed to delete completed document:', error)
  }
}

// Format date helper
function formatDate(dateStr: string | Date) {
  const date = new Date(dateStr)
  return date.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex flex-col h-[400px] -mx-6 -my-4">
    <!-- Search Bar -->
    <div
      class="px-6 py-3 border-b border-border flex items-center gap-3 bg-muted/50 dark:bg-background"
    >
      <div class="relative w-full">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索已完成的文档..."
          class="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground transition"
        />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
      <div
        v-if="completedDocs.length === 0"
        class="flex flex-col items-center justify-center h-full text-muted-foreground py-12"
      >
        <Inbox class="size-10 opacity-30 mb-2" />
        <span class="text-sm">没有已完成的文档</span>
      </div>

      <div
        v-for="doc in completedDocs"
        :key="doc.id"
        class="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:shadow-sm transition-all"
      >
        <!-- Info -->
        <div class="flex flex-col gap-1 min-w-0 flex-1 pr-4">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm text-foreground truncate">
              {{ doc.title || '无标题文档' }}
            </span>
            <span
              v-if="doc.project"
              class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
            >
              {{ doc.project }}
            </span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10/20 text-primary font-medium"
            >
              {{ doc.category }}
            </span>
          </div>
          <span class="text-xs text-muted-foreground truncate">
            {{ doc.content.replace(/[#*`_\-\[\]]/g, '').trim() || '无内容' }}
          </span>
          <span class="text-[10px] text-muted-foreground">
            更新时间: {{ formatDate(doc.updatedAt) }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-2 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer"
            title="恢复文档"
            @click="handleRestore(doc.id, $event)"
          >
            <RotateCcw class="size-4 mr-1" />
            <span class="text-xs">恢复</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
            title="永久删除"
            @click="handleDelete(doc.id, $event)"
          >
            <Trash2 class="size-4 mr-1" />
            <span class="text-xs">删除</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
