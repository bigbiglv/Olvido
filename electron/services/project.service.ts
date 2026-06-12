import { prisma } from '../prisma/client'
import type { SaveProjectDto } from '../types/project'

export class ProjectService {
  async getProjects() {
    try {
      return await prisma.project.findMany({
        orderBy: { sort: 'asc' },
      })
    } catch (error) {
      console.error('Failed to get projects:', error)
      throw error
    }
  }

  async getProject(id: string) {
    try {
      return await prisma.project.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to get project ${id}:`, error)
      throw error
    }
  }

  async saveProject(data: SaveProjectDto) {
    try {
      return await prisma.project.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          sort: data.sort,
        },
        create: {
          id: data.id,
          name: data.name,
          sort: data.sort ?? 0,
        },
      })
    } catch (error) {
      console.error('Failed to save project:', error)
      throw error
    }
  }

  async deleteProject(id: string) {
    // Prevent deleting global project
    if (id === 'global') {
      throw new Error('Cannot delete global project')
    }
    try {
      return await prisma.project.delete({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error)
      throw error
    }
  }
}

export const projectService = new ProjectService()
