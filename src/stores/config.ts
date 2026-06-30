import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppConfig } from '../../electron/config/config.types'
import { DEFAULT_CONFIG } from '../../electron/config/config.constants'

export const useConfigStore = defineStore('config', () => {
  // 缺省配置占位，真实数据会由 loadConfig 覆盖
  const config = ref<AppConfig>(structuredClone(DEFAULT_CONFIG))
  
  const initialized = ref(false)

  /**
   * 将远端返回的配置与默认值合并，确保不会因 IPC 数据不完整或
   * Object.freeze 导致字段缺失 / Vue 无法代理等问题。
   * 始终返回一个新的纯对象，保证 Vue 响应式正常工作。
   */
  const mergeWithDefaults = (source: Partial<AppConfig>): AppConfig => {
    return { ...structuredClone(DEFAULT_CONFIG), ...source }
  }

  const loadConfig = async () => {
    if (!window.api?.config) return
    const loaded = await window.api.config.get()
    if (loaded) {
      config.value = mergeWithDefaults(loaded)
      initialized.value = true
    }
  }

  const updateConfig = async (partial: Partial<AppConfig>) => {
    // 乐观更新：在当前 tick 立即生效，用新对象替换以确保触发响应式
    config.value = { ...config.value, ...partial }

    if (!window.api?.config) {
      return
    }
    const updated = await window.api.config.update(partial)
    if (updated) {
      config.value = mergeWithDefaults(updated)
    }
  }

  const resetConfig = async () => {
    if (!window.api?.config) return
    const reset = await window.api.config.reset()
    if (reset) {
      config.value = mergeWithDefaults(reset)
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
