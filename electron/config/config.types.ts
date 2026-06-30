export interface AppConfig {
  version: number
  dataDir: string
  theme: 'light' | 'dark' | 'system'
  themeName: 'violet' | 'blue'
  language: string
  windowBounds: {
    width: number
    height: number
    x?: number
    y?: number
    maximized: boolean
  }
  sidebarWidth: number
  docListWidth: number
  lastOpenProjectId: string | null
  lastOpenNoteId: string | null
  autoLaunch: boolean
  checkUpdateOnStartup: boolean
}
