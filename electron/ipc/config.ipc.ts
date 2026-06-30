import { ipcMain } from 'electron'
import { CONFIG_CHANNELS } from './channels'
import { configService } from '../config/config.service'
import type { AppConfig } from '../config/config.types'

export function registerConfigIpc() {
  ipcMain.handle(CONFIG_CHANNELS.GET, () => {
    return configService.get()
  })

  ipcMain.handle(CONFIG_CHANNELS.UPDATE, (_, partial: Partial<AppConfig>) => {
    try {
      configService.update(partial)
      return configService.get()
    } catch (error) {
      console.error('Config update failed:', error)
      return configService.get() // 返回当前值，不崩溃
    }
  })

  ipcMain.handle(CONFIG_CHANNELS.RESET, () => {
    try {
      configService.reset()
      return configService.get()
    } catch (error) {
      console.error('Config reset failed:', error)
      return configService.get()
    }
  })
}
