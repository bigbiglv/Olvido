import { defineStore } from 'pinia'

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as DocumentItem[],
    projects: ['个人网站', 'API 服务重构', '学习计划', '开源贡献', '生活记录'] as string[],
    currentProject: null as string | null, // null means "记事本" (Notebook/Global)
    currentCategory: '日常' as '日常' | '需求' | '已完成',
    searchQuery: '',
    selectedDocumentId: null as string | null,
    dbStatus: '未连接',
    lastSavedTime: '',
  }),

  getters: {
    selectedDocument(state): DocumentItem | null {
      return state.documents.find((d) => d.id === state.selectedDocumentId) || null
    },
    filteredDocuments(state): DocumentItem[] {
      let docs = state.documents

      // Filter by project
      if (state.currentProject) {
        docs = docs.filter((d) => d.project === state.currentProject)
      } else {
        // "记事本" (Global) shows documents without project
        docs = docs.filter((d) => !d.project)
      }

      // Filter by category/completion
      if (state.currentCategory === '已完成') {
        docs = docs.filter((d) => d.completed)
      } else {
        docs = docs.filter((d) => !d.completed && d.category === state.currentCategory)
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        docs = docs.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.content.toLowerCase().includes(query)
        )
      }

      return docs
    },
  },

  actions: {
    async loadDocuments() {
      if (isElectron) {
        this.dbStatus = '正在连接 SQLite 数据库...'
        try {
          const docs = await window.electronAPI.getDocuments()
          this.documents = docs
          this.dbStatus = '已连接 SQLite 数据库'
        } catch (err) {
          console.error('Failed to load documents:', err)
          const errMsg = err instanceof Error ? err.message : String(err)
          this.dbStatus = `连接失败: ${errMsg}`
        }
      } else {
        this.dbStatus = '网页预览模式 (使用 Mock 数据)'
        if (this.documents.length === 0) {
          this.documents = [
            {
              id: '1',
              title: '网站性能优化方案',
              content: `## 背景\n\n当前网站在移动端加载速度较慢，需要系统性地进行性能优化，提升用户体验和 SEO 排名。\n\n## 目标\n\n- 首屏加载时间 < 2s\n- Lighthouse 性能评分 > 90\n- 减少跳出率\n\n## 优化方案\n\n### 1. 资源优化\n- 图片使用 WebP 格式\n- 启用图片懒加载\n- CSS 和 JS 文件压缩\n- 使用 CDN 加速静态资源\n\n### 2. 代码优化\n- 移除无用代码\n- 按需加载组件\n- 使用动态导入 (Dynamic Import)\n- 优化首屏渲染逻辑\n\n### 3. 缓存策略\n- 启用浏览器缓存\n- 使用 Service Worker 缓存关键资源\n- 配置合理的缓存过期时间`,
              category: '日常',
              project: '个人网站',
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              title: '技术选型调研',
              content: '# 技术选型调研\n\n评估 Electron + Vue 3 和 React + Tauri 的优缺点。',
              category: '日常',
              project: '个人网站',
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              title: '首页设计思路',
              content: '# 首页设计思路\n\n1. 采用三栏布局\n2. 增加暗黑模式\n3. 优化列表滚动。',
              category: '日常',
              project: '个人网站',
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '4',
              title: '项目架构图',
              content: '# 项目架构图\n\n设计并整理系统架构。',
              category: '需求',
              project: '个人网站',
              completed: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '5',
              title: 'API 服务重构草案',
              content: '# API 服务重构草案\n\n重构后端接口，迁移到 NestJS。',
              category: '日常',
              project: 'API 服务重构',
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '6',
              title: '记事本草稿 1',
              content: '# 随手记\n\n一些不需要归入项目的零碎想法。',
              category: '日常',
              project: null,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        }
      }

      // Automatically select first document if none selected
      this.selectDefaultDocument()
    },

    selectDefaultDocument() {
      const filtered = this.filteredDocuments
      if (filtered.length > 0) {
        if (!this.selectedDocumentId || !filtered.some((d) => d.id === this.selectedDocumentId)) {
          this.selectedDocumentId = filtered[0].id
        }
      } else {
        this.selectedDocumentId = null
      }
    },

    async createDocument(title = '无标题文档', content = '') {
      const newDoc = {
        title,
        content,
        category: this.currentCategory === '已完成' ? '日常' : this.currentCategory,
        project: this.currentProject,
        completed: false,
      }

      if (isElectron) {
        try {
          const saved = await window.electronAPI.saveDocument(newDoc)
          this.documents.unshift(saved)
          this.selectedDocumentId = saved.id
          this.lastSavedTime = new Date().toLocaleTimeString()
        } catch (err) {
          console.error('Failed to create document:', err)
        }
      } else {
        const mockSaved: DocumentItem = {
          ...newDoc,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.documents.unshift(mockSaved)
        this.selectedDocumentId = mockSaved.id
        this.lastSavedTime = new Date().toLocaleTimeString()
      }
    },

    async saveDocument(docId: string, updates: Partial<DocumentItem>) {
      const docIndex = this.documents.findIndex((d) => d.id === docId)
      if (docIndex === -1) return

      const updatedDoc = {
        ...this.documents[docIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      // Update state immediately for UX
      this.documents[docIndex] = updatedDoc

      if (isElectron) {
        try {
          await window.electronAPI.saveDocument({
            id: updatedDoc.id,
            title: updatedDoc.title,
            content: updatedDoc.content,
            category: updatedDoc.category,
            project: updatedDoc.project,
            completed: updatedDoc.completed,
          })
          this.lastSavedTime = new Date().toLocaleTimeString()
        } catch (err) {
          console.error('Failed to save document:', err)
        }
      } else {
        this.lastSavedTime = new Date().toLocaleTimeString()
      }
    },

    async deleteDocument(docId: string) {
      if (isElectron) {
        try {
          await window.electronAPI.deleteDocument(docId)
          this.documents = this.documents.filter((d) => d.id !== docId)
        } catch (err) {
          console.error('Failed to delete document:', err)
        }
      } else {
        this.documents = this.documents.filter((d) => d.id !== docId)
      }

      if (this.selectedDocumentId === docId) {
        this.selectDefaultDocument()
      }
    },

    addProject(projectName: string) {
      const trimmed = projectName.trim()
      if (trimmed && !this.projects.includes(trimmed)) {
        this.projects.push(trimmed)
      }
    },

    selectProject(project: string | null) {
      this.currentProject = project
      this.selectDefaultDocument()
    },

    selectCategory(category: '日常' | '需求' | '已完成') {
      this.currentCategory = category
      this.selectDefaultDocument()
    },
  },
})
