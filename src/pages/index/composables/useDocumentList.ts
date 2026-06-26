import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { Dialog } from '@/components/dialog'
import { confirm } from '@/components/confirm'
import CompletedDocsDialog from '../components/dialogs/CompletedDocsDialog.vue'
import QuickAddDialog from '../components/dialogs/QuickAddDialog.vue'
import DatePicker from '@/components/ui/datePicker/index.vue'

import { contextMenuManager } from '@/context-menu/context-menu-manager'
import type { ContextMenuItem } from '@/context-menu/context-menu-types'
import type { ReorderEvent } from '@/components/ui/draggableList'
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


export function useDocumentList() {
  const appStore = useAppStore()

  /** 本地自持的文档列表数据 */
  const documents = ref<DocumentItem[]>([])

  /** 本地维护的文档多选选中 ID 数组 */
  const listSelectedIds = ref<string[]>([])

  const categoryTabs: Array<'日常' | '需求'> = ['日常', '需求']

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

  // Toggle completion checkbox in list
  async function toggleCompletion(doc: DocumentItem) {
    try {
      const newCompleted = !doc.completed
      await apiUpdate({
        id: doc.id,
        isArchived: newCompleted,
        deadline: doc.category === '需求' && doc.deadline ? new Date(doc.deadline) : null,
      })

      doc.completed = newCompleted
      if (newCompleted && appStore.selectedDocumentId === doc.id) {
        appStore.selectDocument(null)
      }

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
            id: 'complete',
            label: isMultiSelect ? `完成(${listSelectedIds.value.length})` : '完成',
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
                    if (itemDoc) itemDoc.completed = true
                  }
                  if (
                    appStore.selectedDocumentId &&
                    listSelectedIds.value.includes(appStore.selectedDocumentId)
                  ) {
                    appStore.selectDocument(null)
                  }
                } else {
                  await apiUpdate({
                    id: doc.id,
                    isArchived: true,
                    deadline: doc.category === '需求' && doc.deadline ? new Date(doc.deadline) : null,
                  })
                  doc.completed = true
                  if (appStore.selectedDocumentId === doc.id) {
                    appStore.selectDocument(null)
                  }
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
            label: isMultiSelect ? `删除(${listSelectedIds.value.length})` : '删除',
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

                    documents.value = documents.value.filter((d) => !idsToDelete.includes(d.id))
                    listSelectedIds.value = listSelectedIds.value.filter(
                      (id) => !idsToDelete.includes(id),
                    )

                    if (
                      appStore.selectedDocumentId &&
                      idsToDelete.includes(appStore.selectedDocumentId)
                    ) {
                      appStore.selectDocument(null)
                    }
                  } else {
                    await apiDelete(doc.id)

                    documents.value = documents.value.filter((d) => d.id !== doc.id)
                    listSelectedIds.value = listSelectedIds.value.filter((id) => id !== doc.id)

                    if (appStore.selectedDocumentId === doc.id) {
                      appStore.selectDocument(null)
                    }
                  }
                  appStore.lastSavedTime = new Date().toLocaleTimeString()
                  selectDefaultDocument()
                }
              } catch (error) {
                console.error('Failed to delete document(s):', error)
              }
            },
          },
        ]

        if (doc.category !== '需求') {
          menus.push({
            id: 'convert',
            label: isMultiSelect ? `转需求(${listSelectedIds.value.length})` : '转需求',
            panelComponent: DatePicker,
            panelProps: {
              bordered: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onConfirm: async (date: any) => {
                contextMenuManager.hide()
                try {
                  if (isMultiSelect) {
                    const idsToConvert = [...listSelectedIds.value]
                    for (const id of idsToConvert) {
                      await apiUpdate({
                        id,
                        deadline: date.toDate()
                      })
                    }
                    listSelectedIds.value = []
                    if (
                      appStore.selectedDocumentId &&
                      idsToConvert.includes(appStore.selectedDocumentId)
                    ) {
                      await appStore.selectDocument(null)
                    }
                  } else {
                    await apiUpdate({
                      id: doc.id,
                      deadline: date.toDate()
                    })
                    listSelectedIds.value = listSelectedIds.value.filter(id => id !== doc.id)
                    if (appStore.selectedDocumentId === doc.id) {
                      await appStore.selectDocument(null)
                    }
                  }
                  appStore.lastSavedTime = new Date().toLocaleTimeString()
                  selectDefaultDocument()
                } catch (error) {
                  console.error('Failed to convert to requirement:', error)
                }
              }
            }
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

  return {
    documents,
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
  }
}
