import { prisma } from '../prisma/client'
import type { SaveDocumentDto } from '../types/document'

export class DocumentService {
  async getDocuments() {
    try {
      return await prisma.document.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
    } catch (error) {
      console.error('Failed to get documents:', error)
      throw error
    }
  }

  async getDocument(id: string) {
    try {
      return await prisma.document.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to get document ${id}:`, error)
      throw error
    }
  }

  async saveDocument(doc: SaveDocumentDto) {
    try {
      if (doc.id) {
        return await prisma.document.update({
          where: { id: doc.id },
          data: {
            title: doc.title,
            content: doc.content,
            category: doc.category,
            project: doc.project,
            completed: doc.completed,
          },
        })
      } else {
        return await prisma.document.create({
          data: {
            title: doc.title,
            content: doc.content,
            category: doc.category || '日常',
            project: doc.project || null,
            completed: doc.completed || false,
          },
        })
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      throw error
    }
  }

  async deleteDocument(id: string) {
    try {
      return await prisma.document.delete({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error)
      throw error
    }
  }
}

export const documentService = new DocumentService()
