import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import type { AppConfig } from './config.types'
import { DEFAULT_CONFIG } from './config.constants'

class ConfigService {
  private static instance: ConfigService
  private config: AppConfig
  private configPath: string

  private constructor() {
    // 决定 dataDir 的路径
    const isDev = !app.isPackaged
    // 开发环境下为了方便直接放到 prisma 目录，生产环境下放在 userData 目录
    const dataDir = isDev ? path.join(app.getAppPath(), 'prisma') : app.getPath('userData')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.configPath = path.join(dataDir, 'config.json')
    this.config = { ...DEFAULT_CONFIG, dataDir }
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  public load(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8')
        const parsed = JSON.parse(raw)
        
        // 类型检查与自动补齐，忽略未知字段
        this.config = this.validateAndMerge(parsed)
      } else {
        // 不存在自动创建
        this.save()
      }
    } catch (error) {
      console.error('Failed to load config, using default:', error)
      this.config = { ...DEFAULT_CONFIG, dataDir: this.config.dataDir }
      this.save()
    }
  }

  private validateAndMerge(parsed: unknown): AppConfig {
    const merged: AppConfig = { ...DEFAULT_CONFIG, dataDir: this.config.dataDir }
    if (typeof parsed !== 'object' || parsed === null) {
      return merged
    }
    const source = parsed as Record<string, unknown>
    for (const key of Object.keys(DEFAULT_CONFIG) as (keyof AppConfig)[]) {
      if (key === 'dataDir') continue // dataDir 始终由构造器决定
      const defaultVal = DEFAULT_CONFIG[key]
      const parsedVal = source[key]
      if (parsedVal === undefined) continue
      if (key === 'windowBounds') {
        // 嵌套对象特殊处理
        if (typeof parsedVal === 'object' && parsedVal !== null) {
          const wb = parsedVal as Record<string, unknown>
          const defaultWb = DEFAULT_CONFIG.windowBounds
          merged.windowBounds = {
            width: typeof wb.width === 'number' ? wb.width : defaultWb.width,
            height: typeof wb.height === 'number' ? wb.height : defaultWb.height,
            x: typeof wb.x === 'number' ? wb.x : undefined,
            y: typeof wb.y === 'number' ? wb.y : undefined,
            maximized: typeof wb.maximized === 'boolean' ? wb.maximized : defaultWb.maximized,
          }
        }
        continue
      }
      // 基本类型：类型匹配则采用，否则回退默认值
      // 允许 null（用于 nullable 字段如 lastOpenProjectId）
      if (parsedVal === null || typeof parsedVal === typeof defaultVal) {
        ;(merged as any)[key] = parsedVal
      }
    }
    return merged
  }

  public save(): void {
    try {
      const tempPath = this.configPath + '.tmp'
      const content = JSON.stringify(this.config, null, 2)
      // 原子写入
      fs.writeFileSync(tempPath, content, 'utf-8')
      fs.renameSync(tempPath, this.configPath)
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  public get(): Readonly<AppConfig> {
    // 返回深拷贝的只读对象
    return Object.freeze(JSON.parse(JSON.stringify(this.config)))
  }

  public set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
    this.save()
  }

  public update(partial: Partial<AppConfig>): void {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined && key in this.config) {
        const current = (this.config as any)[key]
        // 嵌套对象做浅合并，基本类型直接覆盖
        if (typeof current === 'object' && current !== null && typeof value === 'object' && value !== null && !Array.isArray(current)) {
          ;(this.config as any)[key] = { ...current, ...value }
        } else {
          ;(this.config as any)[key] = value
        }
      }
    }
    this.save()
  }

  public reset(): void {
    const { version, dataDir } = this.config
    this.config = {
      ...DEFAULT_CONFIG,
      version,
      dataDir,
    }
    this.save()
  }

  public reload(): void {
    this.load()
  }
}

export const configService = ConfigService.getInstance()
