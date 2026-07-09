import { prisma } from '../prisma/client'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'

export class ProjectService {
  async getProjects() {
    try {
      return await prisma.project.findMany({
        orderBy: { sortOrder: 'asc' },
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
      const firstProject = await prisma.project.findFirst({
        orderBy: { sortOrder: 'asc' },
      })
      const sortOrder = firstProject ? firstProject.sortOrder - 1000 : 0

      return await prisma.project.create({
        data: {
          id: data.id,
          name: data.name,
          sortOrder,
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
          sortOrder: data.sortOrder,
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

  async deleteProjects(ids: string[]) {
    if (ids.includes('global')) {
      throw new Error('Cannot delete global project')
    }
    try {
      return await prisma.project.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })
    } catch (error) {
      console.error(`Failed to delete project ${ids}:`, error)
      throw error
    }
  }

  async reorderProjects(data: {
    movedIds: string[]
    prevId: string | null
    nextId: string | null
  }) {
    const { movedIds, prevId, nextId } = data
    const movedCount = movedIds.length
    if (movedCount === 0) return

    try {
      const prevItem = prevId ? await prisma.project.findUnique({ where: { id: prevId } }) : null
      const nextItem = nextId ? await prisma.project.findUnique({ where: { id: nextId } }) : null

      const prevSort = prevItem ? prevItem.sortOrder : 0
      const nextSort = nextItem ? nextItem.sortOrder : 0

      // 情况 1: 拖拽到顶部
      if (!prevItem && nextItem) {
        const baseSort = nextSort - movedCount * 1000
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.project.update({
              where: { id },
              data: { sortOrder: baseSort + index * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 2: 拖拽到底部
      if (prevItem && !nextItem) {
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.project.update({
              where: { id },
              data: { sortOrder: prevSort + (index + 1) * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 3: 列表为空
      if (!prevItem && !nextItem) {
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.project.update({
              where: { id },
              data: { sortOrder: (index + 1) * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 4: 拖拽到中间，检测插入空间
      const gap = nextSort - prevSort
      if (gap <= movedCount) {
        const allProjects = await prisma.project.findMany({
          orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        })

        const remainingProjects = allProjects.filter((p) => !movedIds.includes(p.id))
        const prevIndex = remainingProjects.findIndex((p) => p.id === prevId)

        const reordered: typeof allProjects = []
        remainingProjects.forEach((p, index) => {
          reordered.push(p)
          if (index === prevIndex) {
            movedIds.forEach((id) => {
              const movedProj = allProjects.find((x) => x.id === id)
              if (movedProj) reordered.push(movedProj)
            })
          }
        })

        await prisma.$transaction(
          reordered.map((p, index) =>
            prisma.project.update({
              where: { id: p.id },
              data: { sortOrder: (index + 1) * 1000 },
            }),
          ),
        )
      } else {
        const step = Math.floor(gap / (movedCount + 1))
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.project.update({
              where: { id },
              data: { sortOrder: prevSort + step * (index + 1) },
            }),
          ),
        )
      }
    } catch (error) {
      console.error('Failed to reorder projects:', error)
      throw error
    }
  }
}

export const projectService = new ProjectService()
