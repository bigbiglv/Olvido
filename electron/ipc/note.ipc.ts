import { ipcMain } from 'electron'
import { noteService } from '../services/note.service'
import { NOTE_CHANNELS } from './channels'
import type { CreateNoteDto, NoteType, UpdateNoteDto } from '../types/note'

/**
 * 注册笔记相关的 IPC（进程间通信）通道处理器
 */
export function registerNoteIpc() {
  // 在注册前先清理旧的处理器，防止由于热重载等原因导致 "Attempted to register a second handler" 报错
  Object.values(NOTE_CHANNELS).forEach((channel) => {
    ipcMain.removeHandler(channel)
  })

  /**
   * 获取指定项目下的笔记列表
   * @param projectId 项目唯一标识
   * @param type 笔记类型过滤：'daily'（普通笔记/每日记录）、'requirement'（需求/截止时间笔记）、'archived'（已归档笔记）
   * @returns 过滤并按排序权重排序后的笔记列表
   */
  ipcMain.handle(NOTE_CHANNELS.LIST, async (_, projectId: string, type?: NoteType) => {
    try {
      return await noteService.getNotesByProject(projectId, type)
    } catch (error) {
      console.error(`IPC note:list error for project ${projectId}:`, error)
      throw new Error('获取笔记列表失败', { cause: error })
    }
  })

  /**
   * 根据 ID 获取单个笔记的详细信息
   * @param id 笔记唯一标识
   * @returns 笔记实体对象，若未找到则返回 null
   */
  ipcMain.handle(NOTE_CHANNELS.GET, async (_, id: string) => {
    try {
      return await noteService.getNote(id)
    } catch (error) {
      console.error(`IPC note:get error for ID ${id}:`, error)
      throw new Error('获取笔记失败', { cause: error })
    }
  })

  /**
   * 创建新笔记
   * @param dto 创建笔记的数据传输对象
   * @returns 成功创建后的笔记实体对象
   */
  ipcMain.handle(NOTE_CHANNELS.CREATE, async (_, dto: CreateNoteDto) => {
    try {
      return await noteService.createNote(dto)
    } catch (error) {
      console.error('IPC note:create error:', error)
      throw new Error('创建笔记失败', { cause: error })
    }
  })

  /**
   * 更新指定笔记信息
   * @param dto 更新笔记的数据传输对象，必须包含待更新笔记的 id
   * @returns 更新后的笔记实体对象
   */
  ipcMain.handle(NOTE_CHANNELS.UPDATE, async (_, dto: UpdateNoteDto) => {
    try {
      return await noteService.updateNote(dto)
    } catch (error) {
      console.error(`IPC note:update error for ID ${dto.id}:`, error)
      throw new Error('更新笔记失败', { cause: error })
    }
  })

  /**
   * 删除指定笔记
   * @param id 待删除笔记的唯一标识
   * @returns 被删除的笔记实体对象
   */
  ipcMain.handle(NOTE_CHANNELS.DELETE, async (_, id: string) => {
    try {
      return await noteService.deleteNote(id)
    } catch (error) {
      console.error(`IPC note:delete error for ID ${id}:`, error)
      throw new Error('删除笔记失败', { cause: error })
    }
  })

  /**
   * 批量删除笔记
   * @param ids 待删除笔记的唯一标识
   * @returns 被删除的笔记实体对象
   */
  ipcMain.handle(NOTE_CHANNELS.BATCH_DELETE, async (_, ids: string[]) => {
    try {
      return await noteService.deleteNotes(ids)
    } catch (error) {
      console.error(`IPC note:delete error for ID ${ids}:`, error)
      throw new Error('删除笔记失败', { cause: error })
    }
  })

  /**
   * 重新排序笔记列表，支持单选与多选拖拽排序更新
   * @param data 排序更新参数
   * @param data.movedIds 被移动的笔记 ID 数组
   * @param data.prevId 排序后目标位置的前一个相邻笔记 ID，置顶时为 null
   * @param data.nextId 排序后目标位置的下一个相邻笔记 ID，置底时为 null
   * @param data.projectId 笔记所属的项目 ID
   * @param data.type 排序更新的笔记类型
   */
  ipcMain.handle(
    NOTE_CHANNELS.REORDER,
    async (
      _,
      data: {
        movedIds: string[]
        prevId: string | null
        nextId: string | null
        projectId: string
        type: 'daily' | 'requirement'
      },
    ) => {
      try {
        return await noteService.reorderNotes(data)
      } catch (error) {
        console.error('IPC note:reorder error:', error)
        throw new Error('重新排序笔记失败', { cause: error })
      }
    },
  )
}
