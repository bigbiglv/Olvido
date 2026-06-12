import type { App } from 'vue'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { i18n } from '@/i18n'
import { router } from '@/router'
import { setupHttpInterceptors } from '@/services/http'
import { useAppStore } from '@/stores/app'

export function setupApp(app: App) {
  const pinia = createPinia()

  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  const appStore = useAppStore()

  appStore.setupLocaleSync()
  appStore.setupThemeSync()
  setupHttpInterceptors()
  app.use(router)
  app.use(i18n)
}
