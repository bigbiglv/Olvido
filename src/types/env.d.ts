/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'test' | 'production'
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface DocumentItem {
  id: string
  title: string
  content: string
  category: string
  project: string | null
  completed: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

interface ElectronAPI {
  getDocuments: () => Promise<DocumentItem[]>
  getDocument: (id: string) => Promise<DocumentItem | null>
  saveDocument: (document: { id?: string; title: string; content: string; category?: string; project?: string | null; completed?: boolean }) => Promise<DocumentItem>
  deleteDocument: (id: string) => Promise<DocumentItem>
  platform: string
}

interface Window {
  electronAPI: ElectronAPI
}

