import { ipcMain } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { UPDATER_CHANNELS } from './channels'

export function registerUpdaterIpc(win: Electron.BrowserWindow) {
  // Config autoUpdater
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // Relay events to renderer
  autoUpdater.on('update-available', (info) => {
    win.webContents.send(UPDATER_CHANNELS.ON_UPDATE_AVAILABLE, info)
  })

  autoUpdater.on('update-not-available', (info) => {
    win.webContents.send(UPDATER_CHANNELS.ON_UPDATE_NOT_AVAILABLE, info)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send(UPDATER_CHANNELS.ON_DOWNLOAD_PROGRESS, progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send(UPDATER_CHANNELS.ON_UPDATE_DOWNLOADED, info)
  })

  autoUpdater.on('error', (err) => {
    win.webContents.send(UPDATER_CHANNELS.ON_ERROR, err?.message || 'Update error')
  })

  // Remove existing handlers in case of reload
  ipcMain.removeHandler(UPDATER_CHANNELS.CHECK)
  ipcMain.removeHandler(UPDATER_CHANNELS.DOWNLOAD)
  ipcMain.removeHandler(UPDATER_CHANNELS.INSTALL)

  ipcMain.removeHandler('updater:cancel')

  let cancellationToken: any = null

  // Handlers
  ipcMain.handle(UPDATER_CHANNELS.CHECK, async () => {
    try {
      await autoUpdater.checkForUpdates()
    } catch (e: any) {
      win.webContents.send(UPDATER_CHANNELS.ON_ERROR, e?.message || 'Check for updates failed')
    }
  })

  ipcMain.handle(UPDATER_CHANNELS.DOWNLOAD, async () => {
    try {
      // electron-updater provides a CancellationToken we can mock or use directly.
      // A simpler way is to require 'builder-util-runtime' but if it's not installed, we can just use autoUpdater.downloadUpdate()
      // Wait, we can just call downloadUpdate and there's no native cancel without CancellationToken. 
      // I'll import it dynamically or just ignore cancel for the backend and only hide UI. 
      // Actually, let's just do a simple cancel by throwing error if we have a token.
      // @ts-ignore
      const { CancellationToken } = await import('builder-util-runtime')
      cancellationToken = new CancellationToken()
      await autoUpdater.downloadUpdate(cancellationToken)
    } catch (e: any) {
      if (!e?.message?.includes('cancelled')) {
        win.webContents.send(UPDATER_CHANNELS.ON_ERROR, e?.message || 'Download update failed')
      }
    }
  })

  ipcMain.handle('updater:cancel', () => {
    if (cancellationToken) {
      cancellationToken.cancel()
      cancellationToken = null
    }
  })

  ipcMain.handle(UPDATER_CHANNELS.INSTALL, () => {
    autoUpdater.quitAndInstall()
  })
}
