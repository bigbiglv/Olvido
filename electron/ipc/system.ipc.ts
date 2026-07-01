import { app, shell, ipcMain } from 'electron'
import { SYSTEM_CHANNELS } from './channels'

export function registerSystemIpc() {
  ipcMain.removeHandler(SYSTEM_CHANNELS.GET_USER_DATA_DIR)
  ipcMain.removeHandler(SYSTEM_CHANNELS.OPEN_USER_DATA_DIR)

  ipcMain.handle(SYSTEM_CHANNELS.GET_USER_DATA_DIR, () => {
    return app.getPath('userData')
  })

  ipcMain.handle(SYSTEM_CHANNELS.OPEN_USER_DATA_DIR, async () => {
    const userDataPath = app.getPath('userData')
    await shell.openPath(userDataPath)
  })
}
