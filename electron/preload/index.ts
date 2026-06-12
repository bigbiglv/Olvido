import { contextBridge, ipcRenderer } from 'electron'
import { PROJECT_CHANNELS, NOTE_CHANNELS } from '../ipc/channels'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'
import type { CreateNoteDto, UpdateNoteDto } from '../types/note'

contextBridge.exposeInMainWorld('api', {
  project: {
    list: () => ipcRenderer.invoke(PROJECT_CHANNELS.LIST),
    get: (id: string) => ipcRenderer.invoke(PROJECT_CHANNELS.GET, id),
    create: (dto: CreateProjectDto) => ipcRenderer.invoke(PROJECT_CHANNELS.CREATE, dto),
    update: (dto: UpdateProjectDto) => ipcRenderer.invoke(PROJECT_CHANNELS.UPDATE, dto),
    delete: (id: string) => ipcRenderer.invoke(PROJECT_CHANNELS.DELETE, id),
  },
  note: {
    list: (projectId: string) => ipcRenderer.invoke(NOTE_CHANNELS.LIST, projectId),
    get: (id: string) => ipcRenderer.invoke(NOTE_CHANNELS.GET, id),
    create: (dto: CreateNoteDto) => ipcRenderer.invoke(NOTE_CHANNELS.CREATE, dto),
    update: (dto: UpdateNoteDto) => ipcRenderer.invoke(NOTE_CHANNELS.UPDATE, dto),
    delete: (id: string) => ipcRenderer.invoke(NOTE_CHANNELS.DELETE, id),
  },
  platform: process.platform,
})
