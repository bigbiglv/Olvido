<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { Button } from '@/components/ui/button'
import { FileX } from 'lucide-vue-next'
import { Dialog } from '@/components/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { confirm } from '@/components/confirm'
import CompletedDocsDialog from './CompletedDocsDialog.vue'
import QuickAddDialog from './QuickAddDialog.vue'
import ConvertToRequirementDialog from './ConvertToRequirementDialog.vue'
import { contextMenuManager } from '@/context-menu/context-menu-manager'
import DailyDocItem from './DailyDocItem.vue'
import RequirementDocItem from './RequirementDocItem.vue'

const store = useDocumentsStore()

function handleOpenCompleted() {
  Dialog.show(
    CompletedDocsDialog,
  )
}

async function handleQuickAdd() {
  try {
    const titles = await Dialog.show<string[]>(
      QuickAddDialog,
    )
    if (titles && titles.length > 0) {
      // Reverse loop to keep the first input item at the top of the unshifted list and selected
      for (const title of [...titles].reverse()) {
        await store.createDocument(title, '', '日常')
      }
      // Auto switch category to daily to show the results, using switchProjectAndCategory to preserve selected document ID
      store.switchProjectAndCategory(store.currentProject, '日常', store.selectedDocumentId)
    }
  } catch {
    // Dialog cancelled
  }
}

const categoryTabs: Array<'日常' | '需求'> = ['日常', '需求']

// Toggle completion checkbox in list
async function toggleCompletion(doc: DocumentItem) {
  const newCompleted = !doc.completed
  await store.saveDocument(doc.id, { completed: newCompleted })

  // Re-evaluate selection
  store.selectDefaultDocument()
}

// Right-click menu registration
onMounted(() => {
  contextMenuManager.register({
    type: 'document',
    getMenus: (context) => {
      const doc = context.data as DocumentItem
      const menus = [
        {
          id: 'complete',
          label: '完成',
          onClick: async () => {
            await store.saveDocument(doc.id, { completed: true })
            store.selectDefaultDocument()
          },
        },
        {
          id: 'delete',
          label: '删除',
          onClick: async () => {
            const isConfirmed = await confirm({
              title: '删除文档',
              description: '确定要删除此文档吗？此操作无法撤销。',
              destructive: true,
              okText: '确定删除',
              cancelText: '取消',
            })
            if (isConfirmed) {
              await store.deleteDocument(doc.id)
            }
          },
        },
      ]

      if (doc.category !== '需求') {
        menus.push({
          id: 'convert',
          label: '转为需求',
          onClick: async () => {
            await handleConvertToRequirement(doc)
          },
        })
      }

      return menus
    },
  })
})

onUnmounted(() => {
  contextMenuManager.unregister('document')
})

function handleContextMenu(event: MouseEvent, doc: DocumentItem) {
  contextMenuManager.show(event, doc)
}

async function handleConvertToRequirement(doc: DocumentItem) {
  try {
    const date = await Dialog.show<string>(
      ConvertToRequirementDialog,
    )
    if (date) {
      await store.saveDocument(doc.id, {
        category: '需求',
        deadline: date,
      })
      store.selectDefaultDocument()
    }
  } catch {
    // Dialog cancelled
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-zinc-900 select-none">
    <!-- Tabs header -->
    <div
      class="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between"
    >
      <Tabs
        :model-value="store.currentCategory"
        class="w-auto"
        @update:model-value="(val) => (store.currentCategory = val as any)"
      >
        <TabsList class="h-8 p-1">
          <TabsTrigger
            v-for="tab in categoryTabs"
            :key="tab"
            :value="tab"
            class="text-xs h-6 px-3 cursor-pointer data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:font-semibold text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            {{ tab }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div class="flex items-center gap-2">
        <Button size="sm" @click="handleQuickAdd"> 新增 </Button>
        <Button size="sm" @click="handleOpenCompleted"> 已完成 </Button>
      </div>
    </div>

    <!-- Scrollable List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1">
      <div
        v-if="store.filteredDocuments.length === 0"
        class="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-zinc-500 p-4"
      >
        <FileX class="size-8 opacity-40 mb-2" />
        <span class="text-xs">未找到文档</span>
      </div>

      <component
        :is="doc.category === '需求' ? RequirementDocItem : DailyDocItem"
        v-for="doc in store.filteredDocuments"
        :key="doc.id"
        :doc="doc"
        :is-selected="store.selectedDocumentId === doc.id"
        @select="(id) => (store.selectedDocumentId = id)"
        @toggle="toggleCompletion"
        @contextmenu="handleContextMenu"
      />
    </div>
  </div>
</template>
