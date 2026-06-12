import { prisma } from '../prisma/client'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'

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

  async createProject(data: CreateProjectDto) {
    try {
      return await prisma.project.create({
        data: {
          id: data.id,
          name: data.name,
          sort: data.sort ?? 0,
        },
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async updateProject(data: UpdateProjectDto) {
    try {
      return await prisma.project.update({
        where: { id: data.id },
        data: {
          name: data.name,
          sort: data.sort,
        },
      })
    } catch (error) {
      console.error(`Failed to update project ${data.id}:`, error)
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
