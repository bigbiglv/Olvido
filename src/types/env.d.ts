/// <reference types="vite/client" />
declare global {
  const __APP_VERSION__: string
}

import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../../electron/types/project'
import type { NoteDto, CreateNoteDto, UpdateNoteDto, NoteType } from '../../electron/types/note'
import type { SearchRequest, SearchResult } from '../features/search/types/search'

declare global {
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
    deadline?: string | Date | null
    sortOrder?: number
  }

  interface ElectronAPI {
    getDocuments: () => Promise<DocumentItem[]>
    getDocument: (id: string) => Promise<DocumentItem | null>
    saveDocument: (document: {
      id?: string
      title: string
      content: string
      category?: string
      project?: string | null
      completed?: boolean
    }) => Promise<DocumentItem>
    deleteDocument: (id: string) => Promise<DocumentItem>
    platform: string
  }

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
        batchDelete: (ids: string[]) => Promise<ProjectDto>
        /** 重新排序项目 */
        reorder: (data: {
          movedIds: string[]
          prevId: string | null
          nextId: string | null
        }) => Promise<void>
      }
      note: {
        /** 获取笔记列表 */
        list: (projectId: string, type?: NoteType) => Promise<NoteDto[]>
        /** 获取笔记详情 */
        get: (id: string) => Promise<NoteDto | null>
        /** 创建笔记 */
        create: (dto: CreateNoteDto) => Promise<NoteDto>
        /** 更新笔记 */
        update: (dto: UpdateNoteDto) => Promise<NoteDto>
        /** 删除笔记 */
        delete: (id: string) => Promise<NoteDto>
        batchDelete: (ids: string[]) => Promise<NoteDto>
        /** 重新排序笔记 */
        reorder: (data: {
          movedIds: string[]
          prevId: string | null
          nextId: string | null
          projectId: string
          type: 'daily' | 'requirement'
        }) => Promise<void>
      }
      search: {
        /** 全文搜索列表 */
        list: (request: SearchRequest) => Promise<SearchResult>
      }
      updater: {
        check: () => Promise<any>
        download: () => Promise<any>
        install: () => void
        cancel: () => Promise<void>
        onUpdateAvailable: (callback: (info: any) => void) => void
        onUpdateNotAvailable: (callback: (info: any) => void) => void
        onDownloadProgress: (callback: (progress: any) => void) => void
        onUpdateDownloaded: (callback: (info: any) => void) => void
        onError: (callback: (err: string) => void) => void
        removeAllListeners: () => void
      }
      /** 当前运行平台 */
      platform: string
    }
  }
}
