import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function initDatabase() {
  const isDev = !app.isPackaged
  const dbDir = app.getPath('userData')
  const dbPath = path.join(dbDir, 'database.db')

  console.log('SQLite Database Path:', dbPath)

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  // Handle production database template provisioning
  if (!fs.existsSync(dbPath) && !isDev) {
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
