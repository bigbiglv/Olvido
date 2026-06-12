import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getDocuments: () => ipcRenderer.invoke('db:get-documents'),
  getDocument: (id: string) => ipcRenderer.invoke('db:get-document', id),
  saveDocument: (document: { id?: string; title: string; content: string }) =>
    ipcRenderer.invoke('db:save-document', document),
  deleteDocument: (id: string) => ipcRenderer.invoke('db:delete-document', id),
  platform: process.platform,
})
