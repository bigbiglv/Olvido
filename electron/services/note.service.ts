import { prisma } from '../prisma/client'
import type { SaveNoteDto } from '../types/note'

export class NoteService {
  async getNotesByProject(projectId: string) {
    try {
      return await prisma.note.findMany({
        where: { projectId },
        orderBy: [
          { sort: 'asc' },
          { updatedAt: 'desc' }
        ]
      })
    } catch (error) {
      console.error(`Failed to get notes for project ${projectId}:`, error)
      throw error
    }
  }

  async getNote(id: string) {
    try {
      return await prisma.note.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to get note ${id}:`, error)
      throw error
    }
  }

  async saveNote(data: SaveNoteDto) {
    try {
      if (data.id) {
        return await prisma.note.update({
          where: { id: data.id },
          data: {
            title: data.title,
            content: data.content,
            deadline: data.deadline,
            isArchived: data.isArchived,
            sort: data.sort,
            projectId: data.projectId,
          },
        })
      } else {
        return await prisma.note.create({
          data: {
            title: data.title,
            content: data.content,
            deadline: data.deadline,
            isArchived: data.isArchived ?? false,
            sort: data.sort ?? 0,
            projectId: data.projectId,
          },
        })
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      throw error
    }
  }

  async deleteNote(id: string) {
    try {
      return await prisma.note.delete({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error)
      throw error
    }
  }
}

export const noteService = new NoteService()
