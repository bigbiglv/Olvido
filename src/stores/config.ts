import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppConfig } from '../../electron/config/config.types'
import { DEFAULT_CONFIG } from '../../electron/config/config.constants'

export const useConfigStore = defineStore('config', () => {
  // 缺省配置占位，真实数据会由 loadConfig 覆盖
  const config = ref<AppConfig>(structuredClone(DEFAULT_CONFIG))
  
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
    // 乐观更新：在当前 tick 立即生效，解决主题切换时 getter 读取到旧值的问题
    Object.assign(config.value, partial)

    if (!window.api?.config) {
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
