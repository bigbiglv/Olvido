import type { AppConfig } from './config.types'

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  dataDir: '',
  theme: 'system',
  themeName: 'violet',
  windowBounds: {
    width: 1400,
    height: 900,
    maximized: false,
  },
  sidebarWidth: 256,
  docListWidth: 320,
  checkUpdateOnStartup: true,
}
