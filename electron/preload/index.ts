import { contextBridge, ipcRenderer } from 'electron'
import { PROJECT_CHANNELS, NOTE_CHANNELS, CONFIG_CHANNELS } from '../ipc/channels'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'
import type { CreateNoteDto, NoteType, UpdateNoteDto } from '../types/note'
import type { SearchRequest } from '../types/search'
import type { AppConfig } from '../config/config.types'

contextBridge.exposeInMainWorld('api', {
  project: {
    list: () => ipcRenderer.invoke(PROJECT_CHANNELS.LIST),
    get: (id: string) => ipcRenderer.invoke(PROJECT_CHANNELS.GET, id),
    create: (dto: CreateProjectDto) => ipcRenderer.invoke(PROJECT_CHANNELS.CREATE, dto),
    update: (dto: UpdateProjectDto) => ipcRenderer.invoke(PROJECT_CHANNELS.UPDATE, dto),
    delete: (id: string) => ipcRenderer.invoke(PROJECT_CHANNELS.DELETE, id),
    batchDelete: (ids: string[]) => ipcRenderer.invoke(PROJECT_CHANNELS.BATCH_DELETE, ids),
    reorder: (data: { movedIds: string[]; prevId: string | null; nextId: string | null }) =>
      ipcRenderer.invoke(PROJECT_CHANNELS.REORDER, data),
  },
  note: {
    list: (projectId: string, type?: NoteType) =>
      ipcRenderer.invoke(NOTE_CHANNELS.LIST, projectId, type),
    get: (id: string) => ipcRenderer.invoke(NOTE_CHANNELS.GET, id),
    create: (dto: CreateNoteDto) => ipcRenderer.invoke(NOTE_CHANNELS.CREATE, dto),
    update: (dto: UpdateNoteDto) => ipcRenderer.invoke(NOTE_CHANNELS.UPDATE, dto),
    delete: (id: string) => ipcRenderer.invoke(NOTE_CHANNELS.DELETE, id),
    batchDelete: (ids: string[]) => ipcRenderer.invoke(NOTE_CHANNELS.BATCH_DELETE, ids),
    reorder: (data: {
      movedIds: string[]
      prevId: string | null
      nextId: string | null
      projectId: string
      type: 'daily' | 'requirement'
    }) => ipcRenderer.invoke(NOTE_CHANNELS.REORDER, data),
  },
  search: {
    list: (request: SearchRequest) => ipcRenderer.invoke('search:list', request),
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    cancel: () => ipcRenderer.invoke('updater:cancel'),
    onUpdateAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('updater:update-available', (_, info) => callback(info))
    },
    onUpdateNotAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('updater:update-not-available', (_, info) => callback(info))
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('updater:download-progress', (_, progress) => callback(progress))
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      ipcRenderer.on('updater:update-downloaded', (_, info) => callback(info))
    },
    onError: (callback: (err: string) => void) => {
      ipcRenderer.on('updater:error', (_, err) => callback(err))
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('updater:update-available')
      ipcRenderer.removeAllListeners('updater:update-not-available')
      ipcRenderer.removeAllListeners('updater:download-progress')
      ipcRenderer.removeAllListeners('updater:update-downloaded')
      ipcRenderer.removeAllListeners('updater:error')
    }
  },
  config: {
    get: () => ipcRenderer.invoke(CONFIG_CHANNELS.GET),
    update: (partial: Partial<AppConfig>) => ipcRenderer.invoke(CONFIG_CHANNELS.UPDATE, partial),
    reset: () => ipcRenderer.invoke(CONFIG_CHANNELS.RESET),
  },
  platform: process.platform,
})
