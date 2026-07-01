import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDatabase, ensureGlobalProject, initFts } from '../prisma/client'
import { registerProjectIpc } from '../ipc/project.ipc'
import { registerNoteIpc } from '../ipc/note.ipc'
import { registerSearchIpc } from '../ipc/search.ipc'
import { registerConfigIpc } from '../ipc/config.ipc'
import { configService } from '../config/config.service'
import { registerSystemIpc } from '../ipc/system.ipc'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  // 移除默认菜单栏
  Menu.setApplicationMenu(null)

  const config = configService.get()
  const { width, height, x, y, maximized } = config.windowBounds

  win = new BrowserWindow({
    width,
    height,
    x,
    y,
    icon: path.join(process.env.VITE_PUBLIC || '', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'index.mjs'),
    },
  })

  if (maximized) {
    win.maximize()
  }

  // 监听窗口改变大小和位置，保存到配置
  const saveBounds = () => {
    if (!win) return
    const isMaximized = win.isMaximized()
    const bounds = win.getBounds()
    
    configService.update({
      windowBounds: {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        maximized: isMaximized
      }
    })
  }

  win.on('resized', saveBounds)
  win.on('moved', saveBounds)
  win.on('maximize', saveBounds)
  win.on('unmaximize', saveBounds)

  // 针对 Windows/Linux 移除窗口菜单
  win.removeMenu()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

import { registerUpdaterIpc } from '../ipc/updater.ipc'

app.whenReady().then(async () => {
  // 1. 初始化 ConfigService，读取配置
  configService.load()

  // 2. 初始化数据库和项目
  initDatabase()
  await ensureGlobalProject()
  await initFts()

  // 3. 注册所有的 IPC
  registerConfigIpc()
  registerProjectIpc()
  registerNoteIpc()
  registerSearchIpc()
  registerSystemIpc()

  // 4. 创建窗口
  createWindow()
  
  if (win) {
    registerUpdaterIpc(win)
  }
})
