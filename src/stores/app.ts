import { defineStore } from 'pinia'

import { applyTheme, isThemeMode, isThemeName, subscribeSystemThemeChange } from '@/theme'
import type { ThemeMode, ThemeName } from '@/theme'

interface AppState {
  themeName: ThemeName
  themeMode: ThemeMode
}

let stopSystemThemeSync: (() => void) | undefined

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    themeName: 'violet',
    themeMode: 'system',
  }),
  actions: {
    setThemeName(themeName: ThemeName) {
      this.themeName = themeName
      this.applyTheme()
    },
    setThemeMode(themeMode: ThemeMode) {
      this.themeMode = themeMode
      this.setupThemeSync()
    },
    setTheme(themeName: ThemeName, themeMode: ThemeMode) {
      this.themeName = themeName
      this.themeMode = themeMode
      this.setupThemeSync()
    },
    applyTheme() {
      applyTheme(this.themeName, this.themeMode)
    },
    setupThemeSync() {
      if (!isThemeName(this.themeName)) {
        this.themeName = 'violet'
      }

      if (!isThemeMode(this.themeMode)) {
        this.themeMode = 'system'
      }

      stopSystemThemeSync?.()
      stopSystemThemeSync = undefined

      this.applyTheme()

      if (this.themeMode === 'system') {
        // system 模式只监听系统色彩方案变化，持久化状态仍保持 themeMode: system。
        stopSystemThemeSync = subscribeSystemThemeChange(() => {
          this.applyTheme()
        })
      }
    },
  },
  persist: {
    key: 'frameai-app',
    pick: ['themeName', 'themeMode'],
  },
})
