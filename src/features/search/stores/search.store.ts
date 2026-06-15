import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    isOpen: false,
    keyword: '',
    projectId: undefined as string | undefined, // undefined = 全部项目, 'global' = 全局笔记本, UUID = 指定项目
    selectedIndex: 0,
  }),
  actions: {
    openProjectSearch(currentProjectId: string | null) {
      this.projectId = currentProjectId || 'global'
      this.keyword = ''
      this.selectedIndex = 0
      this.isOpen = true
    },
    openGlobalSearch() {
      this.projectId = undefined
      this.keyword = ''
      this.selectedIndex = 0
      this.isOpen = true
    },
    closeSearch() {
      this.isOpen = false
    },
  },
})
