<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, defineComponent, h } from 'vue'
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { FileX, FilePlusCorner, BookOpenCheck } from 'lucide-vue-next'
import { Dialog } from '@/components/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { confirm } from '@/components/confirm'
import CompletedDocsDialog from './CompletedDocsDialog.vue'
import QuickAddDialog from './QuickAddDialog.vue'
import ConvertToRequirementDialog from './ConvertToRequirementDialog.vue'
import { contextMenuManager } from '@/context-menu/context-menu-manager'
import type { ContextMenuItem } from '@/context-menu/context-menu-types'
import DailyDocItem from './DailyDocItem.vue'
import RequirementDocItem from './RequirementDocItem.vue'
import { DraggableList, type ReorderEvent } from '@/components/ui/draggableList'
import {
  apiDelete,
  apiBatchDelete,
  apiReorder,
  apiList,
  apiDetail,
  apiCreate,
  apiUpdate,
} from '@/apis/note'
import { mapNoteToDocument } from '@/apis/note-mapper'
import { isElectron } from '@/utils/env'
import DatePicker from '@/components/ui/datePicker/index.vue'

const TestCustomComponent = defineComponent({
  props: {
    title: String,
  },
  emits: ['close'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'p-3 text-xs w-[160px] flex flex-col gap-2 bg-popover rounded-md' }, [
        h('span', { class: 'font-semibold text-foreground' }, props.title),
        h(
          'button',
          {
            class:
              'w-full bg-primary text-primary-foreground py-1 rounded text-center cursor-pointer hover:opacity-90',
            onClick: () => emit('close'),
          },
          '关闭菜单',
        ),
      ])
  },
})

const appStore = useAppStore()

/** 本地自持的文档列表数据 */
const documents = ref<DocumentItem[]>([])

/** 本地维护的文档多选选中 ID 数组 */
const listSelectedIds = ref<string[]>([])

/**
 * 加载当前项目/分类下的文档列表
 */
async function loadDocuments() {
  if (isElectron) {
    try {
      const pid = appStore.currentProject || 'global'
      let type: 'daily' | 'requirement' | undefined = undefined
      if (appStore.currentCategory === '日常') {
        type = 'daily'
      } else if (appStore.currentCategory === '需求') {
        type = 'requirement'
      }
      const notes = await apiList(pid, type)
      const list = notes.map(mapNoteToDocument)

      // 如果存在当前选中的文档，且不在过滤列表里（如已归档但正在被编辑的文档），且属于当前项目和当前分类，则临时加入列表
      if (appStore.selectedDocumentId && !list.some((d) => d.id === appStore.selectedDocumentId)) {
        try {
          const note = await apiDetail(appStore.selectedDocumentId)
          if (note) {
            const doc = mapNoteToDocument(note)
            const noteProject = doc.project || 'global'
            const currentPid = appStore.currentProject || 'global'
            if (noteProject === currentPid && doc.category === appStore.currentCategory) {
              list.push(doc)
            }
          }
        } catch (err) {
          console.error('Failed to append selected archived document:', err)
        }
      }

      documents.value = list
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  } else {
    documents.value = []
  }
}

/**
 * 过滤分类与完成状态
 */
const filteredDocuments = computed(() => {
  let docs = documents.value
  docs = docs.filter((d) => {
    if (d.id === appStore.selectedDocumentId) return true
    return !d.completed && d.category === appStore.currentCategory
  })
  return docs
})

/**
 * 选择默认文档
 */
function selectDefaultDocument() {
  const filtered = filteredDocuments.value
  if (filtered.length > 0) {
    if (
      !appStore.selectedDocumentId ||
      !filtered.some((d) => d.id === appStore.selectedDocumentId)
    ) {
      appStore.selectDocument(filtered[0].id)
    }
  } else {
    appStore.selectDocument(null)
  }
}

// 监听当前项目/分类的变化，并自动刷新文档列表
watch(
  () => [appStore.currentProject, appStore.currentCategory],
  async () => {
    await loadDocuments()
    selectDefaultDocument()
  },
)

// 监听保存/持久化时间戳信号，自动刷新文档列表
watch(
  () => appStore.lastSavedTime,
  async () => {
    await loadDocuments()
  },
)

// 监听当前激活的文档 ID，并将其同步到选中列表中
watch(
  () => appStore.selectedDocumentId,
  (newId) => {
    if (newId) {
      if (!listSelectedIds.value.includes(newId)) {
        listSelectedIds.value = [newId]
      }
    } else {
      listSelectedIds.value = []
    }
  },
  { immediate: true },
)

function handleOpenCompleted() {
  Dialog.show(CompletedDocsDialog)
}

/**
 * 本地新建文档辅助方法
 */
async function createDocument(title = '无标题文档', content = '', category?: '日常' | '需求') {
  const targetCategory = category || appStore.currentCategory
  if (isElectron) {
    try {
      const deadline = targetCategory === '需求' ? new Date() : null
      const created = await apiCreate({
        projectId: appStore.currentProject || 'global',
        title,
        content,
        deadline,
        isArchived: false,
      })
      const saved = mapNoteToDocument(created)
      await appStore.selectDocument(saved.id)
      appStore.lastSavedTime = new Date().toLocaleTimeString()
      return saved
    } catch (err) {
      console.error('Failed to create document:', err)
      return null
    }
  }
  return null
}

async function handleQuickAdd() {
  try {
    const titles = await Dialog.show<string[]>(QuickAddDialog)
    if (titles && titles.length > 0) {
      let firstDocId: string | null = null
      for (const title of [...titles].reverse()) {
        const created = await createDocument(title, '', '日常')
        if (created) {
          firstDocId = created.id
        }
      }
      const needManualLoad = appStore.currentCategory === '日常'
      await appStore.switchProjectAndCategory(appStore.currentProject, '日常', firstDocId)
      if (needManualLoad) {
        await loadDocuments()
      }
    }
  } catch {
    // Dialog cancelled
  }
}

const categoryTabs: Array<'日常' | '需求'> = ['日常', '需求']

// Toggle completion checkbox in list
async function toggleCompletion(doc: DocumentItem) {
  try {
    const newCompleted = !doc.completed
    await apiUpdate({
      id: doc.id,
      isArchived: newCompleted,
      deadline: doc.category === '需求' && doc.deadline ? new Date(doc.deadline) : null,
    })
    appStore.lastSavedTime = new Date().toLocaleTimeString()
    selectDefaultDocument()
  } catch (error) {
    console.error('Failed to toggle completion:', error)
  }
}

// Right-click menu registration
onMounted(async () => {
  await loadDocuments()
  selectDefaultDocument()

  contextMenuManager.register({
    type: 'document',
    getMenus: (context) => {
      const doc = context.data as DocumentItem
      const isMultiSelect =
        listSelectedIds.value.length > 1 && listSelectedIds.value.includes(doc.id)

      const menus: ContextMenuItem[] = [
        {
          id: 'test-submenu',
          label: '测试二级菜单',
          children: [
            {
              id: 'sub-item-1',
              label: '动态可见项',
              visible: () => true,
              onClick: () => {
                console.log('Sub item 1 clicked')
              },
            },
            {
              id: 'sub-item-2',
              label: '动态隐藏项',
              visible: () => false,
              onClick: () => {
                console.log('Sub item 2 clicked')
              },
            },
            {
              id: 'sub-item-3',
              label: '动态禁用项',
              disabled: () => true,
              onClick: () => {
                console.log('Sub item 3 clicked')
              },
            },
            {
              id: 'sub-item-4',
              label: '正常子选项',
              disabled: () => false,
              onClick: () => {
                console.log('Sub item 4 clicked')
              },
            },
          ],
        },
        {
          id: 'test-custom',
          label: '测试自定义面板',
          submenuComponent: TestCustomComponent,
          submenuComponentProps: { title: '自定义提示标题' },
        },
        {
          id: 'date',
          label: '日期',
          submenuComponent: DatePicker,
        },
        {
          id: 'complete',
          label: isMultiSelect ? `完成已选 (${listSelectedIds.value.length} 篇)` : '完成',
          onClick: async () => {
            try {
              if (isMultiSelect) {
                for (const id of listSelectedIds.value) {
                  const itemDoc = documents.value.find((d) => d.id === id)
                  await apiUpdate({
                    id,
                    isArchived: true,
                    deadline:
                      itemDoc?.category === '需求' && itemDoc.deadline
                        ? new Date(itemDoc.deadline)
                        : null,
                  })
                }
              } else {
                await apiUpdate({
                  id: doc.id,
                  isArchived: true,
                  deadline: doc.category === '需求' && doc.deadline ? new Date(doc.deadline) : null,
                })
              }
              appStore.lastSavedTime = new Date().toLocaleTimeString()
              selectDefaultDocument()
            } catch (error) {
              console.error('Failed to update completion status:', error)
            }
          },
        },
        {
          id: 'delete',
          label: isMultiSelect ? `删除已选 (${listSelectedIds.value.length} 篇)` : '删除',
          onClick: async () => {
            try {
              const count = listSelectedIds.value.length
              const title = isMultiSelect ? '批量删除文档' : '删除文档'
              const description = isMultiSelect
                ? `确定要删除这 ${count} 篇文档吗？此操作无法撤销。`
                : '确定要删除此文档吗？此操作无法撤销。'

              const isConfirmed = await confirm({
                title,
                description,
                destructive: true,
                okText: '确定删除',
                cancelText: '取消',
              })

              if (isConfirmed) {
                if (isMultiSelect) {
                  const idsToDelete = [...listSelectedIds.value]
                  await apiBatchDelete(idsToDelete)
                  appStore.lastSavedTime = new Date().toLocaleTimeString()

                  if (
                    appStore.selectedDocumentId &&
                    idsToDelete.includes(appStore.selectedDocumentId)
                  ) {
                    selectDefaultDocument()
                  } else {
                    listSelectedIds.value = listSelectedIds.value.filter(
                      (id) => !idsToDelete.includes(id),
                    )
                  }
                } else {
                  await apiDelete(doc.id)
                  appStore.lastSavedTime = new Date().toLocaleTimeString()

                  if (appStore.selectedDocumentId === doc.id) {
                    selectDefaultDocument()
                  } else {
                    listSelectedIds.value = listSelectedIds.value.filter((id) => id !== doc.id)
                  }
                }
              }
            } catch (error) {
              console.error('Failed to delete document(s):', error)
            }
          },
        },
      ]

      if (!isMultiSelect && doc.category !== '需求') {
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
    const date = await Dialog.show<string>(ConvertToRequirementDialog)
    if (date) {
      await apiUpdate({
        id: doc.id,
        deadline: new Date(date),
      })
      appStore.lastSavedTime = new Date().toLocaleTimeString()
      selectDefaultDocument()
    }
  } catch {
    // Dialog cancelled
  }
}

function handleSelectionChange(ids: string[]) {
  listSelectedIds.value = ids
}

function handleOpen(item: DocumentItem) {
  appStore.selectDocument(item.id)
}

async function handleReorder(event: ReorderEvent<DocumentItem>) {
  const { items: newItems, movedIds } = event
  const firstMovedIndex = newItems.findIndex((item) => movedIds.includes(item.id))
  if (firstMovedIndex === -1) return

  const prevItem = firstMovedIndex > 0 ? newItems[firstMovedIndex - 1] : null
  const lastMovedIndex = firstMovedIndex + movedIds.length - 1
  const nextItem = lastMovedIndex < newItems.length - 1 ? newItems[lastMovedIndex + 1] : null
  const type = appStore.currentCategory === '需求' ? 'requirement' : 'daily'

  try {
    await apiReorder({
      movedIds,
      prevId: prevItem ? prevItem.id : null,
      nextId: nextItem ? nextItem.id : null,
      projectId: appStore.currentProject || 'global',
      type,
    })
    await loadDocuments()
  } catch (error) {
    console.error('Failed to reorder documents:', error)
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
        :model-value="appStore.currentCategory"
        class="w-auto"
        @update:model-value="(val) => (appStore.currentCategory = val as any)"
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
        <Button variant="outline" size="icon" aria-label="新增" @click="handleQuickAdd">
          <FilePlusCorner :size="16" />
        </Button>
        <Button variant="outline" size="icon" aria-label="完成列表" @click="handleOpenCompleted">
          <BookOpenCheck :size="16" />
        </Button>
      </div>
    </div>

    <!-- Scrollable List -->
    <div class="flex-1 overflow-y-auto p-4" @click.self="listSelectedIds = []">
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
        @selection-change="handleSelectionChange"
        @open="handleOpen"
        @reorder="handleReorder"
        @context-menu="(item, event) => handleContextMenu(event, item)"
      >
        <template #item="{ item: doc, selected, opened, hover }">
          <component
            :is="doc.category === '需求' ? RequirementDocItem : DailyDocItem"
            :doc="doc"
            :is-selected="selected"
            :is-opened="opened"
            :is-hovered="hover"
            @toggle="toggleCompletion"
          />
        </template>
      </DraggableList>
    </div>
  </div>
</template>
