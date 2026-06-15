<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import DocumentList from './components/DocumentList.vue'
import DocumentEditor from './components/DocumentEditor.vue'
import EmptyState from './components/EmptyState.vue'
import { isElectron } from '@/utils/env'
import { apiListNotes, apiCreateNote, apiUpdateNote, apiDeleteNote } from '@/apis/note'

const store = useDocumentsStore()
const documents = ref<DocumentItem[]>([])

// Load documents from DB or Mock
async function loadDocuments() {
  if (isElectron) {
    store.dbStatus = '正在连接 SQLite 数据库...'
    try {
      const pid = store.currentProject || 'global'
      let type: 'daily' | 'requirement' | undefined = undefined
      if (store.currentCategory === '日常') {
        type = 'daily'
      } else if (store.currentCategory === '需求') {
        type = 'requirement'
      }
      const notes = await apiListNotes(pid, type)
      documents.value = notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.deadline ? '需求' : '日常',
        project: note.projectId === 'global' ? null : note.projectId,
        completed: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }))
      store.dbStatus = '已连接 SQLite 数据库'
    } catch (err) {
      console.error('Failed to load documents:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      store.dbStatus = `连接失败: ${errMsg}`
    }
  } else {
    store.dbStatus = '网页预览模式 (使用 Mock 数据)'
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

// Select default document
function selectDefaultDocument() {
  const filtered = filteredDocuments.value
  if (filtered.length > 0) {
    if (!store.selectedDocumentId || !filtered.some((d) => d.id === store.selectedDocumentId)) {
      store.selectedDocumentId = filtered[0].id
    }
  } else {
    store.selectedDocumentId = null
  }
}

// Create a new document
async function createDocument(title = '无标题文档', content = '') {
  const newDoc = {
    title,
    content,
    category: store.currentCategory === '已完成' ? '日常' : store.currentCategory,
    project: store.currentProject,
    completed: false,
  }

  if (isElectron) {
    try {
      const deadline = newDoc.category === '需求' ? new Date() : null
      const created = await apiCreateNote({
        projectId: store.currentProject || 'global',
        title: newDoc.title,
        content: newDoc.content,
        deadline,
        isArchived: false,
      })
      const saved: DocumentItem = {
        id: created.id,
        title: created.title,
        content: created.content,
        category: created.deadline ? '需求' : '日常',
        project: created.projectId === 'global' ? null : created.projectId,
        completed: created.isArchived,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      }
      documents.value.unshift(saved)
      store.selectedDocumentId = saved.id
      store.lastSavedTime = new Date().toLocaleTimeString()
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
    documents.value.unshift(mockSaved)
    store.selectedDocumentId = mockSaved.id
    store.lastSavedTime = new Date().toLocaleTimeString()
  }
}

// Save a document
async function saveDocument(docId: string, updates: Partial<DocumentItem>) {
  const docIndex = documents.value.findIndex((d) => d.id === docId)
  if (docIndex === -1) return

  const updatedDoc = {
    ...documents.value[docIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // Update state immediately for UX
  documents.value[docIndex] = updatedDoc

  if (isElectron) {
    try {
      const deadline = updatedDoc.category === '需求' ? (updatedDoc.createdAt ? new Date(updatedDoc.createdAt) : new Date()) : null
      await apiUpdateNote({
        id: updatedDoc.id,
        title: updatedDoc.title,
        content: updatedDoc.content,
        projectId: updatedDoc.project || 'global',
        isArchived: updatedDoc.completed,
        deadline,
      })
      store.lastSavedTime = new Date().toLocaleTimeString()
    } catch (err) {
      console.error('Failed to save document:', err)
    }
  } else {
    store.lastSavedTime = new Date().toLocaleTimeString()
  }
}

// Delete a document
async function deleteDocument(docId: string) {
  if (isElectron) {
    try {
      await apiDeleteNote(docId)
      documents.value = documents.value.filter((d) => d.id !== docId)
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  } else {
    documents.value = documents.value.filter((d) => d.id !== docId)
  }

  if (store.selectedDocumentId === docId) {
    selectDefaultDocument()
  }
}

const filteredDocuments = computed(() => {
  let docs = documents.value

  // Filter by category/completion
  if (store.currentCategory === '已完成') {
    docs = docs.filter((d) => d.completed)
  } else {
    docs = docs.filter((d) => !d.completed && d.category === store.currentCategory)
  }

  // Filter by search query
  if (store.searchQuery.trim()) {
    const query = store.searchQuery.toLowerCase()
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query)
    )
  }

  return docs
})

const selectedDocument = computed(() => {
  return documents.value.find((d) => d.id === store.selectedDocumentId) || null
})

// Watchers for reactive updates on store change
watch(
  () => [store.currentProject, store.currentCategory],
  async () => {
    await loadDocuments()
  }
)

// Initialize
loadDocuments()

// Provide documents and functions
provide('documents', documents)
provide('filteredDocuments', filteredDocuments)
provide('selectedDocument', selectedDocument)
provide('loadDocuments', loadDocuments)
provide('createDocument', createDocument)
provide('saveDocument', saveDocument)
provide('deleteDocument', deleteDocument)
provide('selectDefaultDocument', selectDefaultDocument)
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <!-- Left Sidebar -->
    <Sidebar />

    <!-- Right Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 h-full">
      <!-- Top Header -->
      <Header />

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
        <div class="h-full flex min-w-0 overflow-hidden divide-x divide-slate-200 dark:divide-zinc-800">
          <DocumentList />
          <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10">
            <DocumentEditor v-if="selectedDocument" />
            <EmptyState v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
