import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import { applyTheme, isThemeMode, isThemeName, subscribeSystemThemeChange } from '@/theme'
import type { ThemeMode, ThemeName } from '@/theme'
import { isElectron } from '@/utils/env'
import { apiDetail } from '@/apis/note'
import { mapNoteToDocument } from '@/apis/note-mapper'

interface AppState {
  /** 当前选中的项目 ID，null 表示全局记事本（无项目） */
  currentProject: string | null
  /** 当前选中的笔记分类：日常、需求或已完成 */
  currentCategory: '日常' | '需求' | '已完成'
  /** 当前选中的文档 ID */
  selectedDocumentId: string | null
  /** 当前选中并加载出来的完整文档数据对象 */
  selectedDocument: DocumentItem | null
  /** 最新一次触发文档保存或修改的时间戳，用作跨组件重载通知的信号 */
  lastSavedTime: string
}

let stopSystemThemeSync: (() => void) | undefined

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    currentProject: null,
    currentCategory: '日常',
    selectedDocumentId: null,
    selectedDocument: null,
    lastSavedTime: '',
  }),
  getters: {
    themeName(): ThemeName {
      const configStore = useConfigStore()
      const name = configStore.config.themeName
      return isThemeName(name) ? name : 'violet'
    },
    themeMode(): ThemeMode {
      const configStore = useConfigStore()
      const mode = configStore.config.theme
      return isThemeMode(mode) ? mode : 'system'
    },
  },
  actions: {
    setThemeName(themeName: ThemeName) {
      const configStore = useConfigStore()
      configStore.updateConfig({ themeName })
      this.applyTheme()
    },
    setThemeMode(themeMode: ThemeMode) {
      const configStore = useConfigStore()
      configStore.updateConfig({ theme: themeMode })
      this.setupThemeSync()
    },
    setTheme(themeName: ThemeName, themeMode: ThemeMode) {
      const configStore = useConfigStore()
      configStore.updateConfig({ themeName, theme: themeMode })
      this.setupThemeSync()
    },
    applyTheme() {
      applyTheme(this.themeName, this.themeMode)
    },
    setupThemeSync() {
      stopSystemThemeSync?.()
      stopSystemThemeSync = undefined

      this.applyTheme()

      if (this.themeMode === 'system') {
        // system 模式只监听系统色彩方案变化，持久化状态仍保持 themeMode: system。
        stopSystemThemeSync = subscribeSystemThemeChange(() => {
          this.applyTheme()
        })
      }
    },
    /**
     * 选中并加载特定的文档详情
     * @param docId 文档 ID，传入 null 表示清空当前选择
     */
    async selectDocument(docId: string | null) {
      this.selectedDocumentId = docId
      if (docId) {
        if (isElectron) {
          try {
            const note = await apiDetail(docId)
            if (note) {
              this.selectedDocument = mapNoteToDocument(note)
            } else {
              this.selectedDocument = null
            }
          } catch (error) {
            console.error('Failed to load selected document:', error)
            this.selectedDocument = null
          }
        } else {
          this.selectedDocument = null
        }
      } else {
        this.selectedDocument = null
      }
    },
    /**
     * 切换当前项目与分类，并支持传入特定文档 ID 进行默认激活
     * @param projectId 项目唯一标识，null 表示全局
     * @param category 分类名称
     * @param docId 可选的需要选中的文档 ID
     */
    async switchProjectAndCategory(
      projectId: string | null,
      category: '日常' | '需求' | '已完成',
      docId?: string | null,
    ) {
      this.currentProject = projectId
      this.currentCategory = category
      if (docId !== undefined) {
        await this.selectDocument(docId)
      } else {
        await this.selectDocument(null)
      }
    },
  },
})
