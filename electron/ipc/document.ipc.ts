import { ipcMain } from 'electron'
import { documentService } from '../services/document.service'
import type { SaveDocumentDto } from '../types/document'

export function registerDocumentIpc() {
  ipcMain.handle('db:get-documents', async () => {
    return documentService.getDocuments()
  })

  ipcMain.handle('db:get-document', async (_, id: string) => {
    return documentService.getDocument(id)
  })

  ipcMain.handle('db:save-document', async (_, doc: SaveDocumentDto) => {
    return documentService.saveDocument(doc)
  })

  ipcMain.handle('db:delete-document', async (_, id: string) => {
    return documentService.deleteDocument(id)
  })
}
