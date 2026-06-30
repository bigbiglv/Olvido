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

  private validateAndMerge(parsed: any): AppConfig {
    const merged: AppConfig = { ...DEFAULT_CONFIG, dataDir: this.config.dataDir }
    
    if (typeof parsed !== 'object' || parsed === null) {
      return merged
    }

    // 简单类型校验与合并
    if (typeof parsed.version === 'number') merged.version = parsed.version
    if (['light', 'dark', 'system'].includes(parsed.theme)) merged.theme = parsed.theme
    if (['violet', 'blue'].includes(parsed.themeName)) merged.themeName = parsed.themeName
    if (typeof parsed.language === 'string') merged.language = parsed.language
    if (typeof parsed.lastOpenProjectId === 'string' || parsed.lastOpenProjectId === null) merged.lastOpenProjectId = parsed.lastOpenProjectId
    if (typeof parsed.lastOpenNoteId === 'string' || parsed.lastOpenNoteId === null) merged.lastOpenNoteId = parsed.lastOpenNoteId
    if (typeof parsed.autoLaunch === 'boolean') merged.autoLaunch = parsed.autoLaunch
    if (typeof parsed.checkUpdateOnStartup === 'boolean') merged.checkUpdateOnStartup = parsed.checkUpdateOnStartup
    if (typeof parsed.sidebarWidth === 'number') merged.sidebarWidth = parsed.sidebarWidth
    if (typeof parsed.docListWidth === 'number') merged.docListWidth = parsed.docListWidth
    
    if (typeof parsed.windowBounds === 'object' && parsed.windowBounds !== null) {
      if (typeof parsed.windowBounds.width === 'number') merged.windowBounds.width = parsed.windowBounds.width
      if (typeof parsed.windowBounds.height === 'number') merged.windowBounds.height = parsed.windowBounds.height
      if (typeof parsed.windowBounds.x === 'number') merged.windowBounds.x = parsed.windowBounds.x
      if (typeof parsed.windowBounds.y === 'number') merged.windowBounds.y = parsed.windowBounds.y
      if (typeof parsed.windowBounds.maximized === 'boolean') merged.windowBounds.maximized = parsed.windowBounds.maximized
    }

    // version 自动升级可以在这里处理
    // if (merged.version < DEFAULT_CONFIG.version) {
    //   merged.version = DEFAULT_CONFIG.version
    // }

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
    // 深度合并
    if (partial.windowBounds) {
      this.config.windowBounds = {
        ...this.config.windowBounds,
        ...partial.windowBounds,
      }
    }
    
    this.config = {
      ...this.config,
      ...partial,
      windowBounds: this.config.windowBounds // 确保 windowBounds 是合并后的
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
