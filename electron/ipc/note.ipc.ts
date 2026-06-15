import { ipcMain } from 'electron'
import { noteService } from '../services/note.service'
import { NOTE_CHANNELS } from './channels'
import type { CreateNoteDto, UpdateNoteDto } from '../types/note'

export function registerNoteIpc() {
  // Clear old handlers first to prevent "Attempted to register a second handler"
  ipcMain.removeHandler(NOTE_CHANNELS.LIST)
  ipcMain.removeHandler(NOTE_CHANNELS.GET)
  ipcMain.removeHandler(NOTE_CHANNELS.CREATE)
  ipcMain.removeHandler(NOTE_CHANNELS.UPDATE)
  ipcMain.removeHandler(NOTE_CHANNELS.DELETE)

  // Register list handler
  ipcMain.handle(
    NOTE_CHANNELS.LIST,
    async (_, projectId: string, type?: 'daily' | 'requirement' | 'archived') => {
      try {
        return await noteService.getNotesByProject(projectId, type)
      } catch (error) {
        console.error(`IPC note:list error for project ${projectId}:`, error)
        throw new Error('获取笔记列表失败', { cause: error })
      }
    },
  )

  // Register get handler
  ipcMain.handle(NOTE_CHANNELS.GET, async (_, id: string) => {
    try {
      return await noteService.getNote(id)
    } catch (error) {
      console.error(`IPC note:get error for ID ${id}:`, error)
      throw new Error('获取笔记失败', { cause: error })
    }
  })

  // Register create handler
  ipcMain.handle(NOTE_CHANNELS.CREATE, async (_, dto: CreateNoteDto) => {
    try {
      return await noteService.createNote(dto)
    } catch (error) {
      console.error('IPC note:create error:', error)
      throw new Error('创建笔记失败', { cause: error })
    }
  })

  // Register update handler
  ipcMain.handle(NOTE_CHANNELS.UPDATE, async (_, dto: UpdateNoteDto) => {
    try {
      return await noteService.updateNote(dto)
    } catch (error) {
      console.error(`IPC note:update error for ID ${dto.id}:`, error)
      throw new Error('更新笔记失败', { cause: error })
    }
  })

  // Register delete handler
  ipcMain.handle(NOTE_CHANNELS.DELETE, async (_, id: string) => {
    try {
      return await noteService.deleteNote(id)
    } catch (error) {
      console.error(`IPC note:delete error for ID ${id}:`, error)
      throw new Error('删除笔记失败', { cause: error })
    }
  })
}
