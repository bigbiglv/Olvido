/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'test' | 'production'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_MOCK?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface DocumentItem {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface ElectronAPI {
  getDocuments: () => Promise<DocumentItem[]>
  getDocument: (id: string) => Promise<DocumentItem | null>
  saveDocument: (document: { id?: string; title: string; content: string }) => Promise<DocumentItem>
  deleteDocument: (id: string) => Promise<DocumentItem>
  platform: string
}

interface Window {
  electronAPI: ElectronAPI
}

