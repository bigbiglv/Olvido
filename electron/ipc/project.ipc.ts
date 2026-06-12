import { ipcMain } from 'electron'
import { projectService } from '../services/project.service'
import type { SaveProjectDto } from '../types/project'

export function registerProjectIpc() {
  ipcMain.handle('project:list', async () => {
    return projectService.getProjects()
  })

  ipcMain.handle('project:get', async (_, id: string) => {
    return projectService.getProject(id)
  })

  ipcMain.handle('project:save', async (_, project: SaveProjectDto) => {
    return projectService.saveProject(project)
  })

  ipcMain.handle('project:delete', async (_, id: string) => {
    return projectService.deleteProject(id)
  })
}
