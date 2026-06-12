import { contextBridge, ipcRenderer } from 'electron'
import type { SaveProjectDto } from '../types/project'
import type { SaveNoteDto } from '../types/note'

contextBridge.exposeInMainWorld('api', {
  project: {
    list: () => ipcRenderer.invoke('project:list'),
    get: (id: string) => ipcRenderer.invoke('project:get', id),
    save: (payload: SaveProjectDto) => ipcRenderer.invoke('project:save', payload),
    delete: (id: string) => ipcRenderer.invoke('project:delete', id),
  },
  note: {
    list: (projectId: string) => ipcRenderer.invoke('note:list', projectId),
    get: (id: string) => ipcRenderer.invoke('note:get', id),
    save: (payload: SaveNoteDto) => ipcRenderer.invoke('note:save', payload),
    delete: (id: string) => ipcRenderer.invoke('note:delete', id),
  },
  platform: process.platform,
})
