import { ipcMain } from 'electron'
import { noteService } from '../services/note.service'
import type { SaveNoteDto } from '../types/note'

export function registerNoteIpc() {
  ipcMain.handle('note:list', async (_, projectId: string) => {
    return noteService.getNotesByProject(projectId)
  })

  ipcMain.handle('note:get', async (_, id: string) => {
    return noteService.getNote(id)
  })

  ipcMain.handle('note:save', async (_, note: SaveNoteDto) => {
    return noteService.saveNote(note)
  })

  ipcMain.handle('note:delete', async (_, id: string) => {
    return noteService.deleteNote(id)
  })
}
