import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import type { PrismaClient as PrismaClientType } from '@prisma/client'

// @prisma/client 是 CJS 模块，在 ESM 环境中需通过 createRequire 加载
const { PrismaClient } = createRequire(import.meta.url)('@prisma/client') as typeof import('@prisma/client')

// Global singleton instance
export let prisma: PrismaClientType

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

export async function initFts() {
  if (!prisma) return

  try {
    // 强制迁移：删除旧的虚拟表与触发器，以便重建时使用全新的单字（Unigram）空格分词策略
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS notes_ai;`)
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS notes_ad;`)
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS notes_au;`)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS notes_fts;`)

    // 1. 创建 FTS5 虚拟表，添加 projectId 并标明 id, projectId 不进行全文索引。使用默认分词器即可。
    await prisma.$executeRawUnsafe(`
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        id UNINDEXED,
        projectId UNINDEXED,
        title,
        content
      );
    `)

    // 2. 创建触发器，在插入和修改时利用 SQLite 递归 CTE 将字符串按字符用空格拆分（Unigram 化），保证中文任意长度的子串精确匹配
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON Note BEGIN
        INSERT INTO notes_fts(id, projectId, title, content)
        VALUES (
          new.id,
          new.projectId,
          (
            WITH RECURSIVE split(char, rest) AS (
              VALUES('', new.title)
              UNION ALL
              SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
            )
            SELECT group_concat(char, ' ') FROM split WHERE char <> ''
          ),
          (
            WITH RECURSIVE split(char, rest) AS (
              VALUES('', new.content)
              UNION ALL
              SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
            )
            SELECT group_concat(char, ' ') FROM split WHERE char <> ''
          )
        );
      END;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON Note BEGIN
        DELETE FROM notes_fts WHERE id = old.id;
      END;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON Note BEGIN
        UPDATE notes_fts SET
          projectId = new.projectId,
          title = (
            WITH RECURSIVE split(char, rest) AS (
              VALUES('', new.title)
              UNION ALL
              SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
            )
            SELECT group_concat(char, ' ') FROM split WHERE char <> ''
          ),
          content = (
            WITH RECURSIVE split(char, rest) AS (
              VALUES('', new.content)
              UNION ALL
              SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
            )
            SELECT group_concat(char, ' ') FROM split WHERE char <> ''
          )
        WHERE id = new.id;
      END;
    `)

    // 3. 将已存在的数据同步到虚拟表，同样使用递归 CTE 拆分
    await prisma.$executeRawUnsafe(`
      INSERT INTO notes_fts(id, projectId, title, content)
      SELECT 
        id, 
        projectId, 
        (
          WITH RECURSIVE split(char, rest) AS (
            VALUES('', title)
            UNION ALL
            SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
          )
          SELECT group_concat(char, ' ') FROM split WHERE char <> ''
        ),
        (
          WITH RECURSIVE split(char, rest) AS (
            VALUES('', content)
            UNION ALL
            SELECT substr(rest, 1, 1), substr(rest, 2) FROM split WHERE rest <> ''
          )
          SELECT group_concat(char, ' ') FROM split WHERE char <> ''
        )
      FROM Note
      WHERE NOT EXISTS (SELECT 1 FROM notes_fts WHERE notes_fts.id = Note.id);
    `)

    console.log('SQLite FTS5 (unigram) virtual table and triggers initialized successfully.')
  } catch (error) {
    console.error('Failed to initialize FTS5 database layers:', error)
  }
}
