import { ipcMain } from 'electron'
import { projectService } from '../services/project.service'
import { PROJECT_CHANNELS } from './channels'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'

/**
 * 注册项目相关的 IPC（进程间通信）通道处理器
 */
export function registerProjectIpc() {
  // 在注册前先清理旧的处理器，防止由于热重载等原因导致 "Attempted to register a second handler" 报错
  Object.values(PROJECT_CHANNELS).forEach((channel) => {
    ipcMain.removeHandler(channel)
  })

  /**
   * 获取所有项目列表
   * @returns 项目实体数据列表
   */
  ipcMain.handle(PROJECT_CHANNELS.LIST, async () => {
    try {
      return await projectService.getProjects()
    } catch (error) {
      console.error('IPC project:list error:', error)
      throw new Error('获取项目列表失败', { cause: error })
    }
  })

  /**
   * 根据 ID 获取单个项目的详细信息
   * @param id 项目唯一标识
   * @returns 项目实体数据，若未找到则返回 null
   */
  ipcMain.handle(PROJECT_CHANNELS.GET, async (_, id: string) => {
    try {
      return await projectService.getProject(id)
    } catch (error) {
      console.error(`IPC project:get error for ID ${id}:`, error)
      throw new Error('获取项目失败', { cause: error })
    }
  })

  /**
   * 创建新项目
   * @param dto 创建项目的数据传输对象
   * @returns 成功创建后的项目实体对象
   */
  ipcMain.handle(PROJECT_CHANNELS.CREATE, async (_, dto: CreateProjectDto) => {
    try {
      return await projectService.createProject(dto)
    } catch (error) {
      console.error('IPC project:create error:', error)
      throw new Error('创建项目失败', { cause: error })
    }
  })

  /**
   * 更新项目信息
   * @param dto 更新项目的数据传输对象，必须包含待更新项目的 id
   * @returns 更新后的项目实体对象
   */
  ipcMain.handle(PROJECT_CHANNELS.UPDATE, async (_, dto: UpdateProjectDto) => {
    try {
      return await projectService.updateProject(dto)
    } catch (error) {
      console.error(`IPC project:update error for ID ${dto.id}:`, error)
      throw new Error('更新项目失败', { cause: error })
    }
  })

  /**
   * 删除指定项目，关联的笔记将会级联删除
   * @param id 待删除项目的唯一标识
   * @returns 被删除的项目实体对象
   */
  ipcMain.handle(PROJECT_CHANNELS.DELETE, async (_, id: string) => {
    try {
      return await projectService.deleteProject(id)
    } catch (error) {
      console.error(`IPC project:delete error for ID ${id}:`, error)
      throw new Error('删除项目失败', { cause: error })
    }
  })

  ipcMain.handle(PROJECT_CHANNELS.BATCH_DELETE, async (_, ids: string[]) => {
    try {
      return await projectService.deleteProjects(ids)
    } catch (error) {
      console.error(`IPC project:delete error for ID ${ids}:`, error)
      throw new Error('删除项目失败', { cause: error })
    }
  })

  /**
   * 重新排序项目列表，支持单选与多选拖拽排序更新
   * @param data 排序更新参数
   * @param data.movedIds 被移动的项目 ID 数组
   * @param data.prevId 排序后目标位置的前一个相邻项目 ID，置顶时为 null
   * @param data.nextId 排序后目标位置的下一个相邻项目 ID，置底时为 null
   */
  ipcMain.handle(
    PROJECT_CHANNELS.REORDER,
    async (_, data: { movedIds: string[]; prevId: string | null; nextId: string | null }) => {
      try {
        return await projectService.reorderProjects(data)
      } catch (error) {
        console.error('IPC project:reorder error:', error)
        throw new Error('重新排序项目失败', { cause: error })
      }
    },
  )
}
