import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'

// Global singleton instance
export let prisma: PrismaClient

export function initDatabase() {
  const isDev = !app.isPackaged
  let dbPath: string

  if (isDev) {
    // 开发环境下直接使用项目根目录下的 prisma/dev.db，避免空库且方便开发查看
    dbPath = path.join(app.getAppPath(), 'prisma', 'dev.db')
  } else {
    const dbDir = app.getPath('userData')
    dbPath = path.join(dbDir, 'database.db')

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Handle production database template provisioning
    if (!fs.existsSync(dbPath)) {
      const templatePath = path.join(process.resourcesPath, 'database.db')
      if (fs.existsSync(templatePath)) {
        try {
          fs.copyFileSync(templatePath, dbPath)
          console.log('Provisioned database from template:', templatePath)
        } catch (err) {
          console.error('Failed to copy database template:', err)
        }
      } else {
        console.warn('Production database template not found at:', templatePath)
      }
    }
  }

  console.log('SQLite Database Path:', dbPath)

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  })

  return prisma
}

export function getPrisma() {
  if (!prisma) {
    return initDatabase()
  }
  return prisma
}

export async function ensureGlobalProject() {
  if (!prisma) return

  try {
    const globalProject = await prisma.project.findUnique({
      where: { id: 'global' },
    })

    if (!globalProject) {
      await prisma.project.create({
        data: {
          id: 'global',
          name: '全局',
        },
      })
      console.log('Created default global project.')
    }
  } catch (error) {
    console.error('Failed to ensure global project:', error)
  }
}
