import { ipcMain } from 'electron'
import { CONFIG_CHANNELS } from './channels'
import { configService } from '../config/config.service'
import type { AppConfig } from '../config/config.types'

export function registerConfigIpc() {
  ipcMain.handle(CONFIG_CHANNELS.GET, () => {
    return configService.get()
  })

  ipcMain.handle(CONFIG_CHANNELS.UPDATE, (_, partial: Partial<AppConfig>) => {
    configService.update(partial)
    return configService.get()
  })

  ipcMain.handle(CONFIG_CHANNELS.RESET, () => {
    configService.reset()
    return configService.get()
  })
}
