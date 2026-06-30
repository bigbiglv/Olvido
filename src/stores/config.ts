import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppConfig } from '../../electron/config/config.types'

export const useConfigStore = defineStore('config', () => {
  // 缺省配置占位，真实数据会由 loadConfig 覆盖
  const config = ref<AppConfig>({
    version: 1,
    dataDir: '',
    theme: 'system',
    themeName: 'violet',
    language: 'zh-CN',
    windowBounds: {
      width: 1400,
      height: 900,
      maximized: false
    },
    sidebarWidth: 256,
    docListWidth: 320,
    lastOpenProjectId: null,
    lastOpenNoteId: null,
    autoLaunch: false,
    checkUpdateOnStartup: true
  })
  
  const initialized = ref(false)

  const loadConfig = async () => {
    if (!window.api?.config) return
    const loaded = await window.api.config.get()
    if (loaded) {
      config.value = loaded
      initialized.value = true
    }
  }

  const updateConfig = async (partial: Partial<AppConfig>) => {
    if (!window.api?.config) {
      Object.assign(config.value, partial)
      return
    }
    const updated = await window.api.config.update(partial)
    if (updated) {
      config.value = updated
    }
  }

  const resetConfig = async () => {
    if (!window.api?.config) return
    const reset = await window.api.config.reset()
    if (reset) {
      config.value = reset
    }
  }

  return {
    config,
    initialized,
    loadConfig,
    updateConfig,
    resetConfig
  }
})
