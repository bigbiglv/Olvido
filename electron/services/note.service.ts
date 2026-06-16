import { prisma } from '../prisma/client'
import { Prisma } from '@prisma/client'
import type { CreateNoteDto, UpdateNoteDto } from '../types/note'

export class NoteService {
  async getNotesByProject(projectId: string, type?: 'daily' | 'requirement' | 'archived') {
    try {
      const where: Prisma.NoteWhereInput = { projectId }
      if (type === 'daily') {
        where.deadline = null
        where.isArchived = false
      } else if (type === 'requirement') {
        where.deadline = { not: null }
        where.isArchived = false
      } else if (type === 'archived') {
        where.isArchived = true
      }
      return await prisma.note.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
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

  async createNote(data: CreateNoteDto) {
    try {
      // 1. 根据当前项目与分类类型，过滤查询当前最大排序值
      const where: Prisma.NoteWhereInput = {
        projectId: data.projectId,
        isArchived: data.isArchived ?? false,
      }
      if (data.deadline) {
        where.deadline = { not: null }
      } else {
        where.deadline = null
      }

      const lastNote = await prisma.note.findFirst({
        where,
        orderBy: { sortOrder: 'desc' },
      })

      // 2. 生成以 1000 为步长的全新间隔排序值
      const sortOrder = (lastNote?.sortOrder ?? 0) + 1000

      return await prisma.note.create({
        data: {
          title: data.title,
          content: data.content,
          deadline: data.deadline,
          isArchived: data.isArchived ?? false,
          sortOrder,
          projectId: data.projectId,
        },
      })
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }

  async updateNote(data: UpdateNoteDto) {
    try {
      return await prisma.note.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
          deadline: data.deadline,
          isArchived: data.isArchived,
          sortOrder: data.sortOrder,
          projectId: data.projectId,
        },
      })
    } catch (error) {
      console.error(`Failed to update note ${data.id}:`, error)
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

  /**
   * 核心排序处理：单选/多选排序更新、区间计算、空间耗尽检测与原子事务
   */
  async reorderNotes(data: {
    movedIds: string[]
    prevId: string | null
    nextId: string | null
    projectId: string
    type: 'daily' | 'requirement'
  }) {
    const { movedIds, prevId, nextId, projectId, type } = data
    const movedCount = movedIds.length
    if (movedCount === 0) return

    try {
      const prevItem = prevId ? await prisma.note.findUnique({ where: { id: prevId } }) : null
      const nextItem = nextId ? await prisma.note.findUnique({ where: { id: nextId } }) : null

      const prevSort = prevItem ? prevItem.sortOrder : 0
      const nextSort = nextItem ? nextItem.sortOrder : 0

      // 情况 1: 拖拽到最顶部 (prevId = null)
      if (!prevItem && nextItem) {
        const baseSort = nextSort - movedCount * 1000
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.note.update({
              where: { id },
              data: { sortOrder: baseSort + index * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 2: 拖拽到最底部 (nextId = null)
      if (prevItem && !nextItem) {
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.note.update({
              where: { id },
              data: { sortOrder: prevSort + (index + 1) * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 3: 没有任何相邻项（原列表为空或单项等异常边界，做常规降级初始化）
      if (!prevItem && !nextItem) {
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.note.update({
              where: { id },
              data: { sortOrder: (index + 1) * 1000 },
            }),
          ),
        )
        return
      }

      // 情况 4: 拖拽到中间，检测插入空间是否已耗尽 (gap <= movedCount)
      const gap = nextSort - prevSort
      if (gap <= movedCount) {
        console.log(
          `Sort gap exhausted (${gap} <= ${movedCount}) between ${prevSort} and ${nextSort}. Rebalancing...`,
        )

        // 1. 获取该项目和分类下的所有文档（按 sortOrder 排好序）
        const where: Prisma.NoteWhereInput = {
          projectId,
          isArchived: false,
        }
        if (type === 'requirement') {
          where.deadline = { not: null }
        } else {
          where.deadline = null
        }

        const allNotes = await prisma.note.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        })

        // 2. 剔除移走的文档得到剩余文档序列
        const remainingNotes = allNotes.filter((note) => !movedIds.includes(note.id))

        // 3. 在剩余的文档中，寻找 prevItem 的位置
        const prevIndex = remainingNotes.findIndex((note) => note.id === prevId)

        // 4. 重建列表新顺序
        const reordered: typeof allNotes = []
        remainingNotes.forEach((note, index) => {
          reordered.push(note)
          if (index === prevIndex) {
            // 插入被拖动的多选文档
            movedIds.forEach((id) => {
              const movedNote = allNotes.find((n) => n.id === id)
              if (movedNote) reordered.push(movedNote)
            })
          }
        })

        // 5. 在同一个 Prisma 事务中对所有相关文档重设 sortOrder 序号为以 1000 为步长的序列
        await prisma.$transaction(
          reordered.map((note, index) =>
            prisma.note.update({
              where: { id: note.id },
              data: { sortOrder: (index + 1) * 1000 },
            }),
          ),
        )
        console.log('Rebalance completed.')
      } else {
        // 空间充足，在区间内等距分配，只更新移动项
        const step = Math.floor(gap / (movedCount + 1))
        await prisma.$transaction(
          movedIds.map((id, index) =>
            prisma.note.update({
              where: { id },
              data: { sortOrder: prevSort + step * (index + 1) },
            }),
          ),
        )
      }
    } catch (error) {
      console.error('Failed to reorder notes:', error)
      throw error
    }
  }
}

export const noteService = new NoteService()
