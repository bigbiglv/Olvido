import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDatabase, getPrisma } from './db'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

function registerIpcHandlers() {
  const prisma = getPrisma()

  // Get all documents
  ipcMain.handle('db:get-documents', async () => {
    try {
      return await prisma.document.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
    } catch (error) {
      console.error('Failed to get documents:', error)
      throw error
    }
  })

  // Get single document by ID
  ipcMain.handle('db:get-document', async (_event, id: string) => {
    try {
      return await prisma.document.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to get document ${id}:`, error)
      throw error
    }
  })

  // Save (create or update) document
  ipcMain.handle('db:save-document', async (_event, doc: { id?: string; title: string; content: string }) => {
    try {
      if (doc.id) {
        return await prisma.document.update({
          where: { id: doc.id },
          data: {
            title: doc.title,
            content: doc.content,
          },
        })
      } else {
        return await prisma.document.create({
          data: {
            title: doc.title,
            content: doc.content,
          },
        })
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      throw error
    }
  })

  // Delete document
  ipcMain.handle('db:delete-document', async (_event, id: string) => {
    try {
      return await prisma.document.delete({
        where: { id },
      })
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error)
      throw error
    }
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

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

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  createWindow()
})
