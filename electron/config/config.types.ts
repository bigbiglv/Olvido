export interface AppConfig {
  version: number
  dataDir: string
  theme: 'light' | 'dark' | 'system'
  themeName: 'violet' | 'blue'
  windowBounds: {
    width: number
    height: number
    x?: number
    y?: number
    maximized: boolean
  }
  sidebarWidth: number
  docListWidth: number
  checkUpdateOnStartup: boolean
}
