import type { NoteDto } from '../../electron/types/note'

/**
 * 将 Electron 端的 NoteDto 转换为前端的 DocumentItem
 * @param note 数据库/Electron 传输的笔记数据
 * @returns 统一的前端文档结构
 */
export function mapNoteToDocument(note: NoteDto): DocumentItem {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.deadline ? '需求' : '日常',
    project: note.projectId === 'global' ? null : note.projectId,
    completed: note.isArchived,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    deadline: note.deadline,
  }
}
