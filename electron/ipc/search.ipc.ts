import { ipcMain } from 'electron'
import { searchService } from '../services/search.service'
import type { SearchRequest } from '../types/search'

export function registerSearchIpc() {
  // Clear old handler to prevent duplicate register warnings
  ipcMain.removeHandler('search:list')

  // Register search:list handler
  ipcMain.handle('search:list', async (_, request: SearchRequest) => {
    try {
      return await searchService.query(request)
    } catch (error) {
      console.error('IPC search:list error:', error)
      throw new Error('搜索失败', { cause: error })
    }
  })
}
