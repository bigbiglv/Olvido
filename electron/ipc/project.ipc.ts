import { ipcMain } from 'electron'
import { projectService } from '../services/project.service'
import { PROJECT_CHANNELS } from './channels'
import type { CreateProjectDto, UpdateProjectDto } from '../types/project'

export function registerProjectIpc() {
  // Clear old handlers first to prevent "Attempted to register a second handler"
  ipcMain.removeHandler(PROJECT_CHANNELS.LIST)
  ipcMain.removeHandler(PROJECT_CHANNELS.GET)
  ipcMain.removeHandler(PROJECT_CHANNELS.CREATE)
  ipcMain.removeHandler(PROJECT_CHANNELS.UPDATE)
  ipcMain.removeHandler(PROJECT_CHANNELS.DELETE)

  // Register list handler
  ipcMain.handle(PROJECT_CHANNELS.LIST, async () => {
    try {
      return await projectService.getProjects()
    } catch (error) {
      console.error('IPC project:list error:', error)
      throw new Error('获取项目列表失败')
    }
  })

  // Register get handler
  ipcMain.handle(PROJECT_CHANNELS.GET, async (_, id: string) => {
    try {
      return await projectService.getProject(id)
    } catch (error) {
      console.error(`IPC project:get error for ID ${id}:`, error)
      throw new Error('获取项目失败')
    }
  })

  // Register create handler
  ipcMain.handle(PROJECT_CHANNELS.CREATE, async (_, dto: CreateProjectDto) => {
    try {
      return await projectService.createProject(dto)
    } catch (error) {
      console.error('IPC project:create error:', error)
      throw new Error('创建项目失败')
    }
  })

  // Register update handler
  ipcMain.handle(PROJECT_CHANNELS.UPDATE, async (_, dto: UpdateProjectDto) => {
    try {
      return await projectService.updateProject(dto)
    } catch (error) {
      console.error(`IPC project:update error for ID ${dto.id}:`, error)
      throw new Error('更新项目失败')
    }
  })

  // Register delete handler
  ipcMain.handle(PROJECT_CHANNELS.DELETE, async (_, id: string) => {
    try {
      return await projectService.deleteProject(id)
    } catch (error) {
      console.error(`IPC project:delete error for ID ${id}:`, error)
      throw new Error('删除项目失败')
    }
  })
}
