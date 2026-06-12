/// <reference types="vite/client" />

import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../../electron/types/project'
import type { NoteDto, CreateNoteDto, UpdateNoteDto } from '../../electron/types/note'

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

declare global {
  interface Window {
    electronAPI: ElectronAPI
    api: {
      project: {
        /** 获取项目列表 */
        list: () => Promise<ProjectDto[]>
        /** 获取项目详情 */
        get: (id: string) => Promise<ProjectDto | null>
        /** 创建项目 */
        create: (dto: CreateProjectDto) => Promise<ProjectDto>
        /** 更新项目 */
        update: (dto: UpdateProjectDto) => Promise<ProjectDto>
        /** 删除项目 */
        delete: (id: string) => Promise<ProjectDto>
      }
      note: {
        /** 获取笔记列表 */
        list: (projectId: string) => Promise<NoteDto[]>
        /** 获取笔记详情 */
        get: (id: string) => Promise<NoteDto | null>
        /** 创建笔记 */
        create: (dto: CreateNoteDto) => Promise<NoteDto>
        /** 更新笔记 */
        update: (dto: UpdateNoteDto) => Promise<NoteDto>
        /** 删除笔记 */
        delete: (id: string) => Promise<NoteDto>
      }
      /** 当前运行平台 */
      platform: string
    }
  }
}
