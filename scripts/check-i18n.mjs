import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const SOURCE_LOCALE = 'zh-CN'
const TARGET_LOCALES = ['zh-HK', 'en-US']
const LOCALES_DIR = path.resolve('src/i18n/locales')

const errors = []

async function listJsonFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        return listJsonFiles(entryPath, baseDir)
      }

      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        return []
      }

      return [path.relative(baseDir, entryPath).replaceAll(path.sep, '/')]
    }),
  )

  return files.flat().sort()
}

async function readJson(filePath) {
  const content = (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '')

  try {
    const value = JSON.parse(content)

    if (!isPlainObject(value)) {
      errors.push(`${formatFile(filePath)} 根节点必须是 JSON object`)
      return {}
    }

    return value
  } catch (error) {
    errors.push(`${formatFile(filePath)} JSON 解析失败：${error.message}`)
    return {}
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectLeafKeys(value, prefix = '') {
  if (!isPlainObject(value)) {
    return [prefix]
  }

  return Object.keys(value)
    .sort()
    .flatMap((key) => collectLeafKeys(value[key], prefix ? `${prefix}.${key}` : key))
}

function formatFile(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, '/')
}

function compareKeys({ sourceFilePath, targetFilePath, targetLocale, sourceJson, targetJson }) {
  const sourceKeys = new Set(collectLeafKeys(sourceJson))
  const targetKeys = new Set(collectLeafKeys(targetJson))

  for (const key of sourceKeys) {
    if (!targetKeys.has(key)) {
      errors.push(
        `${formatFile(targetFilePath)} 缺少文案 key：${key}（基准：${formatFile(sourceFilePath)}）`,
      )
    }
  }

  for (const key of targetKeys) {
    if (!sourceKeys.has(key)) {
      errors.push(
        `${formatFile(targetFilePath)} 存在多余文案 key：${key}（${targetLocale} 应跟随 ${SOURCE_LOCALE}）`,
      )
    }
  }
}

async function main() {
  const sourceLocaleDir = path.join(LOCALES_DIR, SOURCE_LOCALE)
  const sourceFiles = await listJsonFiles(sourceLocaleDir)
  const sourceFileSet = new Set(sourceFiles)

  for (const targetLocale of TARGET_LOCALES) {
    const targetLocaleDir = path.join(LOCALES_DIR, targetLocale)
    const targetFiles = await listJsonFiles(targetLocaleDir)
    const targetFileSet = new Set(targetFiles)

    for (const sourceFile of sourceFiles) {
      const sourceFilePath = path.join(sourceLocaleDir, sourceFile)
      const targetFilePath = path.join(targetLocaleDir, sourceFile)

      if (!targetFileSet.has(sourceFile)) {
        errors.push(`${formatFile(targetFilePath)} 文件缺失（基准：${formatFile(sourceFilePath)}）`)
        continue
      }

      const [sourceJson, targetJson] = await Promise.all([
        readJson(sourceFilePath),
        readJson(targetFilePath),
      ])

      compareKeys({
        sourceFilePath,
        targetFilePath,
        targetLocale,
        sourceJson,
        targetJson,
      })
    }

    for (const targetFile of targetFiles) {
      if (!sourceFileSet.has(targetFile)) {
        errors.push(
          `${formatFile(path.join(targetLocaleDir, targetFile))} 是多余语言文件（${targetLocale} 应跟随 ${SOURCE_LOCALE}）`,
        )
      }
    }
  }

  if (errors.length > 0) {
    console.error(`i18n 文案完整性校验失败，共 ${errors.length} 个问题：`)
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }

  console.log(`i18n 文案完整性校验通过：${SOURCE_LOCALE} -> ${TARGET_LOCALES.join(', ')}`)
}

main().catch((error) => {
  console.error(`i18n 文案完整性校验异常：${error.message}`)
  process.exitCode = 1
})
