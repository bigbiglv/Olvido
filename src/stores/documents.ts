import { ref, computed, watch, nextTick } from 'vue'
import { defineStore } from 'pinia'
import { isElectron } from '@/utils/env'
import {
  apiList,
  apiCreate,
  apiUpdate,
  apiDelete,
  apiDetail,
  apiReorder,
} from '@/apis/note'
import { mapNoteToDocument } from '@/apis/note-mapper'

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const currentProject = ref<string | null>(null) // null 表示 "记事本" (全局/无项目)
  const currentCategory = ref<'日常' | '需求' | '已完成'>('日常')
  const searchQuery = ref('')
  const selectedDocumentId = ref<string | null>(null)
  const listSelectedIds = ref<string[]>([])
  const dbStatus = ref('未连接')
  const lastSavedTime = ref('')
  const documents = ref<DocumentItem[]>([])

  // Getters
  const filteredDocuments = computed(() => {
    let docs = documents.value

    // 过滤分类与完成状态
    // 如果是当前选中的文档，特例予以显示（以支持已归档文档的临时选中展示）
    docs = docs.filter((d) => {
      if (d.id === selectedDocumentId.value) return true
      return !d.completed && d.category === currentCategory.value
    })

    // 过滤搜索关键词
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      docs = docs.filter(
        (d) =>
          d.id === selectedDocumentId.value ||
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query),
      )
    }

    return docs
  })

  const selectedDocument = computed(() => {
    return documents.value.find((d) => d.id === selectedDocumentId.value) || null
  })

  // Actions

  /**
   * 选择列表中的默认文档（首选第一个，若无则设为 null）
   */
  function selectDefaultDocument() {
    const filtered = filteredDocuments.value
    if (filtered.length > 0) {
      if (!selectedDocumentId.value || !filtered.some((d) => d.id === selectedDocumentId.value)) {
        selectedDocumentId.value = filtered[0].id
        listSelectedIds.value = [filtered[0].id]
      } else {
        listSelectedIds.value = [selectedDocumentId.value]
      }
    } else {
      selectedDocumentId.value = null
      listSelectedIds.value = []
    }
  }

  /**
   * 加载当前项目/分类下的文档列表
   */
  async function loadDocuments() {
    if (isElectron) {
      dbStatus.value = '正在连接 SQLite 数据库...'
      try {
        const pid = currentProject.value || 'global'
        let type: 'daily' | 'requirement' | undefined = undefined
        if (currentCategory.value === '日常') {
          type = 'daily'
        } else if (currentCategory.value === '需求') {
          type = 'requirement'
        }
        const notes = await apiList(pid, type)
        const list = notes.map(mapNoteToDocument)

        // 如果存在当前选中的文档，且不在过滤列表里（如已归档但正在被编辑的文档），且属于当前项目和当前分类，则临时加入列表
        if (selectedDocumentId.value && !list.some((d) => d.id === selectedDocumentId.value)) {
          try {
            const note = await apiDetail(selectedDocumentId.value)
            if (note) {
              const doc = mapNoteToDocument(note)
              const noteProject = doc.project || 'global'
              const currentPid = currentProject.value || 'global'
              if (noteProject === currentPid && doc.category === currentCategory.value) {
                list.push(doc)
              }
            }
          } catch (err) {
            console.error('Failed to append selected archived document:', err)
          }
        }

        documents.value = list
        dbStatus.value = '已连接 SQLite 数据库'
      } catch (err) {
        console.error('Failed to load documents:', err)
        const errMsg = err instanceof Error ? err.message : String(err)
        dbStatus.value = `连接失败: ${errMsg}`
      }
    } else {
      dbStatus.value = '网页预览模式 (使用 Mock 数据)'
      if (documents.value.length === 0) {
        documents.value = [
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
            content: '# 项目架构图\n\n设计并整理 system 架构。',
            category: '需求',
            project: '个人网站',
            completed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '5',
            title: 'API 服务重构草案',
            content: '# API 服务重构草案\n\n重构后端接口，迁移 to NestJS。',
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
    selectDefaultDocument()
  }

  /**
   * 创建一篇新文档
   * @param title 标题，默认为 "无标题文档"
   * @param content 内容，默认为空
   * @param category 分类，默认取当前选中分类
   */
  async function createDocument(
    title = '无标题文档',
    content = '',
    category?: '日常' | '需求',
    skipReload = false,
  ) {
    const targetCategory = category || currentCategory.value
    const newDoc = {
      title,
      content,
      category: targetCategory,
      project: currentProject.value,
      completed: false,
    }

    if (isElectron) {
      try {
        const deadline = newDoc.category === '需求' ? new Date() : null
        const created = await apiCreate({
          projectId: currentProject.value || 'global',
          title: newDoc.title,
          content: newDoc.content,
          deadline,
          isArchived: false,
        })
        const saved = mapNoteToDocument(created)
        selectedDocumentId.value = saved.id
        listSelectedIds.value = [saved.id]
        if (!skipReload) {
          await loadDocuments()
        }
        lastSavedTime.value = new Date().toLocaleTimeString()
      } catch (err) {
        console.error('Failed to create document:', err)
      }
    } else {
      const mockSaved: DocumentItem = {
        ...newDoc,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: newDoc.category === '需求' ? new Date().toISOString() : null,
      }
      documents.value.unshift(mockSaved)
      selectedDocumentId.value = mockSaved.id
      listSelectedIds.value = [mockSaved.id]
      lastSavedTime.value = new Date().toLocaleTimeString()
    }
  }

  /**
   * 保存更新文档信息
   * @param docId 文档 ID
   * @param updates 待更新的部分字段
   */
  async function saveDocument(docId: string, updates: Partial<DocumentItem>) {
    const docIndex = documents.value.findIndex((d) => d.id === docId)

    let updatedDoc: DocumentItem | null = null
    if (docIndex !== -1) {
      updatedDoc = {
        ...documents.value[docIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      // 立即更新本地状态，提升交互响应速度
      documents.value[docIndex] = updatedDoc
    }

    if (isElectron) {
      try {
        let deadline: Date | null | undefined = undefined
        const currentDoc = updatedDoc || documents.value.find((d) => d.id === docId)
        if (currentDoc) {
          if (currentDoc.category === '需求') {
            deadline = currentDoc.deadline ? new Date(currentDoc.deadline) : new Date()
          } else {
            deadline = null
          }
        } else {
          if (updates.category === '需求') {
            deadline = updates.deadline ? new Date(updates.deadline) : new Date()
          } else if (updates.category === '日常') {
            deadline = null
          }
        }

        await apiUpdate({
          id: docId,
          title: updatedDoc?.title || updates.title,
          content: updatedDoc?.content || updates.content,
          projectId: updatedDoc ? updatedDoc.project || 'global' : undefined,
          isArchived: updatedDoc
            ? updatedDoc.completed
            : updates.completed !== undefined
              ? updates.completed
              : undefined,
          deadline,
        })
        lastSavedTime.value = new Date().toLocaleTimeString()
      } catch (err) {
        console.error('Failed to save document:', err)
      }
    } else {
      lastSavedTime.value = new Date().toLocaleTimeString()
    }
  }

  /**
   * 删除一篇文档
   * @param docId 文档 ID
   */
  async function deleteDocument(docId: string) {
    if (isElectron) {
      try {
        await apiDelete(docId)
        await loadDocuments()
      } catch (err) {
        console.error('Failed to delete document:', err)
      }
    } else {
      documents.value = documents.value.filter((d) => d.id !== docId)
    }

    if (selectedDocumentId.value === docId) {
      selectDefaultDocument()
    }
  }

  /**
   * 重新排序文档（向后端发起区间排序请求，并在完成后更新本地数据列表）
   */
  async function reorderDocuments(data: {
    movedIds: string[]
    prevId: string | null
    nextId: string | null
    projectId: string
    type: 'daily' | 'requirement'
  }) {
    if (isElectron) {
      try {
        await apiReorder(data)
        // 重新从数据库拉取，保证内存顺序和排序字段绝对同步与准确
        await loadDocuments()
      } catch (err) {
        console.error('Failed to reorder documents:', err)
      }
    } else {
      // Mock 网页预览模式：纯内存级拖拽重排逻辑
      const allNotes = [...documents.value]
      const movedNotes = allNotes.filter((n) => data.movedIds.includes(n.id))
      const remainingNotes = allNotes.filter((n) => !data.movedIds.includes(n.id))

      if (data.prevId) {
        const prevIndex = remainingNotes.findIndex((n) => n.id === data.prevId)
        if (prevIndex !== -1) {
          remainingNotes.splice(prevIndex + 1, 0, ...movedNotes)
        }
      } else if (data.nextId) {
        const nextIndex = remainingNotes.findIndex((n) => n.id === data.nextId)
        if (nextIndex !== -1) {
          remainingNotes.splice(nextIndex, 0, ...movedNotes)
        }
      } else {
        remainingNotes.push(...movedNotes)
      }

      // 重新生成 Mock 的 sortOrder 序号
      remainingNotes.forEach((note, index) => {
        note.sortOrder = (index + 1) * 1000
      })
      documents.value = remainingNotes
    }
  }

  let preserveSelection = false

  /**
   * 切换项目与分类，并可选地选中特定文档，避免被 watch 清除选中状态
   */
  function switchProjectAndCategory(
    projectId: string | null,
    category: '日常' | '需求' | '已完成',
    docId?: string | null,
  ) {
    preserveSelection = true
    currentProject.value = projectId
    currentCategory.value = category
    if (docId !== undefined) {
      selectedDocumentId.value = docId
      if (docId !== null) {
        listSelectedIds.value = [docId]
      } else {
        listSelectedIds.value = []
      }
    }
    nextTick(() => {
      preserveSelection = false
    })
  }

  // 监听当前项目/分类的变化，并自动刷新文档列表
  watch(
    () => [currentProject.value, currentCategory.value],
    async () => {
      if (preserveSelection) {
        preserveSelection = false
      } else {
        selectedDocumentId.value = null
        listSelectedIds.value = []
      }
      await loadDocuments()
    },
  )

  return {
    currentProject,
    currentCategory,
    searchQuery,
    selectedDocumentId,
    listSelectedIds,
    dbStatus,
    lastSavedTime,
    documents,
    filteredDocuments,
    selectedDocument,
    selectDefaultDocument,
    loadDocuments,
    createDocument,
    saveDocument,
    deleteDocument,
    switchProjectAndCategory,
    reorderDocuments,
  }
})
