import { defineStore } from 'pinia'

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    currentProject: null as string | null, // null means "记事本" (Notebook/Global)
    currentCategory: '日常' as '日常' | '需求' | '已完成',
    searchQuery: '',
    selectedDocumentId: null as string | null,
    dbStatus: '未连接',
    lastSavedTime: '',
  }),
})
